import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  BarChart3,
  Users,
  Calendar,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { 
  Student, 
  LessonRecord, 
  HomeworkAssignment, 
  HomeworkSubmission,
  StudentStatistics 
} from '../types/classbook';

interface ClassbookStatisticsProps {
  students: Student[];
  lessons: LessonRecord[];
  homeworkAssignments: HomeworkAssignment[];
  homeworkSubmissions: HomeworkSubmission[];
}

export function ClassbookStatistics({
  students,
  lessons,
  homeworkAssignments,
  homeworkSubmissions
}: ClassbookStatisticsProps) {
  const calculateStudentStatistics = (): StudentStatistics[] => {
    return students.map(student => {
      const studentLessons = lessons.filter(lesson => 
        lesson.attendance.some(a => a.studentId === student.id) ||
        lesson.participation.some(p => p.studentId === student.id)
      );

      const attendanceRecords = lessons.flatMap(lesson => 
        lesson.attendance.filter(a => a.studentId === student.id)
      );

      const participationRecords = lessons.flatMap(lesson =>
        lesson.participation.filter(p => p.studentId === student.id)
      );

      const studentHomeworkSubmissions = homeworkSubmissions.filter(
        sub => sub.studentId === student.id
      );

      const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
      const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;
      const lateCount = attendanceRecords.filter(a => a.status === 'late').length;
      
      const totalLessons = Math.max(attendanceRecords.length, lessons.length);
      const attendanceRate = totalLessons > 0 ? ((presentCount + lateCount) / totalLessons) * 100 : 0;

      const averageParticipation = participationRecords.length > 0
        ? participationRecords.reduce((sum, p) => sum + p.level, 0) / participationRecords.length
        : 0;

      const completedHomeworks = studentHomeworkSubmissions.filter(sub => sub.status === 'completed').length;
      const incompleteHomeworks = studentHomeworkSubmissions.filter(sub => sub.status === 'incomplete').length;
      const missingHomeworks = homeworkAssignments.length - studentHomeworkSubmissions.length +
        studentHomeworkSubmissions.filter(sub => sub.status === 'missing').length;

      const homeworkCompletionRate = homeworkAssignments.length > 0
        ? (completedHomeworks / homeworkAssignments.length) * 100
        : 0;

      return {
        studentId: student.id,
        name: student.name,
        totalLessons,
        presentCount,
        absentCount,
        lateCount,
        attendanceRate,
        averageParticipation,
        totalParticipations: participationRecords.length,
        completedHomeworks,
        incompleteHomeworks,
        missingHomeworks,
        homeworkCompletionRate
      };
    });
  };

  const studentStats = calculateStudentStatistics();

  const overallStats = {
    totalStudents: students.length,
    totalLessons: lessons.length,
    totalHomework: homeworkAssignments.length,
    averageAttendanceRate: studentStats.length > 0 
      ? studentStats.reduce((sum, s) => sum + s.attendanceRate, 0) / studentStats.length 
      : 0,
    averageParticipation: studentStats.length > 0
      ? studentStats.reduce((sum, s) => sum + s.averageParticipation, 0) / studentStats.length
      : 0,
    averageHomeworkCompletion: studentStats.length > 0
      ? studentStats.reduce((sum, s) => sum + s.homeworkCompletionRate, 0) / studentStats.length
      : 0
  };

  const getTrendIcon = (value: number, threshold: number = 75) => {
    if (value >= threshold) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value >= threshold - 25) return <Minus className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Schüler:innen</p>
                <p className="text-2xl font-medium">{overallStats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stunden</p>
                <p className="text-2xl font-medium">{overallStats.totalLessons}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hausaufgaben</p>
                <p className="text-2xl font-medium">{overallStats.totalHomework}</p>
              </div>
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ø Anwesenheit</p>
                <p className="text-2xl font-medium">
                  {overallStats.averageAttendanceRate.toFixed(1)}%
                </p>
              </div>
              {getTrendIcon(overallStats.averageAttendanceRate)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Student Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Schüler:innen-Statistiken
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Daten verfügbar
            </div>
          ) : (
            <div className="space-y-4">
              {studentStats.map((stat) => (
                <div key={stat.studentId} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{stat.name}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {stat.totalLessons} Stunden
                      </Badge>
                      <Badge variant="outline">
                        {stat.totalParticipations} Bewertungen
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {/* Anwesenheit */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Anwesenheit</span>
                        {getTrendIcon(stat.attendanceRate)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Anwesend:</span>
                          <span>{stat.presentCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Zu spät:</span>
                          <span>{stat.lateCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Abwesend:</span>
                          <span>{stat.absentCount}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Quote:</span>
                          <span>{stat.attendanceRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Beteiligung */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Beteiligung</span>
                        {getTrendIcon(stat.averageParticipation * 20, 60)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bewertungen:</span>
                          <span>{stat.totalParticipations}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Durchschnitt:</span>
                          <span>{stat.averageParticipation.toFixed(1)}/5</span>
                        </div>
                      </div>
                    </div>

                    {/* Hausaufgaben */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Hausaufgaben</span>
                        {getTrendIcon(stat.homeworkCompletionRate)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Erledigt:</span>
                          <span>{stat.completedHomeworks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unvollständig:</span>
                          <span>{stat.incompleteHomeworks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fehlend:</span>
                          <span>{stat.missingHomeworks}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Quote:</span>
                          <span>{stat.homeworkCompletionRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Class Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Klassenübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Anwesenheit
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durchschnittliche Quote:</span>
                  <span className="font-medium">{overallStats.averageAttendanceRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Beteiligung
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durchschnittsnote:</span>
                  <span className="font-medium">{overallStats.averageParticipation.toFixed(1)}/5</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Hausaufgaben
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durchschnittliche Quote:</span>
                  <span className="font-medium">{overallStats.averageHomeworkCompletion.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}