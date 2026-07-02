import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DAYS_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const SLOT_DAY_NUM = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 };

export default function MonthlyCalendar({ slots, classes, teachers }) {
  const today = new Date();
  const [current, setCurrent] = useState({ month: today.getMonth(), year: today.getFullYear() });
  const [filterMode, setFilterMode] = useState("all");
  const [filterId, setFilterId] = useState("");
  const [selected, setSelected] = useState(null);

  const prevMonth = () => setCurrent(c => ({ month: c.month === 0 ? 11 : c.month - 1, year: c.month === 0 ? c.year - 1 : c.year }));
  const nextMonth = () => setCurrent(c => ({ month: c.month === 11 ? 0 : c.month + 1, year: c.month === 11 ? c.year + 1 : c.year }));

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const filteredSlots = useMemo(() => slots.filter(s => {
    if (filterMode === "class" && filterId) return s.class_group_id === filterId;
    if (filterMode === "teacher" && filterId) return s.teacher_id === filterId;
    return true;
  }), [slots, filterMode, filterId]);

  const getSlotsForDay = (dayNum) => {
    const dow = new Date(current.year, current.month, dayNum).getDay();
    const slotDay = Object.keys(SLOT_DAY_NUM).find(k => SLOT_DAY_NUM[k] === dow);
    if (!slotDay) return [];
    return filteredSlots.filter(s => s.day_of_week === slotDay);
  };

  const isToday = (d) => today.getFullYear() === current.year && today.getMonth() === current.month && today.getDate() === d;

  const handleDayClick = (dayNum) => {
    const daySlots = getSlotsForDay(dayNum);
    if (daySlots.length === 0) { setSelected(null); return; }
    setSelected({ date: new Date(current.year, current.month, dayNum), daySlots });
  };

  const uniqueClasses = useMemo(() => [...new Map(slots.map(s => [s.class_group_id, { id: s.class_group_id, name: s.class_group_name }])).values()], [slots]);
  const uniqueTeachers = useMemo(() => [...new Map(slots.map(s => [s.teacher_id, { id: s.teacher_id, name: s.teacher_name }])).values()], [slots]);

  // Precompute day colors for performance
  const dayData = useMemo(() => {
    const result = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const daySlots = getSlotsForDay(d);
      result[d] = daySlots;
    }
    return result;
  }, [filteredSlots, current]);

  const getHeatBg = (count) => {
    if (count === 0) return "";
    if (count <= 3) return "bg-primary/15 hover:bg-primary/25";
    if (count <= 7) return "bg-primary/30 hover:bg-primary/40";
    if (count <= 12) return "bg-primary/50 hover:bg-primary/60";
    return "bg-primary/70 text-white hover:bg-primary/80";
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
          <h3 className="font-bold text-base min-w-[170px] text-center">{MONTHS[current.month]} {current.year}</h3>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrent({ month: today.getMonth(), year: today.getFullYear() })}
            className="text-xs text-muted-foreground hover:text-foreground">
            Hoje
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex gap-0.5 bg-muted rounded-lg p-1">
            {[["all","Todas"],["class","Por Turma"],["teacher","Por Professor"]].map(([m, lbl]) => (
              <button key={m} onClick={() => { setFilterMode(m); setFilterId(""); }}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filterMode === m ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {lbl}
              </button>
            ))}
          </div>
          {filterMode !== "all" && (
            <Select value={filterId} onValueChange={setFilterId}>
              <SelectTrigger className="h-8 text-xs w-44">
                <SelectValue placeholder={filterMode === "class" ? "Selecionar turma" : "Selecionar professor"} />
              </SelectTrigger>
              <SelectContent>
                {(filterMode === "class" ? uniqueClasses : uniqueTeachers).map(item => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_WEEK.map((d, i) => (
            <div key={d} className={`text-center text-[11px] font-bold py-2 ${i === 0 || i === 6 ? "text-muted-foreground/40" : "text-muted-foreground"}`}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const daySlots = dayData[dayNum] || [];
            const count = daySlots.length;
            const dow = new Date(current.year, current.month, dayNum).getDay();
            const isWeekend = dow === 0 || dow === 6;
            const todayCell = isToday(dayNum);
            // Show top 2 subject dots
            const topSubjects = daySlots
              .reduce((acc, s) => { if (!acc.find(a => a.color === (s.subject_color || "#4F46E5"))) acc.push({ color: s.subject_color || "#4F46E5" }); return acc; }, [])
              .slice(0, 3);

            return (
              <button key={dayNum} onClick={() => handleDayClick(dayNum)}
                className={`relative rounded-lg p-1.5 min-h-[58px] text-left transition-all ${todayCell ? "ring-2 ring-primary" : ""} ${isWeekend ? "opacity-30 cursor-default" : count > 0 ? `cursor-pointer ${getHeatBg(count)}` : "hover:bg-muted/40 cursor-default"}`}>
                <span className={`text-xs font-bold ${todayCell ? "text-primary" : ""}`}>{dayNum}</span>
                {count > 0 && !isWeekend && (
                  <div className="mt-1">
                    <span className="text-[11px] font-bold leading-none">{count}</span>
                    <div className="flex gap-0.5 mt-1 flex-wrap">
                      {topSubjects.map((s, si) => (
                        <div key={si} className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      ))}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/30 flex-wrap">
          <span className="text-[10px] text-muted-foreground font-semibold">Intensidade:</span>
          {[["1-3", "bg-primary/15"], ["4-7", "bg-primary/30"], ["8-12", "bg-primary/50"], ["13+", "bg-primary/70"]].map(([lbl, cls]) => (
            <div key={lbl} className="flex items-center gap-1">
              <div className={`w-3.5 h-3.5 rounded ${cls}`} />
              <span className="text-[10px] text-muted-foreground">{lbl} aulas</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="border-t border-border/50 bg-muted/20 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-sm capitalize">
                {selected.date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">{selected.daySlots.length} aula(s) neste dia</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
            {[...selected.daySlots].sort((a, b) => a.period - b.period).map((slot, i) => (
              <div key={i} className="flex items-stretch gap-2 p-3 rounded-xl bg-background border border-border/50 hover:border-border transition-colors">
                <div className="w-1 rounded-full flex-shrink-0" style={{ backgroundColor: slot.subject_color || "#4F46E5" }} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-tight truncate">{slot.subject_name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{slot.teacher_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded font-medium">{slot.class_group_name}</span>
                    <span className="text-[9px] text-muted-foreground">{slot.period}º período</span>
                  </div>
                  {slot.room_name && <p className="text-[9px] text-muted-foreground mt-0.5">{slot.room_name}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}