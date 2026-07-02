import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";

const DAYS = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terça" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
];

const TODAY_DOW = new Date().getDay(); // 0=Sun,1=Mon...5=Fri
const DOW_MAP = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 };

export default function WeekStrip({ slots }) {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Distribuição Semanal</h3>
        </div>
        <span className="text-xs text-muted-foreground">{slots.length} aulas no total</span>
      </div>
      <div className="grid grid-cols-5 divide-x divide-border/50">
        {DAYS.map(({ key, label }) => {
          const daySlots = slots.filter(s => s.day_of_week === key);
          const isToday = DOW_MAP[key] === TODAY_DOW;
          // Group by subject for visual
          const subjectGroups = daySlots.reduce((acc, s) => {
            const existing = acc.find(a => a.subject_name === s.subject_name);
            if (existing) existing.count++;
            else acc.push({ subject_name: s.subject_name, color: s.subject_color || "#4F46E5", count: 1 });
            return acc;
          }, []).sort((a, b) => b.count - a.count).slice(0, 4);

          return (
            <div key={key}
              className={`p-3 flex flex-col min-h-[120px] cursor-pointer hover:bg-muted/50 transition-colors ${isToday ? "bg-primary/5" : ""}`}
              onClick={() => navigate("/schedule")}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${isToday ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
                {isToday && <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium">Hoje</span>}
              </div>
              <p className={`text-2xl font-bold mb-2 ${isToday ? "text-primary" : ""}`}>{daySlots.length}</p>
              <div className="space-y-1 flex-1">
                {subjectGroups.map((sg, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: sg.color }} />
                    <span className="text-[10px] text-muted-foreground truncate">{sg.subject_name}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">×{sg.count}</span>
                  </div>
                ))}
                {daySlots.length === 0 && (
                  <span className="text-[10px] text-muted-foreground/50 italic">Sem aulas</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}