import React from "react";

export default function StatCard({ icon: Icon, label, value, trend, color = "primary" }) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    green: "bg-emerald-50 text-emerald-600",
    yellow: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600"
  };

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs anterior
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}