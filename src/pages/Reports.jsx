import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Users, School, DoorOpen, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import PageHeader from "@/components/ui/PageHeader";

const COLORS = ["#4F46E5", "#059669", "#D97706", "#DC2626", "#7C3AED", "#0891B2", "#DB2777", "#65A30D"];
const DAY_LABELS = { monday: "Seg", tuesday: "Ter", wednesday: "Qua", thursday: "Qui", friday: "Sex" };

export default function Reports() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [t, c, r, s] = await Promise.all([
        base44.entities.Teacher.list(),
        base44.entities.ClassGroup.list(),
        base44.entities.Room.list(),
        base44.entities.ScheduleSlot.list("-created_date", 500)
      ]);
      setTeachers(t);
      setClasses(c);
      setRooms(r);
      setSlots(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Teacher workload data
  const teacherWorkload = teachers.map(t => {
    const teacherSlots = slots.filter(s => s.teacher_id === t.id);
    return {
      name: t.name.split(" ")[0],
      fullName: t.name,
      assigned: teacherSlots.length,
      capacity: t.weekly_hours || 20,
      usage: t.weekly_hours ? Math.round((teacherSlots.length / t.weekly_hours) * 100) : 0
    };
  });

  // Room usage data
  const roomUsage = rooms.map(r => {
    const roomSlots = slots.filter(s => s.room_id === r.id);
    return {
      name: r.name,
      used: roomSlots.length,
      total: 30, // 6 periods x 5 days
      percentage: Math.round((roomSlots.length / 30) * 100)
    };
  });

  // Classes by status
  const statusCounts = [
    { name: "Otimizada", value: classes.filter(c => c.schedule_status === "optimized").length, color: "#059669" },
    { name: "Gerada", value: classes.filter(c => c.schedule_status === "generated").length, color: "#3B82F6" },
    { name: "Conflito", value: classes.filter(c => c.schedule_status === "conflict").length, color: "#DC2626" },
    { name: "Pendente", value: classes.filter(c => c.schedule_status === "pending").length, color: "#9CA3AF" },
  ].filter(s => s.value > 0);

  // Slots per day
  const slotsPerDay = Object.keys(DAY_LABELS).map(day => ({
    name: DAY_LABELS[day],
    aulas: slots.filter(s => s.day_of_week === day).length
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Relatórios" description="Análise completa da distribuição de aulas" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
          <p className="text-3xl font-bold text-primary">{slots.length}</p>
          <p className="text-sm text-muted-foreground">Aulas Distribuídas</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
          <p className="text-3xl font-bold text-emerald-600">
            {classes.length > 0 ? Math.round((classes.filter(c => c.schedule_status === "generated" || c.schedule_status === "optimized").length / classes.length) * 100) : 0}%
          </p>
          <p className="text-sm text-muted-foreground">Eficiência</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
          <p className="text-3xl font-bold text-amber-600">{classes.filter(c => c.schedule_status === "conflict").length}</p>
          <p className="text-sm text-muted-foreground">Conflitos</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
          <p className="text-3xl font-bold text-purple-600">{teachers.length}</p>
          <p className="text-sm text-muted-foreground">Professores Ativos</p>
        </div>
      </div>

      <Tabs defaultValue="teachers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="teachers">Carga Horária</TabsTrigger>
          <TabsTrigger value="rooms">Uso de Salas</TabsTrigger>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        </TabsList>

        <TabsContent value="teachers">
          <div className="bg-card rounded-xl p-6 border border-border/50">
            <h3 className="font-semibold mb-4">Carga Horária por Professor</h3>
            {teacherWorkload.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum professor cadastrado.</p>
            ) : (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teacherWorkload}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="assigned" fill="#4F46E5" name="Aulas Atribuídas" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="capacity" fill="#E2E8F0" name="Capacidade" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-2">
                  {teacherWorkload.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="font-medium text-sm">{t.fullName}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{t.assigned}/{t.capacity} aulas</span>
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${t.usage > 90 ? "bg-red-500" : t.usage > 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min(t.usage, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium w-10 text-right ${t.usage > 90 ? "text-red-600" : t.usage > 70 ? "text-amber-600" : "text-emerald-600"}`}>
                          {t.usage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rooms">
          <div className="bg-card rounded-xl p-6 border border-border/50">
            <h3 className="font-semibold mb-4">Uso de Salas</h3>
            {roomUsage.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma sala cadastrada.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomUsage.map((r, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{r.name}</span>
                      <span className="text-xs text-muted-foreground">{r.used}/30 períodos</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="h-3 rounded-full bg-primary transition-all"
                        style={{ width: `${r.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{r.percentage}% de ocupação</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <h3 className="font-semibold mb-4">Aulas por Dia da Semana</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={slotsPerDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="aulas" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <h3 className="font-semibold mb-4">Status das Turmas</h3>
              {statusCounts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Sem dados.</p>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {statusCounts.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}