import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Switch } from "./components/ui/switch";
import { Badge } from "./components/ui/badge";
import { Textarea } from "./components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Checkbox } from "./components/ui/checkbox";
import { Separator } from "./components/ui/separator";
import { ToasterProvider } from "./components/ToasterProvider";
import { AttendanceTracker } from "./components/AttendanceTracker";
import { ParticipationTracker } from "./components/ParticipationTracker";
import { HomeworkManager } from "./components/HomeworkManager";
import { ClassbookStatistics } from "./components/ClassbookStatistics";
import { GroupBuilder } from "./components/GroupBuilder";
import { ClassPicker } from "./components/ClassPicker";
import {
  Users,
  Shuffle,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  Moon,
  Sun,
  Plus,
  CheckCircle,
  BookOpen,
  Calendar,
  Save,
  FileText,
  BarChart3,
  Clock,
  UserMinus,
  Settings,
  GraduationCap,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { 
  Student,
  LessonRecord,
  HomeworkAssignment,
  HomeworkSubmission,
  ClassbookData,
  AttendanceRecord,
  ParticipationRecord,
  SchoolClass,
  StudentData
} from "./types/classbook";

export default function App() {
  // Class Management State
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [currentClassId, setCurrentClassId] = useState<string>('');

  // Original Random Selection State (now per class)
  const [names, setNames] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [absentNames, setAbsentNames] = useState<string[]>([]);
  const [selectionCounts, setSelectionCounts] = useState<Record<string, number>>({});
  const [currentName, setCurrentName] = useState("");
  const [inputName, setInputName] = useState("");
  const [csvInput, setCsvInput] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fairnessEnabled, setFairnessEnabled] = useState(true);

  // Classbook State (filtered by current class)
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [homeworkAssignments, setHomeworkAssignments] = useState<HomeworkAssignment[]>([]);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>([]);
  
  // Current Lesson State
  const [currentLesson, setCurrentLesson] = useState<{
    topic: string;
    content: string;
    notes: string;
    date: string;
    startTime: string;
    endTime: string;
    attendance: AttendanceRecord[];
    participation: ParticipationRecord[];
  }>({
    topic: '',
    content: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    startTime: new Date().toTimeString().slice(0, 5),
    endTime: '',
    attendance: [],
    participation: []
  });

  // Get current class students and related data
  const currentClassStudents = students.filter(student => student.classId === currentClassId);
  const currentClassLessons = lessons.filter(lesson => lesson.classId === currentClassId);
  const currentClassHomework = homeworkAssignments.filter(hw => hw.classId === currentClassId);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("teacherbuddy-data");
    const savedClassbook = localStorage.getItem("teacherbuddy-classbook");
    const savedDarkMode = localStorage.getItem("teacherbuddy-darkmode");

    if (savedClassbook) {
      try {
        const classbookData: ClassbookData = JSON.parse(savedClassbook);
        setClasses(classbookData.classes || []);
        setStudents(classbookData.students || []);
        setLessons(classbookData.lessons || []);
        setHomeworkAssignments(classbookData.homeworkAssignments || []);
        setHomeworkSubmissions(classbookData.homeworkSubmissions || []);
        
        // Set current class if available
        if (classbookData.currentClassId && classbookData.classes?.some(c => c.id === classbookData.currentClassId)) {
          setCurrentClassId(classbookData.currentClassId);
        } else if (classbookData.classes && classbookData.classes.length > 0) {
          setCurrentClassId(classbookData.classes[0].id);
        }
      } catch (error) {
        console.error("Error loading classbook data:", error);
      }
    }

    // Load legacy data for backward compatibility
    if (savedData) {
      try {
        const data: StudentData = JSON.parse(savedData);
        if (data.currentClassId) {
          setCurrentClassId(data.currentClassId);
        }
        // Legacy names will be loaded when a class is selected
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }

    if (savedDarkMode) {
      const darkMode = JSON.parse(savedDarkMode);
      setIsDarkMode(darkMode);
      if (darkMode) {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  // Load class-specific data when class changes
  useEffect(() => {
    if (currentClassId) {
      const classStudents = students.filter(s => s.classId === currentClassId);
      const classNames = classStudents.map(s => s.name);
      setNames(classNames);
      
      // Load class-specific selection data
      const savedClassData = localStorage.getItem(`teacherbuddy-class-${currentClassId}`);
      if (savedClassData) {
        try {
          const classData: StudentData = JSON.parse(savedClassData);
          setSelectedNames(classData.selectedNames || []);
          setAbsentNames(classData.absentNames || []);
          setSelectionCounts(classData.selectionCounts || {});
        } catch (error) {
          console.error("Error loading class data:", error);
        }
      } else {
        // Initialize empty state for new class
        setSelectedNames([]);
        setAbsentNames([]);
        const initialCounts: Record<string, number> = {};
        classNames.forEach(name => {
          initialCounts[name] = 0;
        });
        setSelectionCounts(initialCounts);
      }
    } else {
      setNames([]);
      setSelectedNames([]);
      setAbsentNames([]);
      setSelectionCounts({});
    }
    setCurrentName('');
  }, [currentClassId, students]);

  // Save data to localStorage
  useEffect(() => {
    const classbookData: ClassbookData = {
      classes,
      students,
      lessons,
      homeworkAssignments,
      homeworkSubmissions,
      currentClassId,
      lastBackup: new Date().toISOString()
    };
    localStorage.setItem("teacherbuddy-classbook", JSON.stringify(classbookData));
  }, [classes, students, lessons, homeworkAssignments, homeworkSubmissions, currentClassId]);

  // Save class-specific data
  useEffect(() => {
    if (currentClassId) {
      const classData: StudentData = { 
        names, 
        selectedNames, 
        absentNames, 
        selectionCounts,
        currentClassId 
      };
      localStorage.setItem(`teacherbuddy-class-${currentClassId}`, JSON.stringify(classData));
    }
  }, [names, selectedNames, absentNames, selectionCounts, currentClassId]);

  // Handle dark mode toggle
  useEffect(() => {
    localStorage.setItem("teacherbuddy-darkmode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Class Management Functions
  const handleClassCreate = (newClassData: Omit<SchoolClass, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClass: SchoolClass = {
      ...newClassData,
      id: `class-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setClasses(prev => [...prev, newClass]);
    setCurrentClassId(newClass.id);
  };

  const handleClassUpdate = (classId: string, updates: Partial<SchoolClass>) => {
    setClasses(prev => prev.map(c => 
      c.id === classId 
        ? { ...c, ...updates, updatedAt: new Date().toISOString() }
        : c
    ));
  };

  const handleClassDelete = (classId: string) => {
    // Remove all data associated with this class
    setStudents(prev => prev.filter(s => s.classId !== classId));
    setLessons(prev => prev.filter(l => l.classId !== classId));
    setHomeworkAssignments(prev => prev.filter(hw => hw.classId !== classId));
    setClasses(prev => prev.filter(c => c.id !== classId));
    
    // Remove class-specific localStorage data
    localStorage.removeItem(`teacherbuddy-class-${classId}`);
    
    // Switch to another class or none
    const remainingClasses = classes.filter(c => c.id !== classId);
    if (remainingClasses.length > 0) {
      setCurrentClassId(remainingClasses[0].id);
    } else {
      setCurrentClassId('');
    }
  };

  const handleClassSelect = (classId: string) => {
    setCurrentClassId(classId);
    setCurrentName(''); // Reset current selection when switching classes
  };

  // Weighted random selection
  const selectWeightedRandom = (availableNames: string[]): string => {
    if (!fairnessEnabled || availableNames.length === 0) {
      return availableNames[Math.floor(Math.random() * availableNames.length)];
    }

    // Calculate weights based on selection counts (inverse weighting)
    const maxSelections = Math.max(...availableNames.map(name => selectionCounts[name] || 0), 0);
    const weights = availableNames.map(name => {
      const count = selectionCounts[name] || 0;
      // Higher weight for less selected names
      return Math.max(1, maxSelections - count + 1);
    });

    // Calculate total weight
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // Generate random number
    let random = Math.random() * totalWeight;
    
    // Find selected name based on weights
    for (let i = 0; i < availableNames.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return availableNames[i];
      }
    }
    
    // Fallback
    return availableNames[availableNames.length - 1];
  };

  // Student Management Functions
  const addName = () => {
    if (!currentClassId) {
      toast.error("Bitte wählen Sie zuerst eine Klasse aus");
      return;
    }

    if (inputName.trim() && !names.includes(inputName.trim())) {
      const newName = inputName.trim();
      setNames([...names, newName]);
      
      // Initialize selection count
      setSelectionCounts(prev => ({ ...prev, [newName]: 0 }));
      
      // Also add as student to classbook
      const newStudent: Student = {
        id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newName,
        createdAt: new Date().toISOString(),
        selectionCount: 0,
        classId: currentClassId
      };
      setStudents(prev => [...prev, newStudent]);
      
      setInputName("");
      toast.success(`${newName} wurde hinzugefügt`);
    } else if (names.includes(inputName.trim())) {
      toast.error("Dieser Name ist bereits in der Liste");
    }
  };

  const removeName = (nameToRemove: string) => {
    setNames(names.filter((name) => name !== nameToRemove));
    setSelectedNames(selectedNames.filter((name) => name !== nameToRemove));
    setAbsentNames(absentNames.filter((name) => name !== nameToRemove));
    
    // Remove from selection counts
    const newCounts = { ...selectionCounts };
    delete newCounts[nameToRemove];
    setSelectionCounts(newCounts);
    
    // Also remove from students
    setStudents(prev => prev.filter(student => student.name !== nameToRemove));
    
    toast.success(`${nameToRemove} wurde entfernt`);
  };

  const selectRandomName = () => {
    if (!currentClassId) {
      toast.error("Bitte wählen Sie zuerst eine Klasse aus");
      return;
    }

    const availableNames = names.filter((name) => 
      !selectedNames.includes(name) && !absentNames.includes(name)
    );
    
    if (availableNames.length === 0) {
      toast.error("Alle anwesenden Namen wurden bereits ausgewählt!");
      return;
    }

    const selectedName = selectWeightedRandom(availableNames);
    setSelectedNames([...selectedNames, selectedName]);
    setCurrentName(selectedName);
    
    // Update selection count
    setSelectionCounts(prev => ({
      ...prev,
      [selectedName]: (prev[selectedName] || 0) + 1
    }));
    
    // Update student selection count
    setStudents(prev => prev.map(student => 
      student.name === selectedName && student.classId === currentClassId
        ? { ...student, selectionCount: (student.selectionCount || 0) + 1 }
        : student
    ));
    
    const fairnessNote = fairnessEnabled 
      ? ` (${selectionCounts[selectedName] || 0} → ${(selectionCounts[selectedName] || 0) + 1} mal gewählt)`
      : '';
    
    toast.success(`${selectedName} ist dran!${fairnessNote}`);
  };

  const resetSelection = () => {
    setSelectedNames([]);
    setCurrentName("");
    toast.success("Auswahl zurückgesetzt");
  };

  const resetSelectionCounts = () => {
    const resetCounts: Record<string, number> = {};
    names.forEach(name => {
      resetCounts[name] = 0;
    });
    setSelectionCounts(resetCounts);
    
    // Also reset in students
    setStudents(prev => prev.map(student => 
      student.classId === currentClassId
        ? { ...student, selectionCount: 0 }
        : student
    ));
    
    toast.success("Auswahlstatistiken zurückgesetzt");
  };

  const clearAllNames = () => {
    if (!currentClassId) return;
    
    setNames([]);
    setSelectedNames([]);
    setCurrentName("");
    setAbsentNames([]);
    setSelectionCounts({});
    setStudents(prev => prev.filter(s => s.classId !== currentClassId));
    toast.success("Alle Namen der aktuellen Klasse gelöscht");
  };

  const toggleAbsent = (name: string) => {
    if (absentNames.includes(name)) {
      setAbsentNames(absentNames.filter(n => n !== name));
      toast.success(`${name} ist wieder anwesend`);
    } else {
      setAbsentNames([...absentNames, name]);
      toast.success(`${name} als abwesend markiert`);
    }
  };

  const importCSV = () => {
    if (!currentClassId) {
      toast.error("Bitte wählen Sie zuerst eine Klasse aus");
      return;
    }

    if (!csvInput.trim()) return;

    const lines = csvInput.split("\n");
    const newNames: string[] = [];
    const newStudents: Student[] = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !names.includes(trimmedLine) && !newNames.includes(trimmedLine)) {
        newNames.push(trimmedLine);
        newStudents.push({
          id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: trimmedLine,
          createdAt: new Date().toISOString(),
          selectionCount: 0,
          classId: currentClassId
        });
      }
    });

    if (newNames.length > 0) {
      setNames([...names, ...newNames]);
      setStudents(prev => [...prev, ...newStudents]);
      
      // Initialize selection counts for new names
      const newCounts = { ...selectionCounts };
      newNames.forEach(name => {
        newCounts[name] = 0;
      });
      setSelectionCounts(newCounts);
      
      setCsvInput("");
      toast.success(`${newNames.length} Namen importiert`);
    } else {
      toast.error("Keine neuen Namen gefunden");
    }
  };

  const exportCSV = () => {
    if (names.length === 0) {
      toast.error("Keine Namen zum Exportieren");
      return;
    }

    const csvContent = names.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `teacherbuddy-names-${currentClassId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Namen exportiert");
  };

  // Lesson Functions
  const saveCurrentLesson = () => {
    if (!currentClassId) {
      toast.error("Bitte wählen Sie zuerst eine Klasse aus");
      return;
    }

    if (!currentLesson.topic.trim()) {
      toast.error("Bitte Stundenthema eingeben");
      return;
    }

    if (!currentLesson.endTime) {
      setCurrentLesson(prev => ({
        ...prev,
        endTime: new Date().toTimeString().slice(0, 5)
      }));
    }

    const lesson: LessonRecord = {
      id: `lesson-${Date.now()}`,
      date: currentLesson.date,
      startTime: currentLesson.startTime,
      endTime: currentLesson.endTime || new Date().toTimeString().slice(0, 5),
      topic: currentLesson.topic,
      content: currentLesson.content || undefined,
      notes: currentLesson.notes || undefined,
      attendance: currentLesson.attendance,
      participation: currentLesson.participation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      classId: currentClassId
    };

    setLessons(prev => [...prev, lesson]);
    
    // Reset current lesson
    setCurrentLesson({
      topic: '',
      content: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toTimeString().slice(0, 5),
      endTime: '',
      attendance: [],
      participation: []
    });

    toast.success("Stunde gespeichert");
  };

  const exportClassbook = () => {
    const classbookData: ClassbookData = {
      classes,
      students,
      lessons,
      homeworkAssignments,
      homeworkSubmissions,
      currentClassId,
      lastBackup: new Date().toISOString()
    };

    const dataStr = JSON.stringify(classbookData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `klassenbuch-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Klassenbuch exportiert");
  };

  const importClassbook = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const classbookData: ClassbookData = JSON.parse(e.target?.result as string);
        
        setClasses(classbookData.classes || []);
        setStudents(classbookData.students || []);
        setLessons(classbookData.lessons || []);
        setHomeworkAssignments(classbookData.homeworkAssignments || []);
        setHomeworkSubmissions(classbookData.homeworkSubmissions || []);
        
        // Set current class
        if (classbookData.currentClassId && classbookData.classes?.some(c => c.id === classbookData.currentClassId)) {
          setCurrentClassId(classbookData.currentClassId);
        } else if (classbookData.classes && classbookData.classes.length > 0) {
          setCurrentClassId(classbookData.classes[0].id);
        }
        
        toast.success("Klassenbuch importiert");
      } catch (error) {
        toast.error("Fehler beim Importieren");
        console.error("Import error:", error);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const availableNames = names.filter((name) => !selectedNames.includes(name) && !absentNames.includes(name));
  const allSelected = names.length > 0 && availableNames.length === 0;

  // Show class selection prompt if no class is selected
  if (!currentClassId || !classes.find(c => c.id === currentClassId)) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl font-medium">Teacherbuddy</h1>
                <span className="text-xs text-muted-foreground">by mleem97</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              <Moon className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Willkommen bei Teacherbuddy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Um zu beginnen, erstellen Sie eine neue Klasse oder wählen Sie eine bestehende aus.
                </p>
              </CardContent>
            </Card>

            <ClassPicker
              classes={classes}
              currentClassId={currentClassId}
              onClassSelect={handleClassSelect}
              onClassCreate={handleClassCreate}
              onClassUpdate={handleClassUpdate}
              onClassDelete={handleClassDelete}
              studentCount={0}
              lessonCount={0}
            />

            {classes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Import/Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={exportClassbook} variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Klassenbuch exportieren
                    </Button>
                    <div className="relative flex-1">
                      <input
                        type="file"
                        accept=".json"
                        onChange={importClassbook}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button variant="outline" className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        Klassenbuch importieren
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <ToasterProvider />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-medium">Teacherbuddy</h1>
              <span className="text-xs text-muted-foreground">by mleem97</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button onClick={exportClassbook} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importClassbook}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              <Moon className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Class Picker */}
        <div className="mb-6">
          <ClassPicker
            classes={classes}
            currentClassId={currentClassId}
            onClassSelect={handleClassSelect}
            onClassCreate={handleClassCreate}
            onClassUpdate={handleClassUpdate}
            onClassDelete={handleClassDelete}
            studentCount={currentClassStudents.length}
            lessonCount={currentClassLessons.length}
          />
        </div>

        <Tabs defaultValue="random" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="random" className="flex items-center gap-2">
              <Shuffle className="w-4 h-4" />
              Zufallsauswahl
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gruppen
            </TabsTrigger>
            <TabsTrigger value="lesson" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Stunde
            </TabsTrigger>
            <TabsTrigger value="homework" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Hausaufgaben
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistiken
            </TabsTrigger>
          </TabsList>

          {/* Random Selection Tab */}
          <TabsContent value="random">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Selection Area */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Shuffle className="w-5 h-5" />
                        Zufallsauswahl
                      </CardTitle>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="fairness-toggle" className="text-sm">
                            Fairness-Gewichtung
                          </Label>
                          <Switch
                            id="fairness-toggle"
                            checked={fairnessEnabled}
                            onCheckedChange={setFairnessEnabled}
                          />
                        </div>
                        <Button onClick={resetSelectionCounts} variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Statistiken zurücksetzen
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Selection */}
                    <div className="text-center py-8">
                      {currentName ? (
                        <div className="space-y-4">
                          <Badge variant="outline" className="text-lg px-4 py-2">
                            Ausgewählt
                          </Badge>
                          <div className="text-3xl font-medium text-primary">
                            {currentName}
                          </div>
                          {fairnessEnabled && (
                            <div className="text-sm text-muted-foreground">
                              Bereits {selectionCounts[currentName] || 0} mal gewählt
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          Klicke auf "Zufällig auswählen" um zu starten
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={selectRandomName}
                        disabled={allSelected}
                        className="flex-1"
                        size="lg"
                      >
                        <Shuffle className="w-4 h-4 mr-2" />
                        {allSelected ? "Alle ausgewählt" : "Zufällig auswählen"}
                      </Button>
                      <Button onClick={resetSelection} variant="outline" size="lg">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Zurücksetzen
                      </Button>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-medium text-primary">
                          {names.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Gesamt</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-medium text-primary">
                          {availableNames.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Verfügbar</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-medium text-primary">
                          {absentNames.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Abwesend</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Names List */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Namensliste ({names.length})
                      </span>
                      <Button
                        onClick={clearAllNames}
                        variant="outline"
                        size="sm"
                        disabled={names.length === 0}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Alle löschen
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {names.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Noch keine Namen hinzugefügt
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {names.map((name) => (
                          <div
                            key={name}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              selectedNames.includes(name)
                                ? "bg-muted text-muted-foreground line-through"
                                : absentNames.includes(name)
                                ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                                : "bg-card"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={`absent-${name}`}
                                checked={absentNames.includes(name)}
                                onCheckedChange={() => toggleAbsent(name)}
                              />
                              <Label 
                                htmlFor={`absent-${name}`}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                {selectedNames.includes(name) && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                                {absentNames.includes(name) && (
                                  <UserMinus className="w-4 h-4 text-red-500" />
                                )}
                                <span>{name}</span>
                                {fairnessEnabled && selectionCounts[name] > 0 && (
                                  <Badge variant="outline" className="ml-2">
                                    {selectionCounts[name]}x
                                  </Badge>
                                )}
                              </Label>
                            </div>
                            <Button onClick={() => removeName(name)} variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Add Name */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Namen hinzufügen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name-input">Name</Label>
                      <Input
                        id="name-input"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addName()}
                        placeholder="Name eingeben..."
                      />
                    </div>
                    <Button onClick={addName} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Hinzufügen
                    </Button>
                  </CardContent>
                </Card>

                {/* Import/Export */}
                <Card>
                  <CardHeader>
                    <CardTitle>Import/Export Namen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="import" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="import">Import</TabsTrigger>
                        <TabsTrigger value="export">Export</TabsTrigger>
                      </TabsList>

                      <TabsContent value="import" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="csv-input">Namen (einer pro Zeile)</Label>
                          <Textarea
                            id="csv-input"
                            value={csvInput}
                            onChange={(e) => setCsvInput(e.target.value)}
                            placeholder="Max Mustermann&#10;Anna Schmidt&#10;Tom Weber"
                            rows={4}
                          />
                        </div>
                        <Button onClick={importCSV} className="w-full">
                          <Upload className="w-4 h-4 mr-2" />
                          Importieren
                        </Button>
                      </TabsContent>

                      <TabsContent value="export" className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Alle Namen als CSV-Datei herunterladen
                        </p>
                        <Button onClick={exportCSV} className="w-full" disabled={names.length === 0}>
                          <Download className="w-4 h-4 mr-2" />
                          Exportieren
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Fairness Info */}
                {fairnessEnabled && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Fairness-Gewichtung
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <p>
                        Namen, die seltener ausgewählt wurden, haben eine höhere Chance, 
                        als nächstes gewählt zu werden. Dies sorgt für eine fairere Verteilung.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups">
            <GroupBuilder 
              availableNames={names}
              absentNames={absentNames}
            />
          </TabsContent>

          {/* Lesson Tab */}
          <TabsContent value="lesson">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <AttendanceTracker
                  students={currentClassStudents}
                  attendance={currentLesson.attendance}
                  onAttendanceChange={(attendance) =>
                    setCurrentLesson(prev => ({ ...prev, attendance }))
                  }
                />

                <ParticipationTracker
                  students={currentClassStudents}
                  participation={currentLesson.participation}
                  onParticipationChange={(participation) =>
                    setCurrentLesson(prev => ({ ...prev, participation }))
                  }
                />
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Stundendetails
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="lesson-date">Datum</Label>
                      <Input
                        id="lesson-date"
                        type="date"
                        value={currentLesson.date}
                        onChange={(e) =>
                          setCurrentLesson(prev => ({ ...prev, date: e.target.value }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="start-time">Beginn</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={currentLesson.startTime}
                          onChange={(e) =>
                            setCurrentLesson(prev => ({ ...prev, startTime: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-time">Ende</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={currentLesson.endTime}
                          onChange={(e) =>
                            setCurrentLesson(prev => ({ ...prev, endTime: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lesson-topic">Thema*</Label>
                      <Input
                        id="lesson-topic"
                        value={currentLesson.topic}
                        onChange={(e) =>
                          setCurrentLesson(prev => ({ ...prev, topic: e.target.value }))
                        }
                        placeholder="Stundenthema eingeben..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lesson-content">Inhalte</Label>
                      <Textarea
                        id="lesson-content"
                        value={currentLesson.content}
                        onChange={(e) =>
                          setCurrentLesson(prev => ({ ...prev, content: e.target.value }))
                        }
                        placeholder="Behandelte Inhalte..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lesson-notes">Notizen</Label>
                      <Textarea
                        id="lesson-notes"
                        value={currentLesson.notes}
                        onChange={(e) =>
                          setCurrentLesson(prev => ({ ...prev, notes: e.target.value }))
                        }
                        placeholder="Besondere Vorkommnisse..."
                        rows={3}
                      />
                    </div>

                    <Button onClick={saveCurrentLesson} className="w-full" size="lg">
                      <Save className="w-4 h-4 mr-2" />
                      Stunde speichern
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Homework Tab */}
          <TabsContent value="homework">
            <HomeworkManager
              students={currentClassStudents}
              assignments={currentClassHomework}
              submissions={homeworkSubmissions}
              onAssignmentsChange={(assignments) => {
                // Update assignments, ensuring they have the correct classId
                const updatedAssignments = assignments.map(hw => ({
                  ...hw,
                  classId: currentClassId
                }));
                setHomeworkAssignments(prev => [
                  ...prev.filter(hw => hw.classId !== currentClassId),
                  ...updatedAssignments
                ]);
              }}
              onSubmissionsChange={setHomeworkSubmissions}
            />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Stundenübersicht
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentClassLessons.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Noch keine Stunden dokumentiert
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentClassLessons.slice().reverse().map((lesson) => (
                      <div key={lesson.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{lesson.topic}</h4>
                          <div className="flex gap-2">
                            <Badge variant="outline">
                              {new Date(lesson.date).toLocaleDateString('de-DE')}
                            </Badge>
                            <Badge variant="outline">
                              {lesson.startTime} - {lesson.endTime}
                            </Badge>
                          </div>
                        </div>
                        
                        {lesson.content && (
                          <p className="text-sm text-muted-foreground">{lesson.content}</p>
                        )}
                        
                        {lesson.notes && (
                          <p className="text-sm italic text-muted-foreground">
                            Notizen: {lesson.notes}
                          </p>
                        )}

                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Anwesend: {lesson.attendance.filter(a => a.status === 'present').length}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-yellow-500" />
                            Zu spät: {lesson.attendance.filter(a => a.status === 'late').length}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserMinus className="w-4 h-4 text-red-500" />
                            Abwesend: {lesson.attendance.filter(a => a.status === 'absent').length}
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            Bewertungen: {lesson.participation.length}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics">
            <ClassbookStatistics
              students={currentClassStudents}
              lessons={currentClassLessons}
              homeworkAssignments={currentClassHomework}
              homeworkSubmissions={homeworkSubmissions}
            />
          </TabsContent>
        </Tabs>
      </div>

      <ToasterProvider />
    </div>
  );
}