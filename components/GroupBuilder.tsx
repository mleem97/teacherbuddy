import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Users,
  Shuffle,
  Settings,
  Plus,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { Group, GroupingConstraint } from '../types/classbook';
import { toast } from 'sonner';

interface GroupBuilderProps {
  availableNames: string[];
  absentNames: string[];
}

export function GroupBuilder({ availableNames, absentNames }: GroupBuilderProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupSize, setGroupSize] = useState<number>(3);
  const [groupCount, setGroupCount] = useState<number>(4);
  const [groupingMethod, setGroupingMethod] = useState<'size' | 'count'>('size');
  const [constraints, setConstraints] = useState<GroupingConstraint>({
    mustBeTogether: [],
    mustBeSeparated: []
  });

  // Filter out absent names
  const presentNames = availableNames.filter(name => !absentNames.includes(name));

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const createRandomGroups = () => {
    if (presentNames.length === 0) {
      toast.error('Keine anwesenden Schüler:innen verfügbar');
      return;
    }

    if (presentNames.length < 2) {
      toast.error('Mindestens 2 anwesende Schüler:innen für Gruppenbildung erforderlich');
      return;
    }

    let targetGroupSize: number;
    let targetGroupCount: number;

    if (groupingMethod === 'size') {
      targetGroupSize = Math.max(2, groupSize);
      targetGroupCount = Math.ceil(presentNames.length / targetGroupSize);
    } else {
      targetGroupCount = Math.max(1, Math.min(groupCount, presentNames.length));
      targetGroupSize = Math.ceil(presentNames.length / targetGroupCount);
    }

    const shuffledNames = shuffleArray(presentNames);
    const newGroups: Group[] = [];

    for (let i = 0; i < targetGroupCount; i++) {
      const startIndex = i * targetGroupSize;
      const endIndex = Math.min(startIndex + targetGroupSize, shuffledNames.length);
      const groupMembers = shuffledNames.slice(startIndex, endIndex);

      if (groupMembers.length > 0) {
        newGroups.push({
          id: `group-${i + 1}`,
          name: `Gruppe ${i + 1}`,
          members: groupMembers
        });
      }
    }

    // Distribute remaining students if any
    const totalAssigned = newGroups.reduce((sum, group) => sum + group.members.length, 0);
    if (totalAssigned < presentNames.length) {
      const remaining = shuffledNames.slice(totalAssigned);
      remaining.forEach((name, index) => {
        const targetGroup = newGroups[index % newGroups.length];
        targetGroup.members.push(name);
      });
    }

    setGroups(newGroups);
    toast.success(`${newGroups.length} Gruppen erstellt`);
  };

  const clearGroups = () => {
    setGroups([]);
    toast.success('Alle Gruppen gelöscht');
  };

  const removeFromGroup = (groupId: string, memberName: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, members: group.members.filter(m => m !== memberName) }
        : group
    ).filter(group => group.members.length > 0));
  };

  const addToGroup = (groupId: string, memberName: string) => {
    // Remove from other groups first
    setGroups(prev => prev.map(group => ({
      ...group,
      members: group.id === groupId 
        ? [...group.members.filter(m => m !== memberName), memberName]
        : group.members.filter(m => m !== memberName)
    })));
  };

  const getUnassignedNames = () => {
    const assignedNames = groups.flatMap(group => group.members);
    return presentNames.filter(name => !assignedNames.includes(name));
  };

  const unassignedNames = getUnassignedNames();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gruppenbildung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {presentNames.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Keine anwesenden Schüler:innen verfügbar</p>
              <p className="text-sm">Fügen Sie Schüler:innen hinzu und stellen Sie sicher, dass sie anwesend sind</p>
            </div>
          ) : (
            <>
              {/* Group Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="grouping-method">Gruppierungsmethode</Label>
                    <Select 
                      value={groupingMethod} 
                      onValueChange={(value: 'size' | 'count') => setGroupingMethod(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="size">Nach Gruppengröße</SelectItem>
                        <SelectItem value="count">Nach Anzahl Gruppen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {groupingMethod === 'size' ? (
                    <div className="space-y-2">
                      <Label htmlFor="group-size">Gruppengröße</Label>
                      <Input
                        id="group-size"
                        type="number"
                        min="2"
                        max={presentNames.length}
                        value={groupSize}
                        onChange={(e) => setGroupSize(parseInt(e.target.value) || 3)}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="group-count">Anzahl Gruppen</Label>
                      <Input
                        id="group-count"
                        type="number"
                        min="1"
                        max={presentNames.length}
                        value={groupCount}
                        onChange={(e) => setGroupCount(parseInt(e.target.value) || 4)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Verfügbare Schüler:innen</h4>
                    <div className="text-sm text-muted-foreground">
                      {presentNames.length} anwesend, {absentNames.length} abwesend
                    </div>
                    <div className="max-h-32 overflow-y-auto border rounded p-2">
                      <div className="flex flex-wrap gap-1">
                        {presentNames.map(name => (
                          <Badge key={name} variant="outline" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={createRandomGroups} className="flex-1">
                  <Shuffle className="w-4 h-4 mr-2" />
                  Zufällige Gruppen erstellen
                </Button>
                <Button onClick={clearGroups} variant="outline" disabled={groups.length === 0}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Zurücksetzen
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Generated Groups */}
      {groups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Erstellte Gruppen ({groups.length})</span>
              <Badge variant="outline">
                {groups.reduce((sum, group) => sum + group.members.length, 0)} Schüler:innen zugeordnet
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div key={group.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{group.name}</h4>
                    <Badge variant="secondary">
                      {group.members.length} Mitglieder
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {group.members.map((member) => (
                      <div key={member} className="flex items-center justify-between text-sm">
                        <span>{member}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromGroup(group.id, member)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {unassignedNames.length > 0 && (
                    <div className="pt-2 border-t">
                      <Select onValueChange={(name) => addToGroup(group.id, name)}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Mitglied hinzufügen..." />
                        </SelectTrigger>
                        <SelectContent>
                          {unassignedNames.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Unassigned Names */}
            {unassignedNames.length > 0 && (
              <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Nicht zugeordnete Schüler:innen ({unassignedNames.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {unassignedNames.map(name => (
                    <Badge key={name} variant="outline" className="bg-background">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}