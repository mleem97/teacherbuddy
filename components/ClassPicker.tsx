import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';
import { 
  GraduationCap,
  Plus,
  Settings,
  Users,
  BookOpen,
  Calendar,
  Edit3,
  Trash2,
  Check
} from 'lucide-react';
import { SchoolClass } from '../types/classbook';
import { toast } from 'sonner';

interface ClassPickerProps {
  classes: SchoolClass[];
  currentClassId?: string;
  onClassSelect: (classId: string) => void;
  onClassCreate: (newClass: Omit<SchoolClass, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClassUpdate: (classId: string, updates: Partial<SchoolClass>) => void;
  onClassDelete: (classId: string) => void;
  studentCount?: number;
  lessonCount?: number;
}

export function ClassPicker({
  classes,
  currentClassId,
  onClassSelect,
  onClassCreate,
  onClassUpdate,
  onClassDelete,
  studentCount = 0,
  lessonCount = 0
}: ClassPickerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [newClass, setNewClass] = useState({
    name: '',
    subject: '',
    grade: '',
    schoolYear: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
    description: ''
  });

  const currentClass = classes.find(c => c.id === currentClassId);

  const handleCreateClass = () => {
    if (!newClass.name.trim()) {
      toast.error('Klassenname ist erforderlich');
      return;
    }

    onClassCreate({
      name: newClass.name,
      subject: newClass.subject || undefined,
      grade: newClass.grade || undefined,
      schoolYear: newClass.schoolYear || undefined,
      description: newClass.description || undefined
    });

    setNewClass({
      name: '',
      subject: '',
      grade: '',
      schoolYear: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
      description: ''
    });
    setIsCreateDialogOpen(false);
    toast.success('Klasse erfolgreich erstellt');
  };

  const handleEditClass = () => {
    if (!editingClass || !editingClass.name.trim()) {
      toast.error('Klassenname ist erforderlich');
      return;
    }

    onClassUpdate(editingClass.id, {
      name: editingClass.name,
      subject: editingClass.subject,
      grade: editingClass.grade,
      schoolYear: editingClass.schoolYear,
      description: editingClass.description
    });

    setEditingClass(null);
    setIsEditDialogOpen(false);
    toast.success('Klasse erfolgreich aktualisiert');
  };

  const handleDeleteClass = (classToDelete: SchoolClass) => {
    if (window.confirm(`Möchten Sie die Klasse "${classToDelete.name}" wirklich löschen? Alle zugehörigen Daten gehen verloren.`)) {
      onClassDelete(classToDelete.id);
      toast.success('Klasse gelöscht');
    }
  };

  const openEditDialog = (classItem: SchoolClass) => {
    setEditingClass({ ...classItem });
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Klassenauswahl
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Neue Klasse
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neue Klasse erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie eine neue Klasse mit allen erforderlichen Informationen.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="class-name">Klassenname*</Label>
                  <Input
                    id="class-name"
                    value={newClass.name}
                    onChange={(e) => setNewClass(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="z.B. 10a, Mathe-LK, etc."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class-subject">Fach</Label>
                    <Input
                      id="class-subject"
                      value={newClass.subject}
                      onChange={(e) => setNewClass(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Mathematik, Deutsch, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class-grade">Klassenstufe</Label>
                    <Input
                      id="class-grade"
                      value={newClass.grade}
                      onChange={(e) => setNewClass(prev => ({ ...prev, grade: e.target.value }))}
                      placeholder="5, 10, Q1, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school-year">Schuljahr</Label>
                  <Input
                    id="school-year"
                    value={newClass.schoolYear}
                    onChange={(e) => setNewClass(prev => ({ ...prev, schoolYear: e.target.value }))}
                    placeholder="2024/2025"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class-description">Beschreibung</Label>
                  <Textarea
                    id="class-description"
                    value={newClass.description}
                    onChange={(e) => setNewClass(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Zusätzliche Informationen zur Klasse..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateClass} className="flex-1">
                    Erstellen
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Abbrechen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {classes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Klassen vorhanden</p>
            <p className="text-sm">Erstellen Sie Ihre erste Klasse, um zu beginnen</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="class-select">Aktuelle Klasse</Label>
              <Select value={currentClassId || ''} onValueChange={onClassSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Klasse auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      <div className="flex items-center gap-2">
                        <span>{classItem.name}</span>
                        {classItem.subject && (
                          <Badge variant="outline" className="text-xs">
                            {classItem.subject}
                          </Badge>
                        )}
                        {classItem.grade && (
                          <Badge variant="outline" className="text-xs">
                            {classItem.grade}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentClass && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{currentClass.name}</h4>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => openEditDialog(currentClass)}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDeleteClass(currentClass)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {currentClass.subject && (
                    <div>
                      <span className="text-muted-foreground">Fach:</span>
                      <div>{currentClass.subject}</div>
                    </div>
                  )}
                  {currentClass.grade && (
                    <div>
                      <span className="text-muted-foreground">Stufe:</span>
                      <div>{currentClass.grade}</div>
                    </div>
                  )}
                  {currentClass.schoolYear && (
                    <div>
                      <span className="text-muted-foreground">Schuljahr:</span>
                      <div>{currentClass.schoolYear}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Erstellt:</span>
                    <div>{new Date(currentClass.createdAt).toLocaleDateString('de-DE')}</div>
                  </div>
                </div>

                {currentClass.description && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Beschreibung:</span>
                    <p className="mt-1">{currentClass.description}</p>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">{studentCount}</span> Schüler:innen
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">{lessonCount}</span> Stunden
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Klasse bearbeiten</DialogTitle>
              <DialogDescription>
                Bearbeiten Sie die Informationen der ausgewählten Klasse.
              </DialogDescription>
            </DialogHeader>
            {editingClass && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-class-name">Klassenname*</Label>
                  <Input
                    id="edit-class-name"
                    value={editingClass.name}
                    onChange={(e) => setEditingClass(prev => prev ? { ...prev, name: e.target.value } : null)}
                    placeholder="z.B. 10a, Mathe-LK, etc."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-class-subject">Fach</Label>
                    <Input
                      id="edit-class-subject"
                      value={editingClass.subject || ''}
                      onChange={(e) => setEditingClass(prev => prev ? { ...prev, subject: e.target.value } : null)}
                      placeholder="Mathematik, Deutsch, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-class-grade">Klassenstufe</Label>
                    <Input
                      id="edit-class-grade"
                      value={editingClass.grade || ''}
                      onChange={(e) => setEditingClass(prev => prev ? { ...prev, grade: e.target.value } : null)}
                      placeholder="5, 10, Q1, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-school-year">Schuljahr</Label>
                  <Input
                    id="edit-school-year"
                    value={editingClass.schoolYear || ''}
                    onChange={(e) => setEditingClass(prev => prev ? { ...prev, schoolYear: e.target.value } : null)}
                    placeholder="2024/2025"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-class-description">Beschreibung</Label>
                  <Textarea
                    id="edit-class-description"
                    value={editingClass.description || ''}
                    onChange={(e) => setEditingClass(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Zusätzliche Informationen zur Klasse..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleEditClass} className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    Speichern
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Abbrechen
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}