import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  BookOpen,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Edit3
} from 'lucide-react';
import { 
  HomeworkAssignment, 
  HomeworkSubmission, 
  HomeworkStatus, 
  Student 
} from '../types/classbook';

interface HomeworkManagerProps {
  students: Student[];
  assignments: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  onAssignmentsChange: (assignments: HomeworkAssignment[]) => void;
  onSubmissionsChange: (submissions: HomeworkSubmission[]) => void;
}

export function HomeworkManager({ 
  students, 
  assignments, 
  submissions,
  onAssignmentsChange,
  onSubmissionsChange
}: HomeworkManagerProps) {
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createAssignment = () => {
    if (!newAssignment.title.trim() || !newAssignment.dueDate) return;

    // Get the classId from the first student (all students should be from the same class)
    const classId = students.length > 0 ? students[0].classId : '';
    if (!classId) return;

    const assignment: HomeworkAssignment = {
      id: `hw-${Date.now()}`,
      title: newAssignment.title,
      description: newAssignment.description || undefined,
      dueDate: newAssignment.dueDate,
      createdAt: new Date().toISOString(),
      classId: classId
    };

    onAssignmentsChange([...assignments, assignment]);
    setNewAssignment({ title: '', description: '', dueDate: '' });
    setIsDialogOpen(false);
  };

  const getSubmissionForStudent = (assignmentId: string, studentId: string): HomeworkSubmission | undefined => {
    return submissions.find(sub => sub.assignmentId === assignmentId && sub.studentId === studentId);
  };

  const updateSubmission = (assignmentId: string, studentId: string, status: HomeworkStatus) => {
    const existingSubmission = getSubmissionForStudent(assignmentId, studentId);
    const updatedSubmissions = submissions.filter(
      sub => !(sub.assignmentId === assignmentId && sub.studentId === studentId)
    );

    const newSubmission: HomeworkSubmission = {
      studentId,
      assignmentId,
      status,
      submittedAt: status === 'completed' ? new Date().toISOString() : existingSubmission?.submittedAt,
      note: existingSubmission?.note
    };

    onSubmissionsChange([...updatedSubmissions, newSubmission]);
  };

  const getStatusIcon = (status: HomeworkStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'incomplete':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'missing':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: HomeworkStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'incomplete':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'missing':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  const getStatusText = (status: HomeworkStatus) => {
    switch (status) {
      case 'completed':
        return 'Erledigt';
      case 'incomplete':
        return 'Unvollständig';
      case 'missing':
        return 'Fehlend';
    }
  };

  const deleteAssignment = (assignmentId: string) => {
    onAssignmentsChange(assignments.filter(a => a.id !== assignmentId));
    onSubmissionsChange(submissions.filter(s => s.assignmentId !== assignmentId));
  };

  return (
    <div className="space-y-6">
      {/* Create Assignment */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Hausaufgaben-Verwaltung
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={students.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Neue Aufgabe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neue Hausaufgabe erstellen</DialogTitle>
                  <DialogDescription>
                    Erstellen Sie eine neue Hausaufgabe mit Titel, Beschreibung und Fälligkeitsdatum.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hw-title">Titel*</Label>
                    <Input
                      id="hw-title"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Aufgabentitel..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hw-description">Beschreibung</Label>
                    <Textarea
                      id="hw-description"
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Aufgabenbeschreibung..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hw-due">Fälligkeitsdatum*</Label>
                    <Input
                      id="hw-due"
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={createAssignment}
                      disabled={!newAssignment.title.trim() || !newAssignment.dueDate}
                      className="flex-1"
                    >
                      Erstellen
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Schüler:innen in der aktuellen Klasse
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Hausaufgaben erstellt
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignment.id);
                const completedCount = assignmentSubmissions.filter(s => s.status === 'completed').length;
                const incompleteCount = assignmentSubmissions.filter(s => s.status === 'incomplete').length;
                const missingCount = students.length - assignmentSubmissions.length + 
                  assignmentSubmissions.filter(s => s.status === 'missing').length;

                return (
                  <div key={assignment.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{assignment.title}</h4>
                        {assignment.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {assignment.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Fällig: {new Date(assignment.dueDate).toLocaleDateString('de-DE')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
                          Erledigt: {completedCount}
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950">
                          Unvollständig: {incompleteCount}
                        </Badge>
                        <Badge variant="outline" className="bg-red-50 dark:bg-red-950">
                          Fehlend: {missingCount}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAssignment(assignment.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Student Status Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {students.map((student) => {
                        const submission = getSubmissionForStudent(assignment.id, student.id);
                        return (
                          <div key={student.id} className="p-2 border rounded flex items-center justify-between">
                            <span className="text-sm">{student.name}</span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={submission?.status === 'completed' ? 'default' : 'outline'}
                                onClick={() => updateSubmission(assignment.id, student.id, 'completed')}
                                className="h-6 px-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant={submission?.status === 'incomplete' ? 'default' : 'outline'}
                                onClick={() => updateSubmission(assignment.id, student.id, 'incomplete')}
                                className="h-6 px-1"
                              >
                                <Clock className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant={submission?.status === 'missing' ? 'default' : 'outline'}
                                onClick={() => updateSubmission(assignment.id, student.id, 'missing')}
                                className="h-6 px-1"
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}