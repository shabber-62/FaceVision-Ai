from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from datetime import datetime, date, timedelta
from typing import List, Tuple, Optional
from app.models import (
    AttendanceSession, Attendance, AttendanceLog, ManualAttendance,
    AttendanceCorrection, LeaveRequest, AttendanceSummary, Student
)
from app.schemas_attendance import (
    AttendanceSessionCreate, AttendanceMarkRequest, AttendanceManualRequest,
    AttendanceUpdateRequest, CorrectionCreateRequest, LeaveRequestCreate
)

class AttendanceRepository:
    def __init__(self, db: Session):
        self.db = db

    # --- ATTENDANCE SESSION OPERATIONS ---

    def create_session(self, schema: AttendanceSessionCreate, faculty_id: str) -> AttendanceSession:
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(minutes=schema.duration_minutes)
        
        session = AttendanceSession(
            faculty_id=faculty_id,
            class_id=schema.class_id,
            subject_id=schema.subject_id,
            period=schema.period,
            start_time=start_time,
            end_time=end_time,
            status="active",
            is_locked=False
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_session_by_id(self, session_id: str) -> Optional[AttendanceSession]:
        return self.db.query(AttendanceSession).filter(AttendanceSession.id == session_id).first()

    def get_latest_active_session(self, class_id: str) -> Optional[AttendanceSession]:
        now = datetime.utcnow()
        return self.db.query(AttendanceSession).filter(
            and_(
                AttendanceSession.class_id == class_id,
                AttendanceSession.status == "active",
                AttendanceSession.start_time <= now,
                AttendanceSession.end_time >= now,
                AttendanceSession.is_locked == False
            )
        ).order_by(desc(AttendanceSession.created_at)).first()

    def get_active_sessions(self) -> List[AttendanceSession]:
        now = datetime.utcnow()
        return self.db.query(AttendanceSession).filter(
            and_(
                AttendanceSession.status == "active",
                AttendanceSession.end_time >= now,
                AttendanceSession.is_locked == False
            )
        ).all()

    def update_session_status(self, session: AttendanceSession, status: str) -> AttendanceSession:
        session.status = status
        if status == "locked" or status == "completed":
            session.is_locked = True
        self.db.commit()
        self.db.refresh(session)
        return session

    # --- ATTENDANCE RECORDS OPERATIONS ---

    def get_record(self, record_id: str) -> Optional[Attendance]:
        return self.db.query(Attendance).filter(Attendance.id == record_id).first()

    def get_student_attendance_for_session(self, student_id: str, session_id: str) -> Optional[Attendance]:
        return self.db.query(Attendance).filter(
            and_(
                Attendance.student_id == student_id,
                Attendance.session_id == session_id
            )
        ).first()

    def mark_attendance(
        self,
        student_id: str,
        session_id: Optional[str],
        status: str,
        confidence: Optional[float],
        is_manual: bool = False,
        marked_by: Optional[str] = None,
        remarks: Optional[str] = None,
        is_late: bool = False,
        is_early_exit: bool = False
    ) -> Attendance:
        record = Attendance(
            session_id=session_id,
            student_id=student_id,
            status=status,
            confidence=confidence,
            marked_at=datetime.utcnow(),
            is_manual=is_manual,
            marked_by=marked_by,
            remarks=remarks,
            is_late=is_late,
            is_early_exit=is_early_exit
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def update_attendance_record(self, record: Attendance, status: str, is_manual: bool, marked_by: str, remarks: str) -> Attendance:
        record.status = status
        record.is_manual = is_manual
        record.marked_by = marked_by
        record.remarks = remarks
        self.db.commit()
        self.db.refresh(record)
        return record

    def delete_attendance_record(self, record: Attendance) -> None:
        self.db.delete(record)
        self.db.commit()

    # --- ATTENDANCE LOG OPERATIONS ---

    def create_log(self, session_id: Optional[str], student_id: Optional[str], raw_image_path: Optional[str], confidence: Optional[float], status: str) -> AttendanceLog:
        log = AttendanceLog(
            session_id=session_id,
            student_id=student_id,
            raw_image_path=raw_image_path,
            confidence=confidence,
            status=status,
            created_at=datetime.utcnow()
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    # --- MANUAL OVERRIDE LOG OPERATIONS ---

    def create_manual_override(self, attendance_id: str, faculty_id: str, reason: str) -> ManualAttendance:
        override = ManualAttendance(
            attendance_id=attendance_id,
            faculty_id=faculty_id,
            reason=reason
        )
        self.db.add(override)
        self.db.commit()
        self.db.refresh(override)
        return override

    # --- CORRECTIONS OPERATIONS ---

    def create_correction(self, schema: CorrectionCreateRequest, student_id: str) -> AttendanceCorrection:
        correction = AttendanceCorrection(
            attendance_id=schema.attendance_id,
            student_id=student_id,
            requested_status=schema.requested_status,
            reason=schema.reason,
            status="pending"
        )
        self.db.add(correction)
        self.db.commit()
        self.db.refresh(correction)
        return correction

    def get_correction_by_id(self, correction_id: str) -> Optional[AttendanceCorrection]:
        return self.db.query(AttendanceCorrection).filter(AttendanceCorrection.id == correction_id).first()

    def update_correction(self, correction: AttendanceCorrection, status: str, approved_by: Optional[str], rejection_reason: Optional[str] = None) -> AttendanceCorrection:
        correction.status = status
        correction.approved_by = approved_by
        correction.rejection_reason = rejection_reason
        correction.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(correction)
        return correction

    # --- LEAVE MANAGEMENT INTEGRATION ---

    def create_leave_request(self, schema: LeaveRequestCreate) -> LeaveRequest:
        leave = LeaveRequest(
            student_id=schema.student_id,
            start_date=schema.start_date,
            end_date=schema.end_date,
            leave_type=schema.leave_type,
            reason=schema.reason,
            status="pending"
        )
        self.db.add(leave)
        self.db.commit()
        self.db.refresh(leave)
        return leave

    def get_leave_request_by_id(self, leave_id: str) -> Optional[LeaveRequest]:
        return self.db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()

    def update_leave_status(self, leave: LeaveRequest, status: str, approved_by: str) -> LeaveRequest:
        leave.status = status
        leave.approved_by = approved_by
        self.db.commit()
        self.db.refresh(leave)
        return leave

    def get_student_active_leave(self, student_id: str, target_date: date) -> Optional[LeaveRequest]:
        return self.db.query(LeaveRequest).filter(
            and_(
                LeaveRequest.student_id == student_id,
                LeaveRequest.status == "approved",
                LeaveRequest.start_date <= target_date,
                LeaveRequest.end_date >= target_date
            )
        ).first()

    # --- ATTENDANCE SUMMARY OPERATIONS ---

    def get_summary(self, student_id: str, subject_id: str) -> Optional[AttendanceSummary]:
        return self.db.query(AttendanceSummary).filter(
            and_(
                AttendanceSummary.student_id == student_id,
                AttendanceSummary.subject_id == subject_id
            )
        ).first()

    def update_attendance_summary(self, student_id: str, subject_id: str) -> AttendanceSummary:
        # Calculate statistics
        records = self.db.query(Attendance).join(
            AttendanceSession, Attendance.session_id == AttendanceSession.id
        ).filter(
            and_(
                Attendance.student_id == student_id,
                AttendanceSession.subject_id == subject_id
            )
        ).all()

        total = len(records)
        attended = sum(1 for r in records if r.status in ("present", "late"))
        pct = (attended / total * 100.0) if total > 0 else 100.0

        summary = self.get_summary(student_id, subject_id)
        if not summary:
            summary = AttendanceSummary(
                student_id=student_id,
                subject_id=subject_id,
                total_sessions=total,
                attended_sessions=attended,
                attendance_percentage=pct
            )
            self.db.add(summary)
        else:
            summary.total_sessions = total
            summary.attended_sessions = attended
            summary.attendance_percentage = pct
            summary.updated_at = datetime.utcnow()
            
        self.db.commit()
        self.db.refresh(summary)

        # Update student global attendance average as well
        all_summaries = self.db.query(AttendanceSummary).filter(AttendanceSummary.student_id == student_id).all()
        if all_summaries:
            global_pct = sum(s.attendance_percentage for s in all_summaries) / len(all_summaries)
            student = self.db.query(Student).filter(Student.id == student_id).first()
            if student:
                student.attendance_percentage = global_pct
                self.db.commit()

        return summary

    # --- REPORTING PIPELINES ---

    def get_student_history(self, student_id: str) -> List[Attendance]:
        return self.db.query(Attendance).filter(Attendance.student_id == student_id).order_by(desc(Attendance.marked_at)).all()

    def get_class_attendance(self, class_id: str) -> List[Attendance]:
        return self.db.query(Attendance).join(
            AttendanceSession, Attendance.session_id == AttendanceSession.id
        ).filter(AttendanceSession.class_id == class_id).all()

    def get_today_attendance(self) -> List[Attendance]:
        start_of_today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        return self.db.query(Attendance).filter(Attendance.marked_at >= start_of_today).all()
