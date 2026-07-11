import io
import csv
from datetime import datetime, date, timedelta
from typing import List, Tuple, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import (
    AttendanceSession, Attendance, AttendanceLog, ManualAttendance,
    AttendanceCorrection, LeaveRequest, AttendanceSummary, Student, User
)
from app.repositories.attendance import AttendanceRepository
from app.repositories.student import StudentRepository
from app.schemas_attendance import (
    AttendanceSessionCreate, AttendanceMarkRequest, AttendanceManualRequest,
    AttendanceUpdateRequest, CorrectionCreateRequest, LeaveRequestCreate
)
from app.websocket_manager import manager

# Configurable business logic thresholds
CONFIDENCE_THRESHOLD = 75.0
LATE_THRESHOLD_MINUTES = 10

class AttendanceService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = AttendanceRepository(db)
        self.student_repository = StudentRepository(db)

    # --- SESSIONS PIPELINES ---

    async def start_attendance_session(self, schema: AttendanceSessionCreate, faculty_id: str) -> AttendanceSession:
        """Starts a class attendance window, broadcasting an AttendanceSessionStarted socket event."""
        # Check active session duplicates for the same class and slot
        existing = self.repository.get_latest_active_session(schema.class_id)
        if existing and existing.period == schema.period:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Attendance session for class '{schema.class_id}' during period '{schema.period}' is already open."
            )

        session = self.repository.create_session(schema, faculty_id)
        
        # Trigger WS Event
        await manager.broadcast({
            "event": "AttendanceSessionStarted",
            "session_id": session.id,
            "class_id": session.class_id,
            "subject_id": session.subject_id,
            "period": session.period,
            "expires_at": session.end_time.isoformat()
        }, group=session.class_id)

        return session

    async def stop_attendance_session(self, session_id: str) -> AttendanceSession:
        """Closes a session manually, broadcasting an AttendanceSessionStopped socket event."""
        session = self.repository.get_session_by_id(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target attendance session was not found."
            )
        
        updated_session = self.repository.update_session_status(session, "completed")
        
        await manager.broadcast({
            "event": "AttendanceSessionStopped",
            "session_id": updated_session.id,
            "class_id": updated_session.class_id,
            "status": updated_session.status
        }, group=updated_session.class_id)

        return updated_session

    # --- CORE AUTOMATIC AI ATTENDANCE MARKING ---

    async def mark_ai_attendance(self, schema: AttendanceMarkRequest) -> Attendance:
        """Processes real-time facial recognition feeds, applying confidence thresholds and matching active sessions."""
        # 1. Verify student exists
        student = self.student_repository.get_by_id(schema.student_id)
        if not student:
            # Maybe student_id was academic ID instead of internal UUID, try that
            student = self.student_repository.get_by_student_id(schema.student_id)
            if not student:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Student enrollment record not found."
                )

        # 2. Match active session
        session = None
        if schema.session_id:
            session = self.repository.get_session_by_id(schema.session_id)
        else:
            session = self.repository.get_latest_active_session(student.class_id if hasattr(student, 'class_id') else student.course)

        if not session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active attendance session is currently open for this student's class."
            )

        # 3. Check session locks
        if session.is_locked or session.status in ("completed", "locked"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attendance window has expired or has been locked."
            )

        # 4. Check for duplicates
        existing_record = self.repository.get_student_attendance_for_session(student.id, session.id)
        if existing_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Duplicate Attendance Error: Student is already registered in this session."
            )

        # 5. Check holiday status
        if self.is_today_holiday():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attendance registration is blocked on holidays."
            )

        # 6. Check leave integration
        active_leave = self.repository.get_student_active_leave(student.id, date.today())
        if active_leave:
            # Student is on approved leave, so mark as excused automatically
            record = self.repository.mark_attendance(
                student_id=student.id,
                session_id=session.id,
                status="excused",
                confidence=schema.confidence,
                remarks=f"Auto-excused: Approved {active_leave.leave_type}"
            )
            return record

        # 7. Apply Recognition Confidence Thresholds
        if schema.confidence >= CONFIDENCE_THRESHOLD:
            # Mark Present
            # Check for late entry detection
            is_late = False
            minutes_elapsed = (datetime.utcnow() - session.start_time).total_seconds() / 60
            if minutes_elapsed > LATE_THRESHOLD_MINUTES:
                is_late = True

            record = self.repository.mark_attendance(
                student_id=student.id,
                session_id=session.id,
                status="late" if is_late else "present",
                confidence=schema.confidence,
                is_late=is_late
            )
            
            # Log successful recognition attempt
            self.repository.create_log(
                session_id=session.id,
                student_id=student.id,
                raw_image_path=schema.raw_image_path,
                confidence=schema.confidence,
                status="success"
            )

            # Trigger Websocket Events
            await manager.broadcast({
                "event": "AttendanceMarked",
                "attendance_id": record.id,
                "student_id": student.id,
                "full_name": student.full_name,
                "status": record.status,
                "confidence": record.confidence
            }, group=session.class_id)

            await manager.broadcast({
                "event": "RecognitionCompleted",
                "student_id": student.id,
                "confidence": schema.confidence,
                "status": "success"
            })

            # Update summaries synchronously
            self.repository.update_attendance_summary(student.id, session.subject_id)
            return record

        else:
            # Confidence is below threshold: Store for Manual Review
            self.repository.create_log(
                session_id=session.id,
                student_id=student.id,
                raw_image_path=schema.raw_image_path,
                confidence=schema.confidence,
                status="low_confidence"
            )

            await manager.broadcast({
                "event": "UnknownFaceDetected" if schema.confidence < 40 else "RecognitionCompleted",
                "student_id": student.id,
                "confidence": schema.confidence,
                "status": "low_confidence",
                "message": "Recognition confidence below validation parameters. Sent for manual verification."
            })

            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Recognition confidence too low. Record sent to manual review logs."
            )

    # --- MANUAL OVERRIDES AND CORRECTIONS ---

    async def mark_manual_attendance(self, schema: AttendanceManualRequest, faculty_id: str) -> Attendance:
        """Saves a manual student attendance entry with supervisor notes."""
        student = self.student_repository.get_by_id(schema.student_id)
        if not student:
            student = self.student_repository.get_by_student_id(schema.student_id)
            if not student:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Student enrollment record not found."
                )

        session = self.repository.get_session_by_id(schema.session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attendance session not found."
            )

        # Allow duplicate overwrite if manual override is requested
        existing = self.repository.get_student_attendance_for_session(student.id, session.id)
        if existing:
            # Overwrite existing record
            record = self.repository.update_attendance_record(
                existing,
                status=schema.status,
                is_manual=True,
                marked_by=faculty_id,
                remarks=schema.reason
            )
        else:
            record = self.repository.mark_attendance(
                student_id=student.id,
                session_id=session.id,
                status=schema.status,
                confidence=100.0,
                is_manual=True,
                marked_by=faculty_id,
                remarks=schema.reason
            )

        # Track the change in manual_attendance ledger
        self.repository.create_manual_override(record.id, faculty_id, schema.reason)

        await manager.broadcast({
            "event": "AttendanceUpdated",
            "attendance_id": record.id,
            "student_id": student.id,
            "status": record.status,
            "is_manual": True
        }, group=session.class_id)

        # Update Summaries
        self.repository.update_attendance_summary(student.id, session.subject_id)
        return record

    async def update_attendance(self, schema: AttendanceUpdateRequest, faculty_id: str) -> Attendance:
        """Updates a specific attendance record status directly."""
        record = self.repository.get_record(schema.attendance_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attendance record not found."
            )

        session = self.repository.get_session_by_id(record.session_id)
        session_subject = session.subject_id if session else "CS101"

        updated = self.repository.update_attendance_record(
            record,
            status=schema.status,
            is_manual=True,
            marked_by=faculty_id,
            remarks=schema.reason
        )

        self.repository.create_manual_override(updated.id, faculty_id, schema.reason)

        # Update stats
        self.repository.update_attendance_summary(updated.student_id, session_subject)
        return updated

    def delete_attendance(self, attendance_id: str) -> dict:
        """Deletes an attendance record cleanly and updates statistics."""
        record = self.repository.get_record(attendance_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attendance record not found."
            )
        session_id = record.session_id
        student_id = record.student_id

        session = self.repository.get_session_by_id(session_id) if session_id else None
        subject_id = session.subject_id if session else "CS101"

        self.repository.delete_attendance_record(record)
        self.repository.update_attendance_summary(student_id, subject_id)

        return {"message": "Attendance record deleted successfully."}

    # --- LEAVE REQUEST PIPELINES ---

    def apply_leave_request(self, schema: LeaveRequestCreate) -> LeaveRequest:
        """Submits a student leave petition."""
        student = self.student_repository.get_by_id(schema.student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student record not found."
            )
        return self.repository.create_leave_request(schema)

    def review_leave_request(self, leave_id: str, approved: bool, officer_id: str) -> LeaveRequest:
        """Approves/rejects a leave request, updating all overlapping attendance entries to 'excused' if approved."""
        leave = self.repository.get_leave_request_by_id(leave_id)
        if not leave:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Leave request not found."
            )

        target_status = "approved" if approved else "rejected"
        updated_leave = self.repository.update_leave_status(leave, target_status, officer_id)

        if approved:
            # Retroactively excuse any overlapping absent/unexcused sessions
            records = self.db.query(Attendance).filter(
                and_(
                    Attendance.student_id == leave.student_id,
                    Attendance.marked_at >= datetime.combine(leave.start_date, datetime.min.time()),
                    Attendance.marked_at <= datetime.combine(leave.end_date, datetime.max.time())
                )
            ).all()

            for record in records:
                self.repository.update_attendance_record(
                    record,
                    status="excused",
                    is_manual=True,
                    marked_by=officer_id,
                    remarks=f"Leave application approved: {leave.leave_type}"
                )
                session = self.repository.get_session_by_id(record.session_id)
                if session:
                    self.repository.update_attendance_summary(leave.student_id, session.subject_id)

        return updated_leave

    # --- ATTENDANCE CORRECTIONS PIPELINES ---

    def request_correction(self, schema: CorrectionCreateRequest, student_id: str) -> AttendanceCorrection:
        """Allows students to challenge and request corrections on their attendance."""
        record = self.repository.get_record(schema.attendance_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attendance record to correct was not found."
            )
        return self.repository.create_correction(schema, student_id)

    def review_correction(self, correction_id: str, approved: bool, officer_id: str, rejection_reason: Optional[str] = None) -> AttendanceCorrection:
        """Approves or rejects a correction request."""
        correction = self.repository.get_correction_by_id(correction_id)
        if not correction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Correction application not found."
            )

        target_status = "approved" if approved else "rejected"
        updated_correction = self.repository.update_correction(correction, target_status, officer_id, rejection_reason)

        if approved:
            record = self.repository.get_record(correction.attendance_id)
            if record:
                self.repository.update_attendance_record(
                    record,
                    status=correction.requested_status,
                    is_manual=True,
                    marked_by=officer_id,
                    remarks=f"Correction approved by supervisor. Original reason: {correction.reason}"
                )
                session = self.repository.get_session_by_id(record.session_id)
                if session:
                    self.repository.update_attendance_summary(correction.student_id, session.subject_id)

        return updated_correction

    # --- REPORTS AND SHUTTLES ---

    def get_student_report(self, student_id: str) -> dict:
        """Compiles student-specific performance report card across all subjects."""
        student = self.student_repository.get_by_id(student_id)
        if not student:
            student = self.student_repository.get_by_student_id(student_id)
            if not student:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Student enrollment record not found."
                )

        records = self.repository.get_student_history(student.id)
        total_sessions = len(records)
        present = sum(1 for r in records if r.status == "present")
        late = sum(1 for r in records if r.status == "late")
        absent = sum(1 for r in records if r.status == "absent")
        excused = sum(1 for r in records if r.status == "excused")

        # Subject-wise breakdown
        summaries = self.db.query(AttendanceSummary).filter(AttendanceSummary.student_id == student.id).all()
        breakdown = []
        for s in summaries:
            breakdown.append({
                "subject_id": s.subject_id,
                "total_sessions": s.total_sessions,
                "attended_sessions": s.attended_sessions,
                "attendance_percentage": s.attendance_percentage
            })

        return {
            "student_id": student.student_id,
            "full_name": student.full_name,
            "roll_number": student.roll_number,
            "department": student.department,
            "overall_attendance_percentage": student.attendance_percentage,
            "total_present": present,
            "total_late": late,
            "total_absent": absent,
            "total_excused": excused,
            "total_sessions": total_sessions,
            "subjects_breakdown": breakdown
        }

    def get_class_report(self, class_id: str) -> dict:
        """Aggregates all students under a class to form an academic roster report."""
        students = self.db.query(Student).filter(
            and_(
                Student.department == class_id,
                Student.is_deleted == False
            )
        ).all()
        if not students:
            # Fallback search as a department or course filter
            students = self.db.query(Student).filter(
                and_(
                    or_(
                        Student.section == class_id,
                        Student.department == class_id
                    ),
                    Student.is_deleted == False
                )
            ).all()

        if not students:
            return {
                "class_id": class_id,
                "total_students": 0,
                "average_attendance": 0.0,
                "student_roster": []
            }

        roster = []
        total_pct = 0.0
        for s in students:
            total_pct += s.attendance_percentage
            roster.append({
                "student_id": s.student_id,
                "full_name": s.full_name,
                "roll_number": s.roll_number,
                "attendance_percentage": s.attendance_percentage,
                "status": s.status
            })

        return {
            "class_id": class_id,
            "total_students": len(students),
            "average_attendance": round(total_pct / len(students), 2),
            "student_roster": roster
        }

    def get_today_report(self) -> dict:
        """Fetches flat stats matching today's check-ins."""
        records = self.repository.get_today_attendance()
        total = len(records)
        present = sum(1 for r in records if r.status == "present")
        late = sum(1 for r in records if r.status == "late")
        absent = sum(1 for r in records if r.status == "absent")
        excused = sum(1 for r in records if r.status == "excused")

        return {
            "date": date.today().isoformat(),
            "total_marked": total,
            "present": present,
            "late": late,
            "absent": absent,
            "excused": excused
        }

    def export_attendance_csv(self, class_id: Optional[str] = None) -> io.StringIO:
        """Dumps selected attendance ledger entries into a flat CSV downloadable stream."""
        query = self.db.query(Attendance).join(
            Student, Attendance.student_id == Student.id
        )
        if class_id:
            query = query.join(
                AttendanceSession, Attendance.session_id == AttendanceSession.id
            ).filter(AttendanceSession.class_id == class_id)

        records = query.order_by(desc(Attendance.marked_at)).all()
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            "attendance_id", "student_id", "student_name", "roll_number",
            "session_id", "status", "marked_at", "confidence", "is_manual", "remarks"
        ])
        writer.writeheader()

        for r in records:
            student = self.student_repository.get_by_id(r.student_id)
            writer.writerow({
                "attendance_id": r.id,
                "student_id": student.student_id if student else "",
                "student_name": student.full_name if student else "",
                "roll_number": student.roll_number if student else "",
                "session_id": r.session_id or "N/A",
                "status": r.status,
                "marked_at": r.marked_at.isoformat(),
                "confidence": r.confidence or 100.0,
                "is_manual": r.is_manual,
                "remarks": r.remarks or ""
            })

        output.seek(0)
        return output

    # --- HELPER UTILS ---

    def is_today_holiday(self) -> bool:
        """Holiday manager check helper."""
        # Configurable / list lookup (e.g. weekends or specific holidays calendar)
        today = date.today()
        # Sundays are automatic holidays
        if today.weekday() == 6:
            return True
        return False
