from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc
from datetime import datetime
from typing import List, Tuple, Optional
from app.models import Student
from app.schemas_student import StudentCreate, StudentUpdate

class StudentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, id: str, include_deleted: bool = False) -> Optional[Student]:
        """Fetches student by technical database primary key UUID."""
        query = self.db.query(Student).filter(Student.id == id)
        if not include_deleted:
            query = query.filter(Student.is_deleted == False)
        return query.first()

    def get_by_student_id(self, student_id: str, include_deleted: bool = False) -> Optional[Student]:
        """Fetches student by unique academic student ID code."""
        query = self.db.query(Student).filter(Student.student_id == student_id)
        if not include_deleted:
            query = query.filter(Student.is_deleted == False)
        return query.first()

    def get_by_roll_number(self, roll_number: str, include_deleted: bool = False) -> Optional[Student]:
        """Fetches student by campus Roll Number sequence."""
        query = self.db.query(Student).filter(Student.roll_number == roll_number)
        if not include_deleted:
            query = query.filter(Student.is_deleted == False)
        return query.first()

    def get_by_email(self, email: str, include_deleted: bool = False) -> Optional[Student]:
        """Fetches student by email address."""
        query = self.db.query(Student).filter(Student.email == email.lower())
        if not include_deleted:
            query = query.filter(Student.is_deleted == False)
        return query.first()

    def create(self, schema: StudentCreate) -> Student:
        """Saves a new student record into postgres tables."""
        student = Student(**schema.model_dump())
        self.db.add(student)
        self.db.commit()
        self.db.refresh(student)
        return student

    def update(self, student: Student, schema: StudentUpdate) -> Student:
        """Performs incremental updates of profile and academic details."""
        update_data = schema.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(student, key, value)
        student.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(student)
        return student

    def soft_delete(self, student: Student) -> Student:
        """Applies logical soft-deletion tags to preserve reference safety cascades."""
        student.is_deleted = True
        student.deleted_at = datetime.utcnow()
        student.status = "inactive"
        self.db.commit()
        self.db.refresh(student)
        return student

    def restore(self, student: Student) -> Student:
        """Restores a soft-deleted student profile back to active registers."""
        student.is_deleted = False
        student.deleted_at = None
        student.status = "active"
        self.db.commit()
        self.db.refresh(student)
        return student

    def search_and_filter(
        self,
        search_query: Optional[str] = None,
        department: Optional[str] = None,
        course: Optional[str] = None,
        year: Optional[int] = None,
        semester: Optional[str] = None,
        section: Optional[str] = None,
        group: Optional[str] = None,
        status: Optional[str] = None,
        face_registered: Optional[bool] = None,
        min_attendance: Optional[float] = None,
        max_attendance: Optional[float] = None,
        include_deleted: bool = False,
        page: int = 1,
        size: int = 20,
        sort_by: str = "full_name",
        sort_order: str = "asc"
    ) -> Tuple[List[Student], int]:
        """Provides enterprise searching, column-level filtering, sorting, and cursor-pagination."""
        query = self.db.query(Student)
        
        # Soft delete logic
        if not include_deleted:
            query = query.filter(Student.is_deleted == False)
            
        # Multi-column free search matching
        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(
                or_(
                    Student.full_name.ilike(search_pattern),
                    Student.roll_number.ilike(search_pattern),
                    Student.student_id.ilike(search_pattern),
                    Student.department.ilike(search_pattern),
                    Student.course.ilike(search_pattern),
                    Student.status.ilike(search_pattern),
                    Student.email.ilike(search_pattern)
                )
            )
            
        # Individual field-level structured filters
        if department:
            query = query.filter(Student.department == department)
        if course:
            query = query.filter(Student.course == course)
        if year is not None:
            query = query.filter(Student.year == year)
        if semester:
            query = query.filter(Student.semester == semester)
        if section:
            query = query.filter(Student.section == section)
        if group:
            query = query.filter(Student.group == group)
        if status:
            query = query.filter(Student.status == status)
        if face_registered is not None:
            query = query.filter(Student.face_registered == face_registered)
        if min_attendance is not None:
            query = query.filter(Student.attendance_percentage >= min_attendance)
        if max_attendance is not None:
            query = query.filter(Student.attendance_percentage <= max_attendance)
            
        # Determine sorting column
        sort_attr = getattr(Student, sort_by, Student.full_name)
        if sort_order.lower() == "desc":
            query = query.order_by(desc(sort_attr))
        else:
            query = query.order_by(asc(sort_attr))
            
        # Fetch counters and slice arrays
        total = query.count()
        offset = (page - 1) * size
        items = query.offset(offset).limit(size).all()
        
        return items, total
