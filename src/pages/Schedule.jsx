import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Zap, Calendar, AlertTriangle, CheckCircle, RefreshCw, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PageHeader from "@/components/ui/PageHeader";
import { generateSchedule, detectConflicts } from "@/lib/scheduleEngine";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const DAY_LABELS = { monday: "Segunda", tuesday: "Terça", wednesday: "Quarta", thursday: "Quinta", friday: "Sexta" };
const PERIOD_TIMES_MORNING = { 1: "07:00", 2: "07:50", 3: "08:40", 4: "09:40", 5: "10:30", 6: "11:20" };
const PERIOD_TIMES_AFTERNOON = { 1: "13:00", 2: "13:50", 3: "14:40", 4: "15:40", 5: "16:30", 6: "17:20" };

export default function Schedule() {
  const { toast } = useToast();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState("class"); // class | teacher
  const [selectedId, setSelectedId] = useState("");
  const [conflictDialog, setConflictDialog] = useState(false);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [c, t, r, s, sl] = await Promise.all([
        base44.entities.ClassGroup.list(),
        base44.entities.Teacher.list(),
        base44.entities.Room.list(),
        base44.entities.Subject.list(),
        base44.entities.ScheduleSlot.list("-created_date", 500)
      ]);
      setClasses(c);
      setTeachers(t);
      setRooms(r);
      setSubjects(s);
      setSlots(sl);
      if (c.length > 0) setSelectedId(c[0].id);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    if (classes.length === 0) return toast({ title: "Cadastre turmas primeiro", variant: "destructive" });
    
    const classesWithSubjects = classes.filter(c => (c.subjects || []).length > 0 && c.subjects.some(s => s.teacher_id));
    if (classesWithSubjects.length === 0) {
      return toast({ title: "Atribua disciplinas e professores às turmas primeiro", variant: "destructive" });
    }

    setGenerating(true);
    try {
      // Delete existing slots
      if (slots.length > 0) {
        await base44.entities.ScheduleSlot.deleteMany({});
      }

      // Generate new schedule
      const result = generateSchedule(classesWithSubjects, teachers, rooms);
      
      // Assign colors from subjects
      const subjectColorMap = {};
      subjects.forEach(s => { subjectColorMap[s.name] = s.color || "#4F46E5"; });
      result.slots.forEach(slot => {
        slot.subject_color = subjectColorMap[slot.subject_name] || "#4F46E5";
      });

      // Save slots in batches
      const batchSize = 50;
      for (let i = 0; i < result.slots.length; i += batchSize) {
        const batch = result.slots.slice(i, i + batchSize);
        await base44.entities.ScheduleSlot.bulkCreate(batch);
      }

      // Update class statuses
      for (const cls of classesWithSubjects) {
        const hasConflict = result.conflicts.some(c => c.class === cls.name);
        await base44.entities.ClassGroup.update(cls.id, {
          schedule_status: hasConflict ? "conflict" : "generated"
        });
      }

      setConflicts(result.conflicts);
      if (result.conflicts.length > 0) {
        setConflictDialog(true);
      }

      toast({ title: `Grade gerada! ${result.slots.length} aulas distribuídas.` });
      loadData();
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao gerar grade", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleClearSchedule = async () => {
    if (!window.confirm("Limpar toda a grade de horários?")) return;
    try {
      await base44.entities.ScheduleSlot.deleteMany({});
      for (const cls of classes) {
        await base44.entities.ClassGroup.update(cls.id, { schedule_status: "pending" });
      }
      toast({ title: "Grade limpa" });
      loadData();
    } catch (e) {
      toast({ title: "Erro ao limpar", variant: "destructive" });
    }
  };

  const getFilteredSlots = () => {
    if (!selectedId) return [];
    if (viewMode === "class") {
      return slots.filter(s => s.class_group_id === selectedId);
    } else {
      return slots.filter(s => s.teacher_id === selectedId);
    }
  };

  const filteredSlots = getFilteredSlots();
  const periods = [1, 2, 3, 4, 5, 6];
  const selectedClass = classes.find(c => c.id === selectedId);
  const periodTimes = selectedClass?.shift === "afternoon" ? PERIOD_TIMES_AFTERNOON : PERIOD_TIMES_MORNING;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Grade de Horários"
        description={`${slots.length} aulas distribuídas`}
        actions={
          <div className="flex gap-2">
            {slots.length > 0 && (
              <Button variant="outline" onClick={handleClearSchedule} className="gap-2">
                <Trash2 className="w-4 h-4" /> Limpar
              </Button>
            )}
            <Button onClick={handleGenerate} disabled={generating} className="gap-2">
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {generating ? "Gerando..." : "Gerar Grade Automática"}
            </Button>
          </div>
        }
      />

      {/* View Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 bg-card rounded-lg p-1 border">
          <button
            onClick={() => { setViewMode("class"); if (classes.length > 0) setSelectedId(classes[0].id); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "class" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Por Turma
          </button>
          <button
            onClick={() => { setViewMode("teacher"); if (teachers.length > 0) setSelectedId(teachers[0].id); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "teacher" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Por Professor
          </button>
        </div>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder={viewMode === "class" ? "Selecione a turma" : "Selecione o professor"} />
          </SelectTrigger>
          <SelectContent>
            {viewMode === "class"
              ? classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} — {c.grade}</SelectItem>)
              : teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)
            }
          </SelectContent>
        </Select>

        {conflicts.length > 0 && (
          <Button variant="outline" className="gap-2 text-amber-600 border-amber-300" onClick={() => setConflictDialog(true)}>
            <AlertTriangle className="w-4 h-4" /> {conflicts.length} aviso(s)
          </Button>
        )}
      </div>

      {/* Timetable Grid */}
      {slots.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border/50">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground mb-1">Nenhuma grade gerada ainda.</p>
          <p className="text-sm text-muted-foreground">Cadastre turmas, disciplinas e professores, depois clique em "Gerar Grade Automática".</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/50 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium text-muted-foreground w-20">Horário</th>
                {DAYS.map(day => (
                  <th key={day} className="p-3 text-center font-medium text-muted-foreground">{DAY_LABELS[day]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map(period => (
                <tr key={period} className="border-b last:border-0">
                  <td className="p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground">{period}º</div>
                    <div className="text-[10px] text-muted-foreground">{periodTimes[period]}</div>
                  </td>
                  {DAYS.map(day => {
                    const slot = filteredSlots.find(s => s.day_of_week === day && s.period === period);
                    return (
                      <td key={day} className="p-1.5">
                        {slot ? (
                          <div 
                            className="rounded-lg p-2.5 text-white text-center min-h-[60px] flex flex-col justify-center"
                            style={{ backgroundColor: slot.subject_color || "#4F46E5" }}
                          >
                            <p className="font-semibold text-xs leading-tight">{slot.subject_name}</p>
                            <p className="text-[10px] opacity-80 mt-0.5">
                              {viewMode === "class" ? slot.teacher_name : slot.class_group_name}
                            </p>
                            {slot.room_name && (
                              <p className="text-[10px] opacity-60">{slot.room_name}</p>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-lg bg-muted/30 min-h-[60px] flex items-center justify-center">
                            <span className="text-[10px] text-muted-foreground/40">—</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Conflicts Dialog */}
      <Dialog open={conflictDialog} onOpenChange={setConflictDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Avisos da Geração
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {conflicts.map((c, i) => (
              <div key={i} className="p-3 rounded-lg bg-amber-50 text-amber-800 text-sm">
                {c.message}
              </div>
            ))}
            {conflicts.length === 0 && (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Nenhum conflito detectado!
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}