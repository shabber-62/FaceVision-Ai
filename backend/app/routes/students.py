import math
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.dependencies import PermissionChecker
from app.schemas_student import (
    StudentCreate, StudentUpdate, StudentResponse, StudentPaginatedResponse, BulkImportResponse
)
from app.services.student import StudentService

router = APIRouter(prefix="/students", tags=["Student Profile Management"])

@router.post(
    "", 
    response_model=StudentResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionChecker(["Create Students"]))]
)
def create_student(schema: StudentCreate, db: Session = Depends(get_db)):
    """Creates a new student registry. Requires 'Create Students' permission."""
    service = StudentService(db)
    return service.create_student(schema)


@router.get(
    "/search", 
    response_model=StudentPaginatedResponse,
    dependencies=[Depends(PermissionChecker(["View Students"]))]
)
def search_students(
    search_query: Optional[str] = Query(None, alias="q", description="Global text search across name, ID, roll, email"),
    department: Optional[str] = Query(None, description="Filter by department"),
    course: Optional[str] = Query(None, description="Filter by course"),
    year: Optional[int] = Query(None, description="Filter by year"),
    semester: Optional[str] = Query(None, description="Filter by academic semester"),
    section: Optional[str] = Query(None, description="Filter by section"),
    group: Optional[str] = Query(None, description="Filter by group"),
    status: Optional[str] = Query(None, description="Filter by status (active/suspended)"),
    face_registered: Optional[bool] = Query(None, description="Filter by face registration status"),
    min_attendance: Optional[float] = Query(None, description="Minimum attendance percentage"),
    max_attendance: Optional[float] = Query(None, description="Maximum attendance percentage"),
    include_deleted: bool = Query(False, description="Whether to include soft-deleted archives"),
    page: int = Query(1, ge=1, description="Page index"),
    size: int = Query(20, ge=1, le=100, description="Page size limit"),
    sort_by: str = Query("full_name", description="Property field for sorting"),
    sort_order: str = Query("asc", description="Order parameter ('asc' or 'desc')"),
    db: Session = Depends(get_db)
):
    """Searches and filters students dynamically with pagination and column sorting."""
    service = StudentService(db)
    items, total = service.search_students(
        search_query=search_query,
        department=department,
        course=course,
        year=year,
        semester=semester,
        section=section,
        group=group,
        status=status,
        face_registered=face_registered,
        min_attendance=min_attendance,
        max_attendance=max_attendance,
        include_deleted=include_deleted,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_order=sort_order
    )
    pages = math.ceil(total / size) if total > 0 else 1
    return StudentPaginatedResponse(
        total=total,
        page=page,
        size=size,
        pages=pages,
        items=items
    )


@router.get(
    "", 
    response_model=StudentPaginatedResponse,
    dependencies=[Depends(PermissionChecker(["View Students"]))]
)
def list_students(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("full_name"),
    sort_order: str = Query("asc"),
    db: Session = Depends(get_db)
):
    """Lists students with pagination. Equivalent to search with no search parameters."""
    return search_students(page=page, size=size, sort_by=sort_by, sort_order=sort_order, db=db)


@router.get(
    "/export",
    dependencies=[Depends(PermissionChecker(["View Students"]))]
)
def export_students(
    search_query: Optional[str] = Query(None, alias="q"),
    department: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Exports all matching student records into a downloadable CSV file stream."""
    service = StudentService(db)
    # Fetch all records without page limit size parameters
    items, _ = service.search_students(
        search_query=search_query,
        department=department,
        course=course,
        year=year,
        status=status,
        page=1,
        size=1000000 # large limit to capture all matches
    )
    
    stream = service.bulk_export_csv_stream(items)
    
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=students_export.csv"
    return response


@router.get(
    "/{id}", 
    response_model=StudentResponse,
    dependencies=[Depends(PermissionChecker(["View Students"]))]
)
def get_student(id: str, db: Session = Depends(get_db)):
    """Retrieves an active student profile by database primary ID key."""
    service = StudentService(db)
    return service.get_student_by_id(id)


@router.get(
    "/roll/{roll_number}", 
    response_model=StudentResponse,
    dependencies=[Depends(PermissionChecker(["View Students"]))]
)
def get_student_by_roll(roll_number: str, db: Session = Depends(get_db)):
    """Retrieves an active student profile by unique Roll Number."""
    service = StudentService(db)
    return service.get_student_by_roll_number(roll_number)


@router.put(
    "/{id}", 
    response_model=StudentResponse,
    dependencies=[Depends(PermissionChecker(["Edit Students"]))]
)
def update_student(id: str, schema: StudentUpdate, db: Session = Depends(get_db)):
    """Updates selected parameters on a student profile."""
    service = StudentService(db)
    return service.update_student(id, schema)


@router.delete(
    "/{id}", 
    response_model=StudentResponse,
    dependencies=[Depends(PermissionChecker(["Delete Students"]))]
)
def delete_student(id: str, db: Session = Depends(get_db)):
    """Logical soft-deletion of a student record from query listings."""
    service = StudentService(db)
    return service.delete_student(id)


@router.patch(
    "/{id}/restore", 
    response_model=StudentResponse,
    dependencies=[Depends(PermissionChecker(["Edit Students"]))]
)
def restore_student(id: str, db: Session = Depends(get_db)):
    """Restores a logically soft-deleted student registry back into circulation."""
    service = StudentService(db)
    return service.restore_student(id)


@router.post(
    "/bulk-import", 
    response_model=BulkImportResponse,
    dependencies=[Depends(PermissionChecker(["Create Students"]))]
)
def bulk_import_students(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Transactional parsing of CSV rows creating multiple student profiles."""
    service = StudentService(db)
    return service.bulk_import_csv(file)


@router.post(
    "/{id}/photo", 
    response_model=StudentResponse,
    dependencies=[Depends(PermissionChecker(["Edit Students"]))]
)
def upload_student_photo(id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Uploads, validates, compresses, and registers a student profile picture."""
    service = StudentService(db)
    # Check if student exists
    student = service.get_student_by_id(id)
    
    # Process photo compression
    compressed_bytes = service.process_and_compress_photo(file)
    
    # In production, save to cloud storage or local persistent bucket.
    # Here we simulate saving by updating the student_photo attribute to a storage marker path
    file_path_marker = f"/static/uploads/photos/{student.student_id}.jpg"
    
    schema = StudentUpdate(student_photo=file_path_marker)
    return service.update_student(id, schema)
