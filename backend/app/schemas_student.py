from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class StudentBase(BaseModel):
    student_id: str = Field(..., description="Unique alpha-numeric student enrollment code.")
    roll_number: str = Field(..., description="Unique campus-assigned roll sequence identifier.")
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    
    # Academics
    department: str
    course: str
    program: str
    academic_year: str
    semester: str
    year: int = Field(..., ge=1, le=8)
    section: Optional[str] = None
    group: Optional[str] = None
    batch: Optional[str] = None
    
    # Guardian / Emergency
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    
    # Status & AI features
    student_photo: Optional[str] = None
    attendance_percentage: float = Field(0.0, ge=0.0, le=100.0)
    face_registered: bool = False
    status: str = "active"

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    
    department: Optional[str] = None
    course: Optional[str] = None
    program: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[str] = None
    year: Optional[int] = Field(None, ge=1, le=8)
    section: Optional[str] = None
    group: Optional[str] = None
    batch: Optional[str] = None
    
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    
    student_photo: Optional[str] = None
    attendance_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    face_registered: Optional[bool] = None
    status: Optional[str] = None

class StudentResponse(StudentBase):
    id: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StudentPaginatedResponse(BaseModel):
    total: int
    page: int
    size: int
    pages: int
    items: List[StudentResponse]

class BulkImportResponse(BaseModel):
    successful: int
    failed: int
    errors: List[str]
