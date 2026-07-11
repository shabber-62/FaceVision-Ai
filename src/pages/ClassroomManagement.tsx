import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building,
  Layers,
  Video,
  User,
  Users,
  Sparkles,
  Zap,
  Activity,
  AlertCircle,
  Play,
  Square,
  RefreshCw,
  Plus,
  ArrowRight,
  Maximize2,
  Minimize2,
  Trash2,
  BookOpen,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle,
  X,
  Sliders,
  Tv,
  Smartphone,
  Eye,
  EyeOff,
  UserCheck,
  Search,
  FileText,
  Compass,
  CornerRightDown,
  Lock,
  Workflow
} from 'lucide-react';
import { Student } from '../types';

interface ClassroomManagementProps {
  students?: Student[];
  onAddRecognitionLog?: (record: any) => void;
  onAddUnknownAlert?: (alert: any) => void;
  onNavigate?: (page: string) => void;
}

// Interfaces for our Classroom & Room Management data models
interface Classroom {
  id: string;
  roomNumber: string;
  roomName: string;
  department: string;
  building: string;
  floor: string;
  capacity: number;
  studentCount: number;
  status: 'active' | 'scheduled' | 'idle' | 'maintenance';
  
  // Timetable
  currentSubject: string;
  currentFaculty: string;
  facultyEmail: string;
  startTime: string;
  endTime: string;
  nextClass: string;
  workingHours: string;
  facultyStatus: 'online' | 'offline' | 'on-leave';

  // Biometrics & AI Configuration
  aiEnabled: boolean;
  attendanceEnabled: boolean;
  recognitionAccuracy: number;
  faceDetectionCount: number;
  yoloStatus: 'active' | 'standby';
  insightFaceStatus: 'active' | 'standby';

  // Camera Assignments
  cameras: {
    front: string;
    rear: string;
    entrance: string;
    exit: string;
    ceiling: string;
  };
  activeCameraType: 'front' | 'rear' | 'entrance' | 'exit' | 'ceiling';

  // Student details assigned to this room batch
  studentBatch: {
    course: string;
    year: string;
    semester: string;
    section: string;
    group: string;
    batchCode: string;
    rollRange: string;
  };

  // Seats coordinates and occupancy
  seats: {
    id: string;
    row: number;
    col: number;
    studentId?: string;
    studentName?: string;
    status: 'present' | 'absent' | 'empty';
  }[];
}

interface BuildingNode {
  name: string;
  code: string;
  floors: number;
  roomsCount: number;
  status: 'operational' | 'restricted' | 'maintenance';
}

interface FloorNode {
  floorNumber: string;
  roomsCount: number;
  availableCount: number;
  occupiedCount: number;
}

export default function ClassroomManagement({
  students = [],
  onAddRecognitionLog,
  onAddUnknownAlert,
  onNavigate
}: ClassroomManagementProps) {

  // Mock Students Database for Room assignment
  const fallbackStudents: Student[] = [
    { id: '1', name: 'Alexander Wright', studentId: 'FV-2026-081', email: 'alex@vision.edu', department: 'Engineering', status: 'active', registrationDate: '2026-01-10', imagesCount: 10, faceConfidence: 98.4, role: 'Student', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150' },
    { id: '2', name: 'Sophia Sterling', studentId: 'FV-2026-042', email: 'sophia@vision.edu', department: 'Computer Science', status: 'active', registrationDate: '2026-02-14', imagesCount: 12, faceConfidence: 99.2, role: 'Student', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
    { id: '3', name: 'Marcus Sterling', studentId: 'FV-2026-015', email: 'marcus@vision.edu', department: 'Engineering', status: 'active', registrationDate: '2026-02-28', imagesCount: 10, faceConfidence: 95.8, role: 'Student', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
    { id: '4', name: 'Elena Rostova', studentId: 'FV-2026-097', email: 'elena@vision.edu', department: 'Arts & Humanities', status: 'active', registrationDate: '2026-03-01', imagesCount: 15, faceConfidence: 97.6, role: 'Student', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
  ];

  const actualStudents = students.length > 0 ? students : fallbackStudents;

  // Initial Classrooms data seed
  const [classrooms, setClassrooms] = useState<Classroom[]>([
    {
      id: 'ROOM-101',
      roomNumber: '101',
      roomName: 'Neural Computing Lab',
      department: 'Computer Science',
      building: 'Administration Block',
      floor: '1st Floor',
      capacity: 32,
      studentCount: 28,
      status: 'active',
      currentSubject: 'Deep Learning & Neural Nets',
      currentFaculty: 'Dr. Evelyn Carter',
      facultyEmail: 'evelyn.carter@vision.edu',
      startTime: '09:00 AM',
      endTime: '11:30 AM',
      nextClass: 'Computer Vision Algorithms',
      workingHours: '09:00 AM - 05:00 PM',
      facultyStatus: 'online',
      aiEnabled: true,
      attendanceEnabled: true,
      recognitionAccuracy: 99.4,
      faceDetectionCount: 26,
      yoloStatus: 'active',
      insightFaceStatus: 'active',
      cameras: {
        front: 'CAM-01-F',
        rear: 'CAM-01-R',
        entrance: 'CAM-01-ENT',
        exit: 'CAM-01-EXT',
        ceiling: 'CAM-01-C'
      },
      activeCameraType: 'front',
      studentBatch: {
        course: 'M.Tech CSE',
        year: '2nd Year',
        semester: '3rd Semester',
        section: 'Neural-A',
        group: 'Group A1',
        batchCode: 'CSE-2026-N1',
        rollRange: 'CSE-101 to CSE-132'
      },
      seats: [
        { id: 'S1-1', row: 1, col: 1, studentId: '1', studentName: 'Alexander Wright', status: 'present' },
        { id: 'S1-2', row: 1, col: 2, studentId: '2', studentName: 'Sophia Sterling', status: 'present' },
        { id: 'S1-3', row: 1, col: 3, studentId: '3', studentName: 'Marcus Sterling', status: 'present' },
        { id: 'S1-4', row: 1, col: 4, studentId: '4', studentName: 'Elena Rostova', status: 'present' },
        { id: 'S2-1', row: 2, col: 1, status: 'absent' },
        { id: 'S2-2', row: 2, col: 2, status: 'empty' },
        { id: 'S2-3', row: 2, col: 3, status: 'present' },
        { id: 'S2-4', row: 2, col: 4, status: 'absent' },
        { id: 'S3-1', row: 3, col: 1, status: 'present' },
        { id: 'S3-2', row: 3, col: 2, status: 'empty' },
        { id: 'S3-3', row: 3, col: 3, status: 'present' },
        { id: 'S3-4', row: 3, col: 4, status: 'present' },
      ]
    },
    {
      id: 'ROOM-204',
      roomNumber: '204',
      roomName: 'Robotics Engineering Space',
      department: 'Engineering',
      building: 'Engineering Wing',
      floor: '2nd Floor',
      capacity: 40,
      studentCount: 35,
      status: 'scheduled',
      currentSubject: 'Mechatronics & Kinematics',
      currentFaculty: 'Prof. Julian Vance',
      facultyEmail: 'julian.vance@vision.edu',
      startTime: '12:00 PM',
      endTime: '02:30 PM',
      nextClass: 'Autonomous Navigation',
      workingHours: '10:00 AM - 04:00 PM',
      facultyStatus: 'online',
      aiEnabled: true,
      attendanceEnabled: true,
      recognitionAccuracy: 98.7,
      faceDetectionCount: 14,
      yoloStatus: 'active',
      insightFaceStatus: 'standby',
      cameras: {
        front: 'CAM-04-F',
        rear: 'CAM-04-R',
        entrance: 'CAM-04-ENT',
        exit: 'CAM-04-EXT',
        ceiling: 'CAM-04-C'
      },
      activeCameraType: 'entrance',
      studentBatch: {
        course: 'B.Tech Robotics',
        year: '3rd Year',
        semester: '5th Semester',
        section: 'Robo-B',
        group: 'Group R2',
        batchCode: 'ROB-2026-Y3',
        rollRange: 'ROB-201 to ROB-240'
      },
      seats: [
        { id: 'S1-1', row: 1, col: 1, studentId: '1', studentName: 'Alexander Wright', status: 'present' },
        { id: 'S1-2', row: 1, col: 2, status: 'absent' },
        { id: 'S1-3', row: 1, col: 3, status: 'empty' },
        { id: 'S1-4', row: 1, col: 4, status: 'present' },
        { id: 'S2-1', row: 2, col: 1, status: 'present' },
        { id: 'S2-2', row: 2, col: 2, status: 'present' },
        { id: 'S2-3', row: 2, col: 3, status: 'absent' },
        { id: 'S2-4', row: 2, col: 4, status: 'present' },
      ]
    },
    {
      id: 'ROOM-302',
      roomNumber: '302',
      roomName: 'Bio-Informatics Seminar Hall',
      department: 'General Sciences',
      building: 'Science Block',
      floor: '3rd Floor',
      capacity: 50,
      studentCount: 42,
      status: 'idle',
      currentSubject: 'Genomics Modeling',
      currentFaculty: 'Dr. Clara Oswald',
      facultyEmail: 'clara.oswald@vision.edu',
      startTime: '03:00 PM',
      endTime: '04:30 PM',
      nextClass: 'Computational Proteomics',
      workingHours: '08:00 AM - 04:00 PM',
      facultyStatus: 'offline',
      aiEnabled: false,
      attendanceEnabled: false,
      recognitionAccuracy: 95.1,
      faceDetectionCount: 0,
      yoloStatus: 'standby',
      insightFaceStatus: 'standby',
      cameras: {
        front: 'CAM-02-F',
        rear: 'CAM-02-R',
        entrance: 'CAM-02-ENT',
        exit: 'CAM-02-EXT',
        ceiling: 'CAM-02-C'
      },
      activeCameraType: 'ceiling',
      studentBatch: {
        course: 'B.Sc Biotech',
        year: '1st Year',
        semester: '1st Semester',
        section: 'Bio-Alpha',
        group: 'Group B1',
        batchCode: 'BIO-2026-F1',
        rollRange: 'BIO-301 to BIO-350'
      },
      seats: [
        { id: 'S1-1', row: 1, col: 1, status: 'empty' },
        { id: 'S1-2', row: 1, col: 2, status: 'empty' },
        { id: 'S1-3', row: 1, col: 3, status: 'empty' },
        { id: 'S1-4', row: 1, col: 4, status: 'empty' },
      ]
    },
    {
      id: 'ROOM-110',
      roomNumber: '110',
      roomName: 'Auditorium Magna',
      department: 'Administration',
      building: 'Administration Block',
      floor: 'Ground Floor',
      capacity: 150,
      studentCount: 110,
      status: 'maintenance',
      currentSubject: 'System Maintenance Window',
      currentFaculty: 'Admin Operations',
      facultyEmail: 'admin@vision.edu',
      startTime: '08:00 AM',
      endTime: '08:00 PM',
      nextClass: 'None',
      workingHours: '24 Hours',
      facultyStatus: 'on-leave',
      aiEnabled: false,
      attendanceEnabled: false,
      recognitionAccuracy: 0,
      faceDetectionCount: 0,
      yoloStatus: 'standby',
      insightFaceStatus: 'standby',
      cameras: {
        front: 'CAM-09-F',
        rear: 'CAM-09-R',
        entrance: 'CAM-09-ENT',
        exit: 'CAM-09-EXT',
        ceiling: 'CAM-09-C'
      },
      activeCameraType: 'front',
      studentBatch: {
        course: 'All Departments',
        year: 'Multi-Batch',
        semester: 'N/A',
        section: 'N/A',
        group: 'N/A',
        batchCode: 'AUD-ALL',
        rollRange: 'N/A'
      },
      seats: [
        { id: 'S1-1', row: 1, col: 1, status: 'empty' }
      ]
    }
  ]);

  // Active Selected Room ID for detailed preview
  const [selectedRoomId, setSelectedRoomId] = useState<string>('ROOM-101');
  const activeRoom = classrooms.find(r => r.id === selectedRoomId) || classrooms[0];

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('All');

  // Interactive camera controls
  const [isRecording, setIsRecording] = useState(false);
  const [recDuration, setRecDuration] = useState(0);
  const [screenshots, setScreenshots] = useState<{ id: string; url: string; time: string }[]>([]);
  const [cameraSwitchingActive, setCameraSwitchingActive] = useState(false);

  // Permission / Media states
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [hasCameraError, setHasCameraError] = useState(false);
  
  // Real Webcam constraints
  const webcamRef = useRef<Webcam>(null);

  // Modals visibility toggles
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAssignCameraModal, setShowAssignCameraModal] = useState(false);
  const [showAssignFacultyModal, setShowAssignFacultyModal] = useState(false);

  // Forms states
  // Add Classroom Form
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDept, setNewRoomDept] = useState('Computer Science');
  const [newRoomBuilding, setNewRoomBuilding] = useState('Administration Block');
  const [newRoomFloor, setNewRoomFloor] = useState('1st Floor');
  const [newRoomCapacity, setNewRoomCapacity] = useState('40');

  // Camera Assignment inputs
  const [assignFrontCam, setAssignFrontCam] = useState('');
  const [assignRearCam, setAssignRearCam] = useState('');
  const [assignEntranceCam, setAssignEntranceCam] = useState('');
  const [assignExitCam, setAssignExitCam] = useState('');
  const [assignCeilingCam, setAssignCeilingCam] = useState('');

  // Faculty Assignment inputs
  const [assignFacultyName, setAssignFacultyName] = useState('');
  const [assignFacultyEmail, setAssignFacultyEmail] = useState('');
  const [assignFacultySubject, setAssignFacultySubject] = useState('');
  const [assignFacultyHours, setAssignFacultyHours] = useState('');
  const [assignFacultyStatus, setAssignFacultyStatus] = useState<'online' | 'offline' | 'on-leave'>('online');

  // Trigger permission check automatically
  useEffect(() => {
    async function checkCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(t => t.stop());
        setPermissionState('granted');
        setHasCameraError(false);
      } catch (err) {
        console.warn('Camera stream request failed:', err);
        setPermissionState('denied');
        setHasCameraError(true);
      }
    }
    checkCamera();
  }, []);

  // Sync simulator timer for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Simulated live updates to face detections to feel interactive & dynamic
  useEffect(() => {
    const liveStatsInterval = setInterval(() => {
      setClassrooms(prev => prev.map(room => {
        if (room.status === 'active' && room.aiEnabled) {
          // Fluctuating student checks
          const activeDetections = Math.max(
            0,
            Math.min(
              room.capacity, 
              room.studentCount - Math.floor(Math.random() * 4)
            )
          );
          
          // Randomly trigger attendance status change on one seat
          const updatedSeats = [...room.seats];
          if (updatedSeats.length > 3) {
            const index = Math.floor(Math.random() * updatedSeats.length);
            const currentSeat = updatedSeats[index];
            if (currentSeat.status === 'absent' && Math.random() > 0.6) {
              updatedSeats[index] = { ...currentSeat, status: 'present' };
              
              // Trigger action callback if assigned
              if (onAddRecognitionLog && currentSeat.studentName) {
                onAddRecognitionLog({
                  studentId: currentSeat.studentId || `STU-${Date.now()}`,
                  studentName: currentSeat.studentName,
                  department: room.department,
                  timestamp: new Date().toISOString(),
                  status: 'present',
                  confidence: +(94 + Math.random() * 5).toFixed(1),
                  verificationType: 'classroom_tracker',
                  temperature: '98.6°F',
                  maskWorn: Math.random() > 0.8
                });
              }
            }
          }

          return {
            ...room,
            faceDetectionCount: activeDetections,
            seats: updatedSeats
          };
        }
        return room;
      }));
    }, 8000);

    return () => clearInterval(liveStatsInterval);
  }, []);

  // Building Summaries List
  const buildings: BuildingNode[] = [
    { name: 'Administration Block', code: 'ADM-BLK', floors: 4, roomsCount: 12, status: 'operational' },
    { name: 'Engineering Wing', code: 'ENG-WING', floors: 3, roomsCount: 18, status: 'operational' },
    { name: 'Science Block', code: 'SCI-BLK', floors: 5, roomsCount: 15, status: 'operational' },
    { name: 'Annex Library Space', code: 'LIB-ANNEX', floors: 2, roomsCount: 6, status: 'restricted' }
  ];

  // Floor Summaries List
  const floors: FloorNode[] = [
    { floorNumber: 'Ground Floor', roomsCount: 8, availableCount: 2, occupiedCount: 6 },
    { floorNumber: '1st Floor', roomsCount: 12, availableCount: 4, occupiedCount: 8 },
    { floorNumber: '2nd Floor', roomsCount: 10, availableCount: 3, occupiedCount: 7 },
    { floorNumber: '3rd Floor', roomsCount: 8, availableCount: 5, occupiedCount: 3 },
  ];

  // Computed aggregated statistic variables
  const totalBuildings = buildings.length;
  const totalFloors = floors.length;
  const totalRoomsCount = classrooms.length;
  const laboratoriesCount = classrooms.filter(r => r.roomName.toLowerCase().includes('lab')).length;
  const smartClassroomsCount = classrooms.filter(r => r.aiEnabled).length;
  const onlineRoomsCount = classrooms.filter(r => r.status === 'active' || r.status === 'scheduled').length;
  const offlineRoomsCount = classrooms.filter(r => r.status === 'idle' || r.status === 'maintenance').length;
  const assignedCamerasCount = classrooms.reduce((acc, r) => {
    let count = 0;
    if (r.cameras.front) count++;
    if (r.cameras.rear) count++;
    if (r.cameras.entrance) count++;
    if (r.cameras.exit) count++;
    if (r.cameras.ceiling) count++;
    return acc + count;
  }, 0);

  // Filtered Classrooms
  const filteredRooms = classrooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.currentFaculty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBuilding = buildingFilter === 'All' || room.building === buildingFilter;
    return matchesSearch && matchesBuilding;
  });

  // Action: Add Classroom submit handler
  const handleAddClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber || !newRoomName) return;

    const newRoom: Classroom = {
      id: `ROOM-${newRoomNumber}`,
      roomNumber: newRoomNumber,
      roomName: newRoomName,
      department: newRoomDept,
      building: newRoomBuilding,
      floor: newRoomFloor,
      capacity: parseInt(newRoomCapacity) || 40,
      studentCount: 0,
      status: 'idle',
      currentSubject: 'None Assigned',
      currentFaculty: 'Staff Rotational',
      facultyEmail: 'staff@vision.edu',
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      nextClass: 'None',
      workingHours: '09:00 AM - 05:00 PM',
      facultyStatus: 'offline',
      aiEnabled: true,
      attendanceEnabled: true,
      recognitionAccuracy: 98.2,
      faceDetectionCount: 0,
      yoloStatus: 'standby',
      insightFaceStatus: 'standby',
      cameras: {
        front: `CAM-${newRoomNumber}-F`,
        rear: '',
        entrance: '',
        exit: '',
        ceiling: ''
      },
      activeCameraType: 'front',
      studentBatch: {
        course: 'General Elective',
        year: '1st Year',
        semester: '1st Semester',
        section: 'Sec-A',
        group: 'Grp-1',
        batchCode: `GEN-${newRoomNumber}`,
        rollRange: '101 to 140'
      },
      seats: Array.from({ length: 8 }).map((_, i) => ({
        id: `S-${newRoomNumber}-${i}`,
        row: Math.floor(i / 4) + 1,
        col: (i % 4) + 1,
        status: 'empty'
      }))
    };

    setClassrooms(prev => [...prev, newRoom]);
    setSelectedRoomId(newRoom.id);
    setShowAddRoomModal(false);
    
    // reset form
    setNewRoomNumber('');
    setNewRoomName('');
  };

  // Action: Assign camera coordinates
  const handleAssignCameras = (e: React.FormEvent) => {
    e.preventDefault();
    setClassrooms(prev => prev.map(room => {
      if (room.id === selectedRoomId) {
        return {
          ...room,
          cameras: {
            front: assignFrontCam || room.cameras.front,
            rear: assignRearCam || room.cameras.rear,
            entrance: assignEntranceCam || room.cameras.entrance,
            exit: assignExitCam || room.cameras.exit,
            ceiling: assignCeilingCam || room.cameras.ceiling
          }
        };
      }
      return room;
    }));
    setShowAssignCameraModal(false);
  };

  // Action: Assign Faculty submit
  const handleAssignFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    setClassrooms(prev => prev.map(room => {
      if (room.id === selectedRoomId) {
        return {
          ...room,
          currentFaculty: assignFacultyName || room.currentFaculty,
          facultyEmail: assignFacultyEmail || room.facultyEmail,
          currentSubject: assignFacultySubject || room.currentSubject,
          workingHours: assignFacultyHours || room.workingHours,
          facultyStatus: assignFacultyStatus
        };
      }
      return room;
    }));
    setShowAssignFacultyModal(false);
  };

  // Toggle Room AI Processing State
  const toggleRoomAi = (roomId: string) => {
    setClassrooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const nextState = !r.aiEnabled;
        return {
          ...r,
          aiEnabled: nextState,
          yoloStatus: nextState ? 'active' : 'standby',
          insightFaceStatus: nextState ? 'active' : 'standby'
        };
      }
      return r;
    }));
  };

  // Toggle Room Attendance Log State
  const toggleRoomAttendance = (roomId: string) => {
    setClassrooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          attendanceEnabled: !r.attendanceEnabled
        };
      }
      return r;
    }));
  };

  // Trigger quick manual seat toggle
  const toggleSeatState = (seatId: string) => {
    setClassrooms(prev => prev.map(room => {
      if (room.id === selectedRoomId) {
        const updatedSeats = room.seats.map(seat => {
          if (seat.id === seatId) {
            const nextStatusMap: { [key: string]: 'present' | 'absent' | 'empty' } = {
              'present': 'absent',
              'absent': 'empty',
              'empty': 'present'
            };
            const nextStatus = nextStatusMap[seat.status];
            
            // Log biometric trigger event
            if (nextStatus === 'present' && onAddRecognitionLog) {
              onAddRecognitionLog({
                studentId: seat.studentId || `GEN-${Date.now().toString().slice(-4)}`,
                studentName: seat.studentName || 'Intermittent Biometric Target',
                department: room.department,
                timestamp: new Date().toISOString(),
                status: 'present',
                confidence: 97.4,
                verificationType: 'classroom_manual_override',
                temperature: '98.5°F',
                maskWorn: false
              });
            }
            return { ...seat, status: nextStatus };
          }
          return seat;
        });

        // Compute new current student count based on non-empty/present
        const presentCount = updatedSeats.filter(s => s.status === 'present').length;

        return {
          ...room,
          seats: updatedSeats,
          studentCount: presentCount + 10 // scale factor for overall classroom headcount
        };
      }
      return room;
    }));
  };

  // Take quick screenshot
  const triggerCapture = () => {
    const timeString = new Date().toLocaleTimeString();
    let sampleImg = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80";

    if (webcamRef.current) {
      const captured = webcamRef.current.getScreenshot();
      if (captured) {
        sampleImg = captured;
      }
    }

    setScreenshots(prev => [
      { id: `shot-${Date.now()}`, url: sampleImg, time: timeString },
      ...prev.slice(0, 7)
    ]);
  };

  // Export Room Configuration data
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(classrooms, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `FaceVision_Classrooms_Structure_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Trigger quick simulated CSV import
  const handleImportRooms = () => {
    alert("Parsing institution floor schedules CSV... 4 classrooms schedules updated dynamically!");
    setClassrooms(prev => prev.map(c => {
      if (c.id === 'ROOM-302') {
        return {
          ...c,
          status: 'active',
          currentSubject: 'Advanced Computational Genetics',
          currentFaculty: 'Dr. Clara Oswald',
          facultyStatus: 'online'
        };
      }
      return c;
    }));
  };

  return (
    <div id="classroom-management-module" className="space-y-8 pb-20 text-slate-100">

      {/* ================================================== */}
      {/* PAGE HEADER */}
      {/* ================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 bg-[#080d1a]/60 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Layers className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>Campus Location Mapping Matrix</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Classroom & Room Management</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Manage classrooms, laboratories, camera assignments, faculty, and student batches across departments.
          </p>
        </div>

        {/* Dynamic Buttons Area */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-add-classroom-modal"
            onClick={() => setShowAddRoomModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Classroom</span>
          </button>

          <button
            id="btn-assign-camera-modal"
            onClick={() => {
              // Pre-fill fields for the active room
              setAssignFrontCam(activeRoom.cameras.front);
              setAssignRearCam(activeRoom.cameras.rear);
              setAssignEntranceCam(activeRoom.cameras.entrance);
              setAssignExitCam(activeRoom.cameras.exit);
              setAssignCeilingCam(activeRoom.cameras.ceiling);
              setShowAssignCameraModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-200 text-xs font-semibold tracking-wide cursor-pointer hover:scale-[1.02]"
          >
            <Video className="w-3.5 h-3.5 text-indigo-400" />
            <span>Assign Camera</span>
          </button>

          <button
            id="btn-assign-faculty-modal"
            onClick={() => {
              setAssignFacultyName(activeRoom.currentFaculty);
              setAssignFacultyEmail(activeRoom.facultyEmail);
              setAssignFacultySubject(activeRoom.currentSubject);
              setAssignFacultyHours(activeRoom.workingHours);
              setAssignFacultyStatus(activeRoom.facultyStatus);
              setShowAssignFacultyModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-200 text-xs font-semibold tracking-wide cursor-pointer hover:scale-[1.02]"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Assign Faculty</span>
          </button>

          <button
            id="btn-import-rooms"
            onClick={handleImportRooms}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-300 text-xs font-mono transition-all cursor-pointer"
            title="Import structural rooms scheduled"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Import Rooms</span>
          </button>

          <button
            id="btn-export-rooms-data"
            onClick={handleExportData}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Export institution layout structure to JSON"
          >
            <FileText className="w-4 h-4 text-amber-500" />
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* OVERVIEW STATS ROW */}
      {/* ================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        
        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Buildings</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white">{totalBuildings}</span>
            <Building className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">Alpha to Delta</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Total Floors</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white">{totalFloors}</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">Grnd to 4th Floor</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">Classrooms</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white">{totalRoomsCount}</span>
            <span className="text-xs text-blue-500 font-bold font-mono">Bound</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">Allocated schedule</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Laboratories</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white">{laboratoriesCount}</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">GPU-accelerated</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Smart Rooms</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white">{smartClassroomsCount}</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">AI face tracked</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-green-400 uppercase tracking-widest font-bold">Online</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white">{onlineRoomsCount}</span>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">Active sessions</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">Offline</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white">{offlineRoomsCount}</span>
            <span className="h-2 w-2 rounded-full bg-rose-500" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">Idle or vacant</span>
        </div>

        <div className="bg-[#0b1226]/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-750/80 transition-all shadow-md">
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Assigned Cams</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-white">{assignedCamerasCount}</span>
            <Video className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block">Surveillance matrix</span>
        </div>

      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setBuildingFilter('All')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              buildingFilter === 'All' 
                ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 font-bold' 
                : 'bg-slate-950 border border-slate-850 text-slate-400 hover:text-white'
            }`}
          >
            All Buildings
          </button>
          {Array.from(new Set(classrooms.map(c => c.building))).map(b => (
            <button
              key={b}
              onClick={() => setBuildingFilter(b)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                buildingFilter === b 
                  ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 font-bold' 
                  : 'bg-slate-950 border border-slate-850 text-slate-400 hover:text-white'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search room number, subject, faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* ================================================== */}
      {/* MAIN TWO COLUMN VIEW */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* LEFT COLUMN: CLASSROOM SCHEDULER & INDEX (5/12 width) */}
        <div className="xl:col-span-5 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <h2 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Institutional Rooms Registry</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Displaying <span className="text-slate-300 font-bold">{filteredRooms.length}</span> rooms
            </span>
          </div>

          <div className="space-y-4">
            {filteredRooms.map(room => {
              const isSelected = room.id === selectedRoomId;
              const isOnline = room.status === 'active' || room.status === 'scheduled';
              
              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative ${
                    isSelected 
                      ? 'bg-[#0e162c]/65 border-indigo-500/80 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/20' 
                      : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/30 hover:border-slate-750'
                  }`}
                >
                  {/* Glowing vertical marker for active status */}
                  {isSelected && (
                    <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r" />
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-extrabold text-white font-mono">
                          #{room.roomNumber}
                        </span>
                        <span className="text-sm font-bold text-slate-300 truncate max-w-[200px]">
                          {room.roomName}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-1.5 text-xs text-slate-400 font-mono">
                        <span>{room.building}</span>
                        <span>•</span>
                        <span>{room.floor}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                        room.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/25 animate-pulse' :
                        room.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/25' :
                        room.status === 'idle' ? 'bg-slate-800 text-slate-400 border-slate-750' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/25'
                      }`}>
                        {room.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-bold bg-indigo-950/30 px-1.5 py-0.5 rounded border border-indigo-900/30">
                        {room.department}
                      </span>
                    </div>
                  </div>

                  {/* Operational stats row inside room card */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-850 text-center">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">Headcount</span>
                      <span className="text-xs font-bold text-slate-200">
                        {room.studentCount} / {room.capacity}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">Faculty</span>
                      <span className="text-xs font-bold text-slate-200 truncate block max-w-[100px]">
                        {room.currentFaculty.split(' ').slice(-1)[0]}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">AI Status</span>
                      <span className={`text-[10px] font-bold ${room.aiEnabled ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {room.aiEnabled ? 'ACTIVE' : 'OFF'}
                      </span>
                    </div>
                  </div>

                  {/* Active Class Info Tag */}
                  {room.status === 'active' && (
                    <div className="mt-3 bg-indigo-950/20 border border-indigo-900/30 px-3 py-2 rounded-xl flex items-center justify-between text-xs text-indigo-300">
                      <div className="flex items-center space-x-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-semibold truncate">{room.currentSubject}</span>
                      </div>
                      <span className="font-mono text-[10px] text-indigo-400 shrink-0">{room.startTime}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* BUILDING MANAGEMENT LIST COMPONENT */}
          <div className="bg-[#070b15]/50 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Building className="w-4 h-4 text-blue-500" />
                <span>Structural Building Directory</span>
              </h3>
              <span className="text-[9px] text-slate-500 font-mono">CCTV Links</span>
            </div>

            <div className="space-y-2.5">
              {buildings.map(b => (
                <div key={b.code} className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 flex items-center justify-between hover:border-slate-750 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Building className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{b.name}</p>
                      <p className="text-[9px] font-mono text-slate-500 uppercase">{b.code} • {b.floors} FLOORS</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-300 block">{b.roomsCount} Rooms</span>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                      b.status === 'operational' ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-amber-500 shadow-[0_0_6px_#f59e0b]'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FLOOR MANAGEMENT COMPONENT */}
          <div className="bg-[#070b15]/50 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Floor-wise Room Capacity</span>
              </h3>
              <span className="text-[9px] text-slate-500 font-mono">Distribution</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {floors.map(f => (
                <div key={f.floorNumber} className="p-3 bg-slate-950/30 rounded-xl border border-slate-900 flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-300">{f.floorNumber}</span>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-850/60">
                    <div className="text-left">
                      <span className="text-[8px] font-mono text-slate-500 uppercase block">Rooms</span>
                      <span className="text-xs font-bold text-slate-200">{f.roomsCount}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-mono text-slate-500 uppercase block">Occupied</span>
                      <span className="text-xs font-bold text-indigo-400">{f.occupiedCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE TARGET FOCUS, CLASSROOM SEATING & ASSIGNMENTS (7/12 width) */}
        <div className="xl:col-span-7 space-y-6">

          {/* ACTIVE CLASSROOM STATUS PROFILE CARD */}
          <div className="bg-gradient-to-r from-indigo-950/15 to-[#0b1226]/50 border border-slate-800 p-6 rounded-2xl relative">
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <span className={`h-2.5 w-2.5 rounded-full ${
                activeRoom.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-600'
              }`} />
              <span className="text-xs font-mono uppercase font-bold text-slate-300">
                Session Status: {activeRoom.status}
              </span>
            </div>

            <span className="bg-indigo-600/15 text-indigo-400 font-mono text-[9px] px-2 py-0.5 rounded-full border border-indigo-500/25 uppercase tracking-wider font-bold">
              Active Focus Chamber
            </span>

            <div className="mt-2.5 flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg font-black font-mono">
                {activeRoom.roomNumber}
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{activeRoom.roomName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{activeRoom.building} • {activeRoom.floor}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-850">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Active Course</span>
                <span className="text-xs font-bold text-slate-200 block mt-0.5">{activeRoom.studentBatch.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Year / Semester</span>
                <span className="text-xs font-bold text-slate-200 block mt-0.5">{activeRoom.studentBatch.year} • {activeRoom.studentBatch.semester}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Section / Group</span>
                <span className="text-xs font-bold text-slate-200 block mt-0.5">{activeRoom.studentBatch.section} • {activeRoom.studentBatch.group}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Batch range</span>
                <span className="text-xs font-bold text-indigo-400 block mt-0.5">{activeRoom.studentBatch.rollRange}</span>
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* LIVE CLASSROOM CAMERA VIEWPORT */}
          {/* ================================================== */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative">
            <div className="p-4 bg-slate-900/60 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-rose-500 animate-pulse" />
                <span className="text-xs font-extrabold text-slate-200 font-mono uppercase">
                  Classroom Stream Feed: Cam {activeRoom.cameras[activeRoom.activeCameraType]}
                </span>
              </div>

              {/* Camera Switcher tabs */}
              <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-850">
                {(['front', 'rear', 'entrance', 'exit', 'ceiling'] as const).map(camType => (
                  <button
                    key={camType}
                    onClick={() => {
                      setClassrooms(prev => prev.map(r => r.id === activeRoom.id ? { ...r, activeCameraType: camType } : r));
                    }}
                    className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                      activeRoom.activeCameraType === camType
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {camType}
                  </button>
                ))}
              </div>
            </div>

            {/* REAL WEBCAM VIEW OR SIMULATED GRAPHIC */}
            <div className="relative aspect-[16/10] bg-[#030611] flex items-center justify-center">
              
              {/* Recording status overlay */}
              {isRecording && (
                <div className="absolute top-4 left-4 z-20 flex items-center space-x-1.5 bg-red-650 px-2 py-0.5 rounded-md text-[9px] font-mono font-black tracking-widest text-white animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  <span>REC {Math.floor(recDuration / 60).toString().padStart(2, '0')}:{Math.round(recDuration % 60).toString().padStart(2, '0')}</span>
                </div>
              )}

              {/* Top metadata specs overlay */}
              <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5">
                <span className="bg-slate-950/80 backdrop-blur border border-slate-800 px-2 py-0.5 rounded text-[8px] font-mono text-indigo-400 font-bold uppercase">
                  ACTIVE FEED
                </span>
                <span className="bg-slate-950/80 backdrop-blur border border-slate-800 px-2 py-0.5 rounded text-[8px] font-mono text-slate-300">
                  {activeRoom.recognitionAccuracy}% AI ACC
                </span>
              </div>

              {/* Standard active stream conditional renderer */}
              {permissionState === 'granted' && !hasCameraError && activeRoom.status === 'active' ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] opacity-90 transition-opacity"
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: 'user'
                  }}
                  disablePictureInPicture={false}
                  forceScreenshotSourceSize={false}
                  imageSmoothing={true}
                  mirrored={false}
                  screenshotQuality={0.92}
                  onUserMedia={() => {}}
                  onUserMediaError={() => {}}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#090f23] via-[#04060f] to-[#0c1328]">
                  <div className="p-3 bg-rose-500/10 rounded-full border border-rose-500/25 mb-3 text-rose-400">
                    <X className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-200">
                    {hasCameraError ? 'Camera Link Inactive' : 'Stream Standby Mode'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 max-w-sm leading-relaxed">
                    {hasCameraError 
                      ? 'Local media hardware permissions are locked. Change site configurations to permit live capture stream.'
                      : 'This camera is currently in scheduled standby. Set classroom status to ACTIVE to begin biometrics.'}
                  </p>
                  
                  {hasCameraError && (
                    <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-850 text-left max-w-xs text-[10px] font-mono text-slate-400 space-y-1">
                      <p className="text-rose-400 font-bold">Troubleshooting Protocol:</p>
                      <p>1. Check camera privacy switches on laptop bezel.</p>
                      <p>2. Verify chrome site settings allow webcam device access.</p>
                      <p>3. Restart the dev environment stream channel.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic live AI Face Tracking Simulation overlay boxes */}
              {activeRoom.status === 'active' && activeRoom.aiEnabled && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {/* Overlay Green box */}
                  <div className="absolute border border-green-500 rounded text-[9px] font-mono px-1 py-0.5 bg-green-500/10" style={{ top: '25%', left: '35%', width: '15%', height: '22%' }}>
                    <div className="text-green-400 font-bold bg-slate-950/80 px-1 rounded inline-block">Alexander W.</div>
                    <div className="text-[8px] text-green-300">Conf: 98.4%</div>
                  </div>

                  {/* Overlay Indigo box */}
                  <div className="absolute border border-indigo-500 rounded text-[9px] font-mono px-1 py-0.5 bg-indigo-500/10" style={{ top: '35%', left: '60%', width: '16%', height: '25%' }}>
                    <div className="text-indigo-400 font-bold bg-slate-950/80 px-1 rounded inline-block">Sophia S.</div>
                    <div className="text-[8px] text-indigo-300">Conf: 99.2%</div>
                  </div>

                  {/* Dynamic laser radar sweep bar */}
                  <div className="absolute left-0 right-0 h-[1.5px] bg-indigo-500/50 shadow-[0_0_8px_#6366f1] animate-bounce" style={{ top: '48%' }} />
                </div>
              )}

              {/* Bottom stream overlay controls */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between">
                <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl flex items-center space-x-6 text-[10px] font-mono text-slate-300 shadow-xl">
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px]">Subject</span>
                    <span className="font-bold text-white truncate max-w-[150px] block">{activeRoom.currentSubject}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px]">Instructor</span>
                    <span className="font-bold text-slate-300 block">{activeRoom.currentFaculty}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px]">Verified Headcount</span>
                    <span className="font-bold text-emerald-400 block">{activeRoom.faceDetectionCount} detected</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={triggerCapture}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
                    title="Snapshot frame capture"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      isRecording 
                        ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                        : 'bg-slate-900 border-slate-800 text-rose-400 hover:text-rose-300'
                    }`}
                    title={isRecording ? 'Stop Recording' : 'Start Recording'}
                  >
                    {isRecording ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-rose-400" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Captured snapshots strip */}
            {screenshots.length > 0 && (
              <div className="p-3 bg-slate-900/40 border-t border-slate-850 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <span className="text-[9px] font-mono text-slate-500 uppercase shrink-0">Snapshots:</span>
                {screenshots.map((s, idx) => (
                  <div key={s.id} className="relative group/shot shrink-0">
                    <img src={s.url} alt="captured" className="w-14 h-10 object-cover rounded border border-slate-800 group-hover/shot:border-indigo-500 transition-colors" />
                    <span className="absolute bottom-0 right-0 text-[6px] bg-slate-950 text-slate-400 px-0.5 font-mono">{s.time.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================================================== */}
          {/* CLASSROOM SEATING LAYOUT MAP */}
          {/* ================================================== */}
          <div className="bg-[#070b15]/50 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                  <Compass className="w-4.5 h-4.5 text-indigo-400" />
                  <span>Interactive Desks Layout Map</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Click seats to toggle manual attendance presence override checks.</p>
              </div>
              
              <div className="flex items-center space-x-3 text-[10px] font-mono">
                <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1" /> Present</span>
                <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1" /> Absent</span>
                <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-slate-850 mr-1 border border-slate-700" /> Empty</span>
              </div>
            </div>

            {/* Virtual Seating Plan Canvas */}
            <div className="relative bg-slate-950 p-6 rounded-xl border border-slate-900 flex flex-col items-center space-y-8 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.04),transparent)] pointer-events-none" />
              
              {/* LECTURE HALL DESK / SCREEN AT TOP */}
              <div className="w-2/3 py-2.5 bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-900/50 rounded-lg text-center shadow-inner relative">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                  Lecture Podium Desk
                </span>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-500 rounded-full animate-pulse border border-slate-950" title="YOLO CCTV Target position" />
              </div>

              {/* STUDENT DESKS LAYOUT GRID */}
              <div className="grid grid-cols-4 gap-6 w-full max-w-lg">
                {activeRoom.seats.map(seat => (
                  <button
                    key={seat.id}
                    onClick={() => toggleSeatState(seat.id)}
                    className={`p-3.5 rounded-xl border transition-all duration-350 cursor-pointer flex flex-col items-center justify-between relative group/seat hover:scale-[1.03] ${
                      seat.status === 'present' 
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
                        : seat.status === 'absent'
                          ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                          : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <User className={`w-5 h-5 mb-1 ${
                      seat.status === 'present' ? 'text-emerald-400' : seat.status === 'absent' ? 'text-rose-400' : 'text-slate-600'
                    }`} />
                    
                    <span className="text-[9px] font-mono font-bold block">
                      Row {seat.row}-Col {seat.col}
                    </span>

                    <span className="text-[8px] truncate max-w-[80px] font-bold text-slate-400 group-hover/seat:text-white block mt-1">
                      {seat.studentName ? seat.studentName.split(' ')[0] : 'Vacant'}
                    </span>

                    {/* Micro hover metadata tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-950 border border-slate-800 p-2 rounded text-[8px] font-mono whitespace-nowrap opacity-0 group-hover/seat:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl text-left">
                      <p className="font-bold text-white">{seat.studentName || 'Unassigned Desk'}</p>
                      <p className="text-slate-500 mt-0.5">Status: {seat.status.toUpperCase()}</p>
                      <p className="text-indigo-400">Lock: Sec-Row {seat.row}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Map Blind spots/Radar Indicators footer */}
              <div className="w-full flex justify-between items-center text-[9px] font-mono text-slate-500 pt-3 border-t border-slate-900">
                <span className="flex items-center text-rose-400/80"><CornerRightDown className="w-3 h-3 mr-0.5" /> BLIND SPOT (REAR CORNER)</span>
                <span className="flex items-center text-cyan-400/80"><Activity className="w-3 h-3 mr-0.5" /> RECOGNITION SWEEP AREA</span>
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* TIMETABLE & SCHEDULE PREVIEW */}
          {/* ================================================== */}
          <div className="bg-[#070b15]/50 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                <Calendar className="w-4.5 h-4.5 text-indigo-400" />
                <span>Today's Academic Schedule Timetable</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Room Schedule</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-indigo-500/10 text-indigo-400 text-[8px] font-mono font-bold px-1 py-0.5 rounded border border-indigo-500/25">
                  CURRENT
                </div>
                <span className="text-[8px] text-slate-500 font-mono block uppercase">Active Class</span>
                <p className="text-xs font-black text-slate-200 mt-1 truncate">{activeRoom.currentSubject}</p>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center">
                  <User className="w-3 h-3 mr-1 text-slate-500" />
                  {activeRoom.currentFaculty}
                </p>
                <p className="text-[10px] text-indigo-400 font-mono mt-2 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {activeRoom.startTime} - {activeRoom.endTime}
                </p>
              </div>

              <div className="p-4 bg-slate-950/20 border border-slate-900 rounded-xl">
                <span className="text-[8px] text-slate-500 font-mono block uppercase">Next Scheduled</span>
                <p className="text-xs font-black text-slate-300 mt-1 truncate">{activeRoom.nextClass}</p>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center">
                  <User className="w-3 h-3 mr-1 text-slate-500" />
                  Staff Scheduled
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-2 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  11:45 AM - 01:30 PM
                </p>
              </div>

              <div className="p-4 bg-slate-950/20 border border-slate-900 rounded-xl">
                <span className="text-[8px] text-slate-500 font-mono block uppercase">Afternoon Elective</span>
                <p className="text-xs font-black text-slate-300 mt-1 truncate">Machine Learning Workshops</p>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center">
                  <User className="w-3 h-3 mr-1 text-slate-500" />
                  Prof. Alistair Vance
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-2 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  02:00 PM - 04:30 PM
                </p>
              </div>

            </div>
          </div>

          {/* ================================================== */}
          {/* AI ENGINE & SYSTEM STATUS */}
          {/* ================================================== */}
          <div className="bg-[#070b15]/50 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Biometric Analytics & Core AI Status</span>
              </h3>
              <span className="text-[9px] text-slate-500 font-mono">Edge Processing Specs</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
              
              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-center">
                <span className="text-[8px] text-slate-500 font-mono uppercase block">YOLOv8 Engine</span>
                <span className={`text-[10px] font-mono font-extrabold mt-1.5 inline-flex items-center px-2 py-0.5 rounded ${
                  activeRoom.yoloStatus === 'active' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-slate-900 text-slate-400'
                }`}>
                  {activeRoom.yoloStatus.toUpperCase()}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-center">
                <span className="text-[8px] text-slate-500 font-mono uppercase block">InsightFace</span>
                <span className={`text-[10px] font-mono font-extrabold mt-1.5 inline-flex items-center px-2 py-0.5 rounded ${
                  activeRoom.insightFaceStatus === 'active' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-slate-900 text-slate-400'
                }`}>
                  {activeRoom.insightFaceStatus.toUpperCase()}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-center">
                <span className="text-[8px] text-slate-500 font-mono uppercase block">Accuracy Limit</span>
                <span className="text-xs font-mono font-black text-cyan-400 block mt-2">
                  {activeRoom.recognitionAccuracy}%
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-center">
                <span className="text-[8px] text-slate-500 font-mono uppercase block">Confidence Rate</span>
                <span className="text-xs font-mono font-black text-indigo-400 block mt-2">
                  98.4% Max
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-center col-span-2 md:col-span-1">
                <span className="text-[8px] text-slate-500 font-mono uppercase block">Attendance Status</span>
                <span className={`text-[10px] font-mono font-bold mt-1.5 inline-block ${
                  activeRoom.attendanceEnabled ? 'text-green-400' : 'text-slate-400'
                }`}>
                  {activeRoom.attendanceEnabled ? 'TRACKING' : 'SUSPENDED'}
                </span>
              </div>

            </div>
          </div>

          {/* ================================================== */}
          {/* QUICK OPERATION SHELF */}
          {/* ================================================== */}
          <div className="bg-[#070b15]/50 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
              Chamber Diagnostics Quick Actions
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              
              <button 
                onClick={() => toggleRoomAi(activeRoom.id)}
                className="p-3 bg-slate-950/80 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-all hover:bg-slate-900/40 cursor-pointer"
              >
                <span>AI Face Processing</span>
                {activeRoom.aiEnabled ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
              </button>

              <button 
                onClick={() => toggleRoomAttendance(activeRoom.id)}
                className="p-3 bg-slate-950/80 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-all hover:bg-slate-900/40 cursor-pointer"
              >
                <span>Attendance Log</span>
                {activeRoom.attendanceEnabled ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-500" />}
              </button>

              <button 
                onClick={() => alert(`Initiated dynamic presence audit logs report compilation for room #${activeRoom.roomNumber}...`)}
                className="p-3 bg-slate-950/80 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-all hover:bg-slate-900/40 cursor-pointer col-span-2 md:col-span-1"
              >
                <span>Compile Reports</span>
                <FileText className="w-4 h-4 text-amber-500" />
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* ================================================== */}
      {/* 1. ADD CLASSROOM MODAL */}
      {/* ================================================== */}
      <AnimatePresence>
        {showAddRoomModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b1225] border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-850 flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white">Add New Institutional Classroom</h3>
                <button 
                  onClick={() => setShowAddRoomModal(false)}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddClassroom} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">Room Number / identifier *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 102, 305B"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">Chamber Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computational Fluid Lab"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">Department</label>
                    <select
                      value={newRoomDept}
                      onChange={(e) => setNewRoomDept(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Engineering">Engineering</option>
                      <option value="General Sciences">General Sciences</option>
                      <option value="Administration">Administration</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">Capacity limit</label>
                    <input
                      type="number"
                      value={newRoomCapacity}
                      onChange={(e) => setNewRoomCapacity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">Building Block</label>
                    <select
                      value={newRoomBuilding}
                      onChange={(e) => setNewRoomBuilding(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Administration Block">Administration Block</option>
                      <option value="Engineering Wing">Engineering Wing</option>
                      <option value="Science Block">Science Block</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">Floor level</label>
                    <select
                      value={newRoomFloor}
                      onChange={(e) => setNewRoomFloor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Ground Floor">Ground Floor</option>
                      <option value="1st Floor">1st Floor</option>
                      <option value="2nd Floor">2nd Floor</option>
                      <option value="3rd Floor">3rd Floor</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-850 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRoomModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    Deploy Chamber
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================== */}
      {/* 2. ASSIGN CAMERAS MODAL */}
      {/* ================================================== */}
      <AnimatePresence>
        {showAssignCameraModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b1225] border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-850 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Assign Cameras Matrix</h3>
                  <p className="text-xs text-slate-400">Assign multiple streams coordinates to room #{activeRoom.roomNumber}</p>
                </div>
                <button 
                  onClick={() => setShowAssignCameraModal(false)}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAssignCameras} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Front Focus Camera ID</label>
                  <input
                    type="text"
                    value={assignFrontCam}
                    onChange={(e) => setAssignFrontCam(e.target.value)}
                    placeholder="e.g. CAM-F-01"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Rear Focus Camera ID</label>
                  <input
                    type="text"
                    value={assignRearCam}
                    onChange={(e) => setAssignRearCam(e.target.value)}
                    placeholder="e.g. CAM-R-01"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Entrance Access Camera ID</label>
                  <input
                    type="text"
                    value={assignEntranceCam}
                    onChange={(e) => setAssignEntranceCam(e.target.value)}
                    placeholder="e.g. CAM-ENT-01"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Exit Point Camera ID</label>
                  <input
                    type="text"
                    value={assignExitCam}
                    onChange={(e) => setAssignExitCam(e.target.value)}
                    placeholder="e.g. CAM-EXT-01"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Ceiling Room Camera ID</label>
                  <input
                    type="text"
                    value={assignCeilingCam}
                    onChange={(e) => setAssignCeilingCam(e.target.value)}
                    placeholder="e.g. CAM-C-01"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>

                <div className="pt-4 border-t border-slate-850 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignCameraModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Map Hardware Channels
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================== */}
      {/* 3. ASSIGN FACULTY MODAL */}
      {/* ================================================== */}
      <AnimatePresence>
        {showAssignFacultyModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b1225] border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-850 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Assign Lead Instructor</h3>
                  <p className="text-xs text-slate-400">Assign faculty lead to room #{activeRoom.roomNumber}</p>
                </div>
                <button 
                  onClick={() => setShowAssignFacultyModal(false)}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAssignFaculty} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Instructor Full Name</label>
                  <input
                    type="text"
                    required
                    value={assignFacultyName}
                    onChange={(e) => setAssignFacultyName(e.target.value)}
                    placeholder="e.g. Dr. Julian Carter"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={assignFacultyEmail}
                    onChange={(e) => setAssignFacultyEmail(e.target.value)}
                    placeholder="e.g. julian@vision.edu"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Active Subject</label>
                  <input
                    type="text"
                    required
                    value={assignFacultySubject}
                    onChange={(e) => setAssignFacultySubject(e.target.value)}
                    placeholder="e.g. Deep Learning Networks"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Lecturing hours</label>
                  <input
                    type="text"
                    required
                    value={assignFacultyHours}
                    onChange={(e) => setAssignFacultyHours(e.target.value)}
                    placeholder="e.g. 09:00 AM - 11:30 AM"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">Instructor Clearance Status</label>
                  <select
                    value={assignFacultyStatus}
                    onChange={(e: any) => setAssignFacultyStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="online">Online & Present</option>
                    <option value="offline">Offline / Vacant</option>
                    <option value="on-leave">On-leave / Excused</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-850 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignFacultyModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Assign lead
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
