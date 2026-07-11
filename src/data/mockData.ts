import { Student, AttendanceRecord, UnknownFace, ActivityLog, SystemStats, AppUser } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'st-1',
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.io',
    department: 'Engineering',
    studentId: 'FV-2026-042',
    status: 'active',
    registrationDate: '2026-03-12',
    imagesCount: 5,
    faceConfidence: 98.4,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    role: 'ML Engineer'
  },
  {
    id: 'st-2',
    name: 'Marcus Wright',
    email: 'marcus.wright@cyberdyne.io',
    department: 'Operations',
    studentId: 'FV-2026-089',
    status: 'active',
    registrationDate: '2026-04-18',
    imagesCount: 6,
    faceConfidence: 96.1,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    role: 'DevOps Lead'
  },
  {
    id: 'st-3',
    name: 'John Connor',
    email: 'john.connor@cyberdyne.io',
    department: 'Engineering',
    studentId: 'FV-2026-001',
    status: 'active',
    registrationDate: '2026-01-05',
    imagesCount: 8,
    faceConfidence: 99.5,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    role: 'Security Specialist'
  },
  {
    id: 'st-4',
    name: 'Katherine Brewster',
    email: 'kate.b@cyberdyne.io',
    department: 'Product Management',
    studentId: 'FV-2026-112',
    status: 'active',
    registrationDate: '2026-05-20',
    imagesCount: 4,
    faceConfidence: 94.8,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    role: 'Product Owner'
  },
  {
    id: 'st-5',
    name: 'Miles Dyson',
    email: 'miles.dyson@cyberdyne.io',
    department: 'Research & Dev',
    studentId: 'FV-2026-005',
    status: 'active',
    registrationDate: '2025-11-10',
    imagesCount: 12,
    faceConfidence: 99.9,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    role: 'Director of AI Research'
  },
  {
    id: 'st-6',
    name: 'Elena Rostova',
    email: 'elena.rostova@cyberdyne.io',
    department: 'Human Resources',
    studentId: 'FV-2026-215',
    status: 'active',
    registrationDate: '2026-06-01',
    imagesCount: 5,
    faceConfidence: 95.2,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    role: 'HR Specialist'
  },
  {
    id: 'st-7',
    name: 'T-800 Model 101',
    email: 'cyberdyne.t800@cyberdyne.io',
    department: 'Research & Dev',
    studentId: 'FV-2026-800',
    status: 'inactive',
    registrationDate: '2026-02-14',
    imagesCount: 1,
    faceConfidence: 89.1,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    role: 'Cybernetic Organizer'
  },
  {
    id: 'st-8',
    name: 'Robert Brewster',
    email: 'robert.b@cyberdyne.io',
    department: 'Operations',
    studentId: 'FV-2026-103',
    status: 'active',
    registrationDate: '2026-04-02',
    imagesCount: 5,
    faceConfidence: 92.4,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    role: 'System Administrator'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    studentId: 'FV-2026-005',
    studentName: 'Miles Dyson',
    department: 'Research & Dev',
    timestamp: '2026-07-11T08:14:22-07:00',
    status: 'present',
    confidence: 99.8,
    verificationType: 'face',
    temperature: '98.2°F',
    maskWorn: false
  },
  {
    id: 'att-2',
    studentId: 'FV-2026-001',
    studentName: 'John Connor',
    department: 'Engineering',
    timestamp: '2026-07-11T08:29:10-07:00',
    status: 'present',
    confidence: 99.4,
    verificationType: 'face',
    temperature: '97.9°F',
    maskWorn: true
  },
  {
    id: 'att-3',
    studentId: 'FV-2026-042',
    studentName: 'Sarah Connor',
    department: 'Engineering',
    timestamp: '2026-07-11T08:35:45-07:00',
    status: 'present',
    confidence: 98.6,
    verificationType: 'face',
    temperature: '98.4°F',
    maskWorn: false
  },
  {
    id: 'att-4',
    studentId: 'FV-2026-112',
    studentName: 'Katherine Brewster',
    department: 'Product Management',
    timestamp: '2026-07-11T08:55:12-07:00',
    status: 'late',
    confidence: 95.1,
    verificationType: 'face',
    temperature: '98.1°F',
    maskWorn: false
  },
  {
    id: 'att-5',
    studentId: 'FV-2026-089',
    studentName: 'Marcus Wright',
    department: 'Operations',
    timestamp: '2026-07-11T09:02:19-07:00',
    status: 'late',
    confidence: 97.2,
    verificationType: 'face',
    temperature: '98.6°F',
    maskWorn: true
  },
  {
    id: 'att-6',
    studentId: 'FV-2026-103',
    studentName: 'Robert Brewster',
    department: 'Operations',
    timestamp: '2026-07-11T09:12:00-07:00',
    status: 'present',
    confidence: 91.8,
    verificationType: 'manual',
    temperature: '98.0°F',
    maskWorn: false
  }
];

export const INITIAL_UNKNOWN_FACES: UnknownFace[] = [
  {
    id: 'uk-1',
    timestamp: '2026-07-11T08:44:11-07:00',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    confidence: 42.1,
    cameraLocation: 'Main Entrance Lobby (Cam-01)',
    status: 'unresolved'
  },
  {
    id: 'uk-2',
    timestamp: '2026-07-11T09:18:50-07:00',
    imageUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=300',
    confidence: 38.5,
    cameraLocation: 'Research Lab Wing (Cam-04)',
    status: 'unresolved'
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    timestamp: '2026-07-11T09:20:12-07:00',
    user: 'shabberahammad10@gmail.com',
    action: 'Settings Change',
    status: 'info',
    details: 'Modified Face Recognition Threshold from 0.85 to 0.90'
  },
  {
    id: 'act-2',
    timestamp: '2026-07-11T09:05:40-07:00',
    user: 'System Monitor',
    action: 'Unknown Face Alert',
    status: 'warning',
    details: 'Unrecognized individual detected near high-security Lab 4 Entrance'
  },
  {
    id: 'act-3',
    timestamp: '2026-07-11T08:42:00-07:00',
    user: 'shabberahammad10@gmail.com',
    action: 'Add Student',
    status: 'success',
    details: 'Successfully registered student Robert Brewster with 5 biometric snapshots'
  },
  {
    id: 'act-4',
    timestamp: '2026-07-11T08:00:00-07:00',
    user: 'System Bot',
    action: 'Daily Initialization',
    status: 'success',
    details: 'Face recognition weights loaded (YOLOv8-Face & InsightFace engine active)'
  }
];

export const INITIAL_USER: AppUser = {
  name: 'Shabber Ahammad',
  email: 'shabberahammad10@gmail.com',
  role: 'Super Admin',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  companyName: 'Cyberdyne Systems Corp'
};

// Graphical Data
export const WEEKLY_ATTENDANCE_CHART = [
  { day: 'Mon', present: 88, late: 10, absent: 2 },
  { day: 'Tue', present: 92, late: 5, absent: 3 },
  { day: 'Wed', present: 94, late: 4, absent: 2 },
  { day: 'Thu', present: 91, late: 7, absent: 2 },
  { day: 'Fri', present: 85, late: 12, absent: 3 },
  { day: 'Sat', present: 45, late: 3, absent: 52 },
  { day: 'Sun', present: 10, late: 1, absent: 89 }
];

export const MONTHLY_ATTENDANCE_TREND = [
  { name: 'Jan', rate: 91.2, accuracy: 98.4 },
  { name: 'Feb', rate: 92.8, accuracy: 98.5 },
  { name: 'Mar', rate: 94.1, accuracy: 98.9 },
  { name: 'Apr', rate: 95.3, accuracy: 99.1 },
  { name: 'May', rate: 93.9, accuracy: 99.2 },
  { name: 'Jun', rate: 96.2, accuracy: 99.4 },
  { name: 'Jul', rate: 95.8, accuracy: 99.6 }
];

export const DEPARTMENT_COMPARISON_CHART = [
  { department: 'Engineering', present: 98, count: 42 },
  { department: 'Research & Dev', present: 100, count: 28 },
  { department: 'Operations', present: 94, count: 35 },
  { department: 'Product', present: 91, count: 18 },
  { department: 'Human Resources', present: 88, count: 12 }
];

export const FAQ_DATA = [
  {
    question: 'How does the face recognition match with such high accuracy?',
    answer: 'FaceVision AI combines a state-of-the-art YOLOv8-Face model for rapid real-time multi-face detection with an InsightFace (ResNet50 backbone) biometric feature extractor. This extracts 512-dimensional vector embeddings, which are matched using cosine similarity in fractions of a millisecond.'
  },
  {
    question: 'Can the system operate with multiple live camera feeds concurrently?',
    answer: 'Yes, our architecture supports multi-camera RTSP pipelines that run server-side. Each camera feed is processed in parallel, logging face detections into the central cloud-synced database instantly.'
  },
  {
    question: 'How do we register a new student or employee?',
    answer: 'Simply go to the "Face Registration" tab. You can record using any standard live webcam or upload 3-5 images of the user. Our AI engine conducts real-time face quality, head angle (pitch, yaw, roll), and illumination checks to guarantee high matching accuracy.'
  },
  {
    question: 'What happens when an unknown face is spotted?',
    answer: 'The system triggers an "Unknown Face Alert" in the Live Feed and saves the face crop as an unresolved token. Administrators can instantly click to register them as a new user, assign them to an existing profile, or ignore the alert.'
  }
];
