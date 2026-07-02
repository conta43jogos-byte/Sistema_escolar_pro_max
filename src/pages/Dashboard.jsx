import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, BookOpen, School, DoorOpen, Calendar, Zap, AlertTriangle, Clock, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import MonthlyCalendar from "@/components/Painel/MonthlyCalendar";
import WeekStrip from "@/components/Painel/WeekStrip";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ teachers: 0, subjects: 0, classes: 0, rooms: 0, slots: 0, generated: 0, conflicts: 0 });
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [teacherList, subjects, classGroups, rooms, slotList] = await Promise.all([
        base44.entities.Teacher.list(),
        base44.entities.Subject.list(),
        base44.entities.ClassGroup.list(),
        base44.entities.Room.list(),
        base44.entities.ScheduleSlot.list("-created_date", 500)
      ]);
      setClasses(classGroups);
      setTeachers(teacherList);
      setSlots(slotList);
      const generated = classGroups.filter(c => c.schedule_status === "generated" || c.schedule_status === "optimized").length;
      setStats({
        teachers: teacherList.length,
        subjects: subjects.length,
        classes: classGroups.length,
        rooms: rooms.length,
        slots: slotList.length,
        generated,
        conflicts: classGroups.filter(c => c.schedule_status === "conflict").length
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const efficiency = stats.classes > 0 ? Math.round((stats.generated / stats.classes) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "Professores", value: stats.teachers, sub: "ativos", gradient: "from-blue-500 to-blue-600", path: "/teachers" },
    { icon: School, label: "Turmas", value: stats.classes, sub: `${stats.generated} com grade`, gradient: "from-emerald-500 to-emerald-600", path: "/classes" },
    { icon: BookOpen, label: "Disciplinas", value: stats.subjects, sub: "cadastradas", gradient: "from-violet-500 to-violet-600", path: "/subjects" },
    { icon: DoorOpen, label: "Salas", value: stats.rooms, sub: "disponíveis", gradient: "from-amber-500 to-amber-600", path: "/rooms" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Bem-vindo ao Sistema Escolar Pro Max</p>
        </div>
        <Button onClick={() => navigate("/schedule")} className="gap-2 shadow-lg shadow-primary/25">
          <Zap className="w-4 h-4" /> Gerar Grade Automática
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, sub, gradient, path }) => (
          <button key={label} onClick={() => navigate(path)}
            className="group bg-card rounded-xl border border-border/50 p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-5 rounded-full translate-x-8 -translate-y-8 group-hover:opacity-10 transition-opacity`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-sm`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm font-medium mt-0.5">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </button>
        ))}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Efficiency */}
        <div className="bg-card rounded-xl border border-border/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium">Eficiência da Grade</span>
            </div>
            <span className="text-2xl font-bold text-emerald-600">{efficiency}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${efficiency}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{stats.generated} de {stats.classes} turmas com grade gerada</p>
        </div>

        {/* Slots */}
        <div className="bg-card rounded-xl border border-border/50 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">{stats.slots}</p>
            <p className="text-sm font-medium">Aulas Distribuídas</p>
            <p className="text-xs text-muted-foreground">Total na grade semanal</p>
          </div>
        </div>

        {/* Conflicts */}
        <div className={`rounded-xl border p-5 flex items-center gap-4 ${stats.conflicts > 0 ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stats.conflicts > 0 ? "bg-red-100" : "bg-emerald-100"}`}>
            {stats.conflicts > 0
              ? <AlertTriangle className="w-6 h-6 text-red-500" />
              : <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
          </div>
          <div>
            <p className={`text-3xl font-bold ${stats.conflicts > 0 ? "text-red-600" : "text-emerald-600"}`}>{stats.conflicts}</p>
            <p className="text-sm font-medium">Conflitos</p>
            <p className={`text-xs ${stats.conflicts > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {stats.conflicts === 0 ? "Tudo em ordem!" : "Requer atenção"}
            </p>
          </div>
        </div>
      </div>

      {/* Week Strip */}
      <WeekStrip slots={slots} />

      {/* Calendar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Calendário de Aulas</h2>
          <button onClick={() => navigate("/schedule")} className="text-xs text-primary hover:underline flex items-center gap-1">
            Ver grade completa <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <MonthlyCalendar slots={slots} classes={classes} teachers={teachers} />
      </div>

      {/* Classes Status */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Status das Turmas</h3>
          <button onClick={() => navigate("/classes")} className="text-xs text-primary hover:underline flex items-center gap-1">
            Gerenciar <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {classes.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <School className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma turma cadastrada.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/classes")}>Cadastrar Turma</Button>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {classes.map((c) => {
              const statusConfig = {
                optimized: { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700", label: "Otimizada" },
                generated: { dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700", label: "Gerada" },
                conflict: { dot: "bg-red-500 animate-pulse", badge: "bg-red-100 text-red-700", label: "Conflito" },
                pending: { dot: "bg-gray-300", badge: "bg-gray-100 text-gray-600", label: "Pendente" },
              }[c.schedule_status] || { dot: "bg-gray-300", badge: "bg-gray-100 text-gray-600", label: "Pendente" };

              const classSlots = slots.filter(s => s.class_group_id === c.id);

              return (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusConfig.dot}`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-tight">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.grade} • {c.shift === "morning" ? "Manhã" : "Tarde"} • {classSlots.length} aulas</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${statusConfig.badge}`}>
                    {statusConfig.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}