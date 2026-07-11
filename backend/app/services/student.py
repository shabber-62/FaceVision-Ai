import io
import csv
from PIL import Image
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, status
from typing import List, Tuple, Optional
from datetime import datetime

from app.models import Student
from app.repositories.student import StudentRepository
from app.schemas_student import StudentCreate, StudentUpdate, BulkImportResponse

class StudentService:
    def __init__(self, db: Session):
        self.repository = StudentRepository(db)

    def create_student(self, schema: StudentCreate) -> Student:
        """Handles student creation with unique checks across core constraints."""
        if self.repository.get_by_student_id(schema.student_id, include_deleted=True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Duplicate Student ID error: '{schema.student_id}' already exists."
            )
        if self.repository.get_by_roll_number(schema.roll_number, include_deleted=True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Duplicate Roll Number error: '{schema.roll_number}' already exists."
            )
        if self.repository.get_by_email(schema.email, include_deleted=True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Duplicate Email Address error: '{schema.email}' already belongs to a registered student."
            )
        return self.repository.create(schema)

    def update_student(self, id: str, schema: StudentUpdate) -> Student:
        """Updates targeted fields safely validating new values against duplicates."""
        student = self.repository.get_by_id(id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student profile not found."
            )
            
        # Verify unique student ID constraints if modified
        if schema.student_id and schema.student_id != student.student_id:
            if self.repository.get_by_student_id(schema.student_id, include_deleted=True):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Student ID '{schema.student_id}' is claimed by another student."
                )
                
        # Verify unique Roll Number constraints if modified
        if schema.roll_number and schema.roll_number != student.roll_number:
            if self.repository.get_by_roll_number(schema.roll_number, include_deleted=True):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Roll Number '{schema.roll_number}' is claimed by another student."
                )
                
        # Verify unique Email address constraints if modified
        if schema.email and schema.email.lower() != student.email:
            if self.repository.get_by_email(schema.email, include_deleted=True):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Email '{schema.email}' is claimed by another student."
                )
                
        return self.repository.update(student, schema)

    def get_student_by_id(self, id: str) -> Student:
        """Fetches active student profile by ID."""
        student = self.repository.get_by_id(id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile matching ID '{id}' was not found."
            )
        return student

    def get_student_by_roll_number(self, roll_number: str) -> Student:
        """Fetches active student profile by roll number."""
        student = self.repository.get_by_roll_number(roll_number)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile matching Roll Number '{roll_number}' was not found."
            )
        return student

    def delete_student(self, id: str) -> Student:
        """Applies soft-delete flags to Student profile."""
        student = self.repository.get_by_id(id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student profile not found."
            )
        return self.repository.soft_delete(student)

    def restore_student(self, id: str) -> Student:
        """Restores a logical soft-deleted student registry back to active."""
        student = self.repository.get_by_id(id, include_deleted=True)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student profile was not found in the archives."
            )
        if not student.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This student profile is already active."
            )
        return self.repository.restore(student)

    def search_students(self, **kwargs) -> Tuple[List[Student], int]:
        """Routes search queries to repository search interface."""
        return self.repository.search_and_filter(**kwargs)

    # --- UPLOADS AND IMAGE COMPRESSION ---

    def process_and_compress_photo(self, file: UploadFile) -> bytes:
        """Enforces type validation and downsamples image to 800x800 limits at 85% JPEG quality."""
        allowed_types = {"image/jpeg", "image/jpg", "image/png"}
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{file.content_type}'. Must be JPG, JPEG, or PNG."
            )
        
        try:
            content = file.file.read()
            img = Image.open(io.BytesIO(content))
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not decode image file stream. The file may be corrupted."
            )
            
        # Downsize image dimensions to save database size and loading latency
        max_bounds = (800, 800)
        img.thumbnail(max_bounds, Image.Resampling.LANCZOS)
        
        # Save output bytes stream
        buffer = io.BytesIO()
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(buffer, format="JPEG", quality=85, optimize=True)
        return buffer.getvalue()

    # --- CSV BULK IMPORT / EXPORT SHUTTLES ---

    def bulk_import_csv(self, file: UploadFile) -> BulkImportResponse:
        """Bulk-imports student files transactional row-by-row reporting precise row errors."""
        if not file.filename.endswith(".csv"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Filename extension mismatch. Please provide a comma-separated CSV file."
            )
            
        try:
            content = file.file.read().decode("utf-8")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to decode file encoding. Verify it is UTF-8 encoded."
            )
            
        reader = csv.DictReader(io.StringIO(content))
        successful = 0
        failed = 0
        errors = []
        
        for index, row in enumerate(reader, start=1):
            try:
                # Essential mandatory data parameters check
                student_id = row.get("student_id")
                roll_number = row.get("roll_number")
                full_name = row.get("full_name")
                email = row.get("email")
                department = row.get("department")
                course = row.get("course")
                program = row.get("program")
                academic_year = row.get("academic_year")
                semester = row.get("semester")
                year_str = row.get("year")
                
                if not all([student_id, roll_number, full_name, email, department, course, program, academic_year, semester, year_str]):
                    raise ValueError("Row lacks one or more mandatory core student attributes.")
                    
                year = int(year_str)
                
                # Check for database unique constraints to prevent crashes
                if self.repository.get_by_student_id(student_id, include_deleted=True):
                    raise ValueError(f"Student ID '{student_id}' is already registered.")
                if self.repository.get_by_roll_number(roll_number, include_deleted=True):
                    raise ValueError(f"Roll Number '{roll_number}' is already registered.")
                if self.repository.get_by_email(email, include_deleted=True):
                    raise ValueError(f"Email '{email}' is already registered.")
                    
                # Setup validated creation DTO
                schema = StudentCreate(
                    student_id=student_id,
                    roll_number=roll_number,
                    full_name=full_name,
                    email=email,
                    phone=row.get("phone") or None,
                    dob=row.get("dob") or None,
                    gender=row.get("gender") or None,
                    blood_group=row.get("blood_group") or None,
                    address=row.get("address") or None,
                    department=department,
                    course=course,
                    program=program,
                    academic_year=academic_year,
                    semester=semester,
                    year=year,
                    section=row.get("section") or None,
                    group=row.get("group") or None,
                    batch=row.get("batch") or None,
                    guardian_name=row.get("guardian_name") or None,
                    guardian_phone=row.get("guardian_phone") or None,
                    emergency_contact=row.get("emergency_contact") or None,
                    attendance_percentage=float(row.get("attendance_percentage") or 0.0),
                    face_registered=row.get("face_registered", "false").lower() == "true",
                    status=row.get("status") or "active"
                )
                
                self.repository.create(schema)
                successful += 1
            except Exception as e:
                failed += 1
                errors.append(f"Row {index}: {str(e)}")
                
        return BulkImportResponse(
            successful=successful,
            failed=failed,
            errors=errors
        )

    def bulk_export_csv_stream(self, students: List[Student]) -> io.StringIO:
        """Dumps student payload list into flat comma-separated CSV stream."""
        output = io.StringIO()
        field_headers = [
            "student_id", "roll_number", "full_name", "email", "phone", "dob", "gender",
            "blood_group", "address", "department", "course", "program", "academic_year",
            "semester", "year", "section", "group", "batch", "guardian_name", "guardian_phone",
            "emergency_contact", "attendance_percentage", "face_registered", "status", "created_at"
        ]
        
        writer = csv.DictWriter(output, fieldnames=field_headers)
        writer.writeheader()
        
        for s in students:
            writer.writerow({
                "student_id": s.student_id,
                "roll_number": s.roll_number,
                "full_name": s.full_name,
                "email": s.email,
                "phone": s.phone or "",
                "dob": s.dob or "",
                "gender": s.gender or "",
                "blood_group": s.blood_group or "",
                "address": s.address or "",
                "department": s.department,
                "course": s.course,
                "program": s.program,
                "academic_year": s.academic_year,
                "semester": s.semester,
                "year": s.year,
                "section": s.section or "",
                "group": s.group or "",
                "batch": s.batch or "",
                "guardian_name": s.guardian_name or "",
                "guardian_phone": s.guardian_phone or "",
                "emergency_contact": s.emergency_contact or "",
                "attendance_percentage": s.attendance_percentage,
                "face_registered": s.face_registered,
                "status": s.status,
                "created_at": s.created_at.isoformat()
            })
            
        output.seek(0)
        return output
