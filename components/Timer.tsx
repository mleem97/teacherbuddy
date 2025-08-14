"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Play, Pause, RotateCcw, Bell } from "lucide-react";

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function playBeep() {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const duration = 1.0; // seconds
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880; // A5
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + duration);
    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch {}
}

export function Timer() {
  const [minutes, setMinutes] = useState<number>(() => {
    const v = localStorage.getItem("teacherbuddy.timer.minutes");
    return v ? Math.min(59, Math.max(0, parseInt(v))) : 5;
  });
  const [seconds, setSeconds] = useState<number>(() => {
    const v = localStorage.getItem("teacherbuddy.timer.seconds");
    return v ? Math.min(59, Math.max(0, parseInt(v))) : 0;
  });
  const totalInitial = useMemo(() => minutes * 60 + seconds, [minutes, seconds]);
  const [remaining, setRemaining] = useState<number>(totalInitial);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem("teacherbuddy.timer.minutes", String(minutes));
  }, [minutes]);

  useEffect(() => {
    localStorage.setItem("teacherbuddy.timer.seconds", String(seconds));
  }, [seconds]);

  useEffect(() => {
    // Reset remaining when user changes inputs while not running
    if (!running) setRemaining(totalInitial || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalInitial]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setRunning(false);
          playBeep();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, remaining]);

  const start = () => {
    if (totalInitial <= 0) return;
    if (remaining <= 0) setRemaining(totalInitial);
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setRemaining(totalInitial || 0);
  };

  const onMinutes = (v: string) => {
    const n = Number(v.replace(/[^0-9]/g, ""));
    if (Number.isFinite(n)) setMinutes(Math.min(59, Math.max(0, n)));
  };
  const onSeconds = (v: string) => {
    const n = Number(v.replace(/[^0-9]/g, ""));
    if (Number.isFinite(n)) setSeconds(Math.min(59, Math.max(0, n)));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" /> Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Timer-Eingabe">
          <div className="space-y-2">
            <Label htmlFor="timer-minutes">Minuten</Label>
            <Input
              id="timer-minutes"
              inputMode="numeric"
              value={minutes}
              onChange={(e) => onMinutes(e.target.value)}
              aria-describedby="timer-minutes-help"
            />
            <span id="timer-minutes-help" className="sr-only">0 bis 59</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timer-seconds">Sekunden</Label>
            <Input
              id="timer-seconds"
              inputMode="numeric"
              value={seconds}
              onChange={(e) => onSeconds(e.target.value)}
              aria-describedby="timer-seconds-help"
            />
            <span id="timer-seconds-help" className="sr-only">0 bis 59</span>
          </div>
        </div>

        <div className="text-center text-4xl font-medium tabular-nums" aria-live="polite" aria-atomic>
          {formatTime(remaining)}
        </div>

        <div className="flex gap-2">
          {running ? (
            <Button onClick={pause} className="flex-1">
              <Pause className="w-4 h-4 mr-2" /> Pause
            </Button>
          ) : (
            <Button onClick={start} className="flex-1" disabled={totalInitial <= 0}>
              <Play className="w-4 h-4 mr-2" /> Start
            </Button>
          )}
          <Button onClick={reset} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
