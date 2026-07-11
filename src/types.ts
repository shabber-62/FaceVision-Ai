export interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  studentId: string;
  status: 'active' | 'inactive';
  registrationDate: string;
  imagesCount: number;
  faceConfidence: number; // Quality percentage
  avatarUrl?: string;
  role: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  timestamp: string;
  status: 'present' | 'absent' | 'late';
  confidence: number; // Face recognition confidence
  verificationType: 'face' | 'manual' | 'bypass';
  temperature?: string; // High-end feature
  maskWorn?: boolean;
}

export interface UnknownFace {
  id: string;
  timestamp: string;
  imageUrl: string;
  confidence: number;
  cameraLocation: string;
  status: 'unresolved' | 'identified' | 'ignored';
  resolvedName?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: 'success' | 'warning' | 'danger' | 'info';
  details: string;
}

export interface SystemStats {
  todayAttendanceRate: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  accuracyRate: number;
  registeredFaces: number;
  unknownFacesCount: number;
  systemHealth: 'optimal' | 'warning' | 'degraded';
}

export interface CameraConfig {
  deviceId: string;
  resolution: string;
  fps: number;
  confidenceThreshold: number;
  recognitionInterval: number; // ms
  enableUnknownAlerts: boolean;
  modelType: 'YOLOv8-Face' | 'InsightFace-ResNet50' | 'FaceNet-Mobile';
}

export interface AppUser {
  name: string;
  email: string;
  role: 'Admin' | 'Faculty' | 'Student' | 'Security' | 'Super Admin';
  avatarUrl: string;
  companyName: string;
  studentId?: string;
  facultyId?: string;
  phoneNumber?: string;
  department?: string;
  course?: string;
  year?: string;
  section?: string;
  registrationDate?: string;
}
