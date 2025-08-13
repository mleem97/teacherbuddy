import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { Student, ParticipationRecord, ParticipationLevel } from '../types/classbook';

interface ParticipationTrackerProps {
  students: Student[];
  participation: ParticipationRecord[];
  onParticipationChange: (participation: ParticipationRecord[]) => void;
}

export function ParticipationTracker({
  students,
  participation,
  onParticipationChange
}: ParticipationTrackerProps) {
  const updateParticipation = (studentId: string, level: ParticipationLevel) => {
    const updatedParticipation = participation.filter(p => p.studentId !== studentId);
    
    updatedParticipation.push({
      studentId,
      level,
      note: undefined
    });
    
    onParticipationChange(updatedParticipation);
  };

  const getStudentParticipation = (studentId: string): ParticipationLevel | null => {
    const record = participation.find(p => p.studentId === studentId);
    return record?.level || null;
  };

  const getLevelColor = (level: ParticipationLevel) => {
    switch (level) {
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-green-500';
      case 5:
        return 'bg-emerald-500';
    }
  };

  const getLevelText = (level: ParticipationLevel) => {
    switch (level) {
      case 1:
        return 'Sehr schwach';
      case 2:
        return 'Schwach';
      case 3:
        return 'Befriedigend';
      case 4:
        return 'Gut';
      case 5:
        return 'Sehr gut';
    }
  };

  const averageParticipation = participation.length > 0 
    ? (participation.reduce((sum, p) => sum + p.level, 0) / participation.length).toFixed(1)
    : '0.0';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Beteiligung
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">
              Bewertet: {participation.length}/{students.length}
            </Badge>
            <Badge variant="outline">
              Durchschnitt: {averageParticipation}
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
              const level = getStudentParticipation(student.id);
              return (
                <div key={student.id} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{student.name}</span>
                    {level && (
                      <div className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${getLevelColor(level)}`} />
                        <span className="text-sm font-medium">{level}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground mb-1">Bewertung (1-5)</div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          size="sm"
                          variant={level === rating ? 'default' : 'outline'}
                          onClick={() => updateParticipation(student.id, rating as ParticipationLevel)}
                          className="h-8 w-8 p-0 text-xs"
                        >
                          {rating}
                        </Button>
                      ))}
                    </div>
                    {level && (
                      <div className="text-xs text-muted-foreground">
                        {getLevelText(level)}
                      </div>
                    )}
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