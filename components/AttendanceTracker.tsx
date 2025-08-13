import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  Clock, 
  UserMinus,
  Users
} from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus } from '../types/classbook';

interface AttendanceTrackerProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onAttendanceChange: (attendance: AttendanceRecord[]) => void;
}

export function AttendanceTracker({
  students,
  attendance,
  onAttendanceChange
}: AttendanceTrackerProps) {
  const updateAttendance = (studentId: string, status: AttendanceStatus) => {
    const updatedAttendance = attendance.filter(a => a.studentId !== studentId);
    
    if (status !== 'present') {
      updatedAttendance.push({
        studentId,
        status,
        note: undefined
      });
    }
    
    onAttendanceChange(updatedAttendance);
  };

  const getStudentStatus = (studentId: string): AttendanceStatus => {
    const record = attendance.find(a => a.studentId === studentId);
    return record?.status || 'present';
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'late':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'absent':
        return <UserMinus className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'Anwesend';
      case 'late':
        return 'Zu spät';
      case 'absent':
        return 'Abwesend';
    }
  };

  const presentCount = students.length - attendance.length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Anwesenheit
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
              Anwesend: {presentCount}
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950">
              Zu spät: {lateCount}
            </Badge>
            <Badge variant="outline" className="bg-red-50 dark:bg-red-950">
              Abwesend: {absentCount}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Keine Schüler:innen in der aktuellen Klasse
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map((student) => {
              const status = getStudentStatus(student.id);
              return (
                <div key={student.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{student.name}</span>
                    {getStatusIcon(status)}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={status === 'present' ? 'default' : 'outline'}
                      onClick={() => updateAttendance(student.id, 'present')}
                      className="h-6 px-2 text-xs"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Anwesend
                    </Button>
                    <Button
                      size="sm"
                      variant={status === 'late' ? 'default' : 'outline'}
                      onClick={() => updateAttendance(student.id, 'late')}
                      className="h-6 px-2 text-xs"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Zu spät
                    </Button>
                    <Button
                      size="sm"
                      variant={status === 'absent' ? 'default' : 'outline'}
                      onClick={() => updateAttendance(student.id, 'absent')}
                      className="h-6 px-2 text-xs"
                    >
                      <UserMinus className="w-3 h-3 mr-1" />
                      Abwesend
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}