from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse, HTMLResponse
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import Optional

from app.database import get_db
from app.dependencies import PermissionChecker
from app.services.report_service import ReportService
from app.websocket_manager import manager

router = APIRouter(prefix="/reports", tags=["Reports, Analytics and Notifications Platform"])

@router.get(
    "/analytics/dashboard",
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def get_dashboard_analytics_summary(db: Session = Depends(get_db)):
    """
    Returns aggregated attendance percentages, weekly trend lines, AI accuracy rates, 
    and threat matrix indicators across all departments.
    """
    svc = ReportService(db)
    return svc.compile_dashboard_analytics()


@router.get(
    "/attendance/csv",
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def download_attendance_csv(
    department: Optional[str] = Query(None, description="Filter by student department"),
    start_date: Optional[str] = Query(None, description="ISO format start date, e.g. '2026-07-10'"),
    db: Session = Depends(get_db)
):
    """
    Generates and stream downloads a highly-detailed RFC-4180 compliant CSV of attendance checkins.
    """
    parsed_date = None
    if start_date:
        try:
            parsed_date = date.fromisoformat(start_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid ISO start_date parameter format."
            )
            
    svc = ReportService(db)
    csv_string = svc.generate_attendance_csv(department=department, start_date=parsed_date)
    
    filename = f"attendance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        iter([csv_string]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get(
    "/attendance/excel",
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def download_attendance_excel(
    department: Optional[str] = Query(None, description="Filter by student department"),
    db: Session = Depends(get_db)
):
    """
    Exports a colorful, styled Excel-compatible worksheet showing individual roster performance.
    """
    svc = ReportService(db)
    excel_bytes = svc.generate_attendance_excel_xml(department=department)
    
    filename = f"attendance_spreadsheet_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xls"
    
    return StreamingResponse(
        iter([excel_bytes]),
        media_type="application/vnd.ms-excel",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get(
    "/attendance/pdf",
    response_class=HTMLResponse,
    dependencies=[Depends(PermissionChecker(["View Cameras"]))]
)
def print_attendance_pdf_preview(
    department: Optional[str] = Query(None, description="Filter by student department"),
    db: Session = Depends(get_db)
):
    """
    Returns a responsive, beautifully-formatted print-ready layout that opens cleanly 
    for physical or PDF printing via modern browser print dialogues.
    """
    svc = ReportService(db)
    html_content = svc.generate_attendance_pdf_html(department=department)
    return HTMLResponse(content=html_content, status_code=200)


@router.post(
    "/trigger-test-alert",
    dependencies=[Depends(PermissionChecker(["Manage Cameras"]))]
)
async def trigger_manual_notification_alert(
    channel: str = Query(..., description="Target broadcast channel: 'email', 'push', 'websocket', 'all'"),
    recipient: str = Query("admin@facevision.ai", description="Alert receiver email or target topic"),
    alert_message: str = Query("Manual alert broadcast test triggered by control tower.", description="Brief description of the warning context")
):
    """
    Dispatches mock push notifications, system warning emails, and WebSocket alerts.
    Acts as the main messaging testbed for system operators.
    """
    notifications_sent = []
    
    # 1. Broadcaster WebSocket push
    if channel in ("websocket", "all"):
        payload = {
            "event": "OperatorBroadcastAlert",
            "message": alert_message,
            "sender": "Admin Control Tower",
            "timestamp": datetime.utcnow().isoformat()
        }
        await manager.broadcast(payload)
        notifications_sent.append("websocket_broadcast")
        
    # 2. Mock Email dispatcher
    if channel in ("email", "all"):
        # Simulated production email transporter logs
        import logging
        logger = logging.getLogger("facevision.notifications")
        logger.warning(f"SMTP SEND OUT -> TO: {recipient} | SUBJECT: FaceVision Emergency Notice | BODY: {alert_message}")
        notifications_sent.append("email_smtp")
        
    # 3. Mock Push Notifications
    if channel in ("push", "all"):
        # Simulated mobile push notification provider (e.g., Firebase Cloud Messaging)
        import logging
        logger = logging.getLogger("facevision.notifications")
        logger.warning(f"FCM PUSH -> TOPIC: {recipient} | MESSAGE: {alert_message}")
        notifications_sent.append("mobile_push_fcm")

    return {
        "success": True,
        "message": "Manual alerts dispatched successfully.",
        "channels_processed": notifications_sent,
        "timestamp": datetime.utcnow()
    }
