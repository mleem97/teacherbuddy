export type AttendanceStatus = 'present' | 'absent' | 'late';
export type ParticipationLevel = 1 | 2 | 3 | 4 | 5;
export type HomeworkStatus = 'completed' | 'incomplete' | 'missing';

export interface Student {
  id: string;
  name: string;
  createdAt: string;
  selectionCount?: number;
  classId: string; // Reference to which class the student belongs
}

export interface SchoolClass {
  id: string;
  name: string;
  subject?: string;
  grade?: string;
  schoolYear?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface ParticipationRecord {
  studentId: string;
  level: ParticipationLevel;
  note?: string;
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  createdAt: string;
  classId: string; // Reference to which class the assignment belongs
}

export interface HomeworkSubmission {
  studentId: string;
  assignmentId: string;
  status: HomeworkStatus;
  submittedAt?: string;
  note?: string;
}

export interface LessonRecord {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  content?: string;
  notes?: string;
  attendance: AttendanceRecord[];
  participation: ParticipationRecord[];
  createdAt: string;
  updatedAt: string;
  classId: string; // Reference to which class the lesson belongs
}

export interface ClassbookData {
  classes: SchoolClass[];
  students: Student[];
  lessons: LessonRecord[];
  homeworkAssignments: HomeworkAssignment[];
  homeworkSubmissions: HomeworkSubmission[];
  currentClassId?: string;
  lastBackup?: string;
}

export interface StudentStatistics {
  studentId: string;
  name: string;
  totalLessons: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
  averageParticipation: number;
  totalParticipations: number;
  completedHomeworks: number;
  incompleteHomeworks: number;
  missingHomeworks: number;
  homeworkCompletionRate: number;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
}

export interface GroupingConstraint {
  mustBeTogether?: string[][]; // Names that must be in same group
  mustBeSeparated?: string[][]; // Names that must be in different groups
}

// Legacy interface for backward compatibility
export interface StudentData {
  names: string[];
  selectedNames: string[];
  absentNames: string[];
  selectionCounts: Record<string, number>;
  currentClassId?: string;
}