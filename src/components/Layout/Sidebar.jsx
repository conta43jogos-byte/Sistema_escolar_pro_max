import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { 
  LayoutDashboard, Users, BookOpen, School, DoorOpen, 
  Calendar, FileText, Settings, LogOut, GraduationCap,
  ChevronLeft, ChevronRight
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/", roles: ["admin", "coordination", "secretary", "teacher"] },
  { label: "Professores", icon: Users, path: "/teachers", roles: ["admin", "coordination", "secretary"] },
  { label: "Disciplinas", icon: BookOpen, path: "/subjects", roles: ["admin", "coordination", "secretary"] },
  { label: "Turmas", icon: School, path: "/classes", roles: ["admin", "coordination", "secretary"] },
  { label: "Salas", icon: DoorOpen, path: "/rooms", roles: ["admin", "coordination", "secretary"] },
  { label: "Grade de Horários", icon: Calendar, path: "/schedule", roles: ["admin", "coordination", "teacher"] },
  { label: "Relatórios", icon: FileText, path: "/reports", roles: ["admin", "coordination"] },
];

export default function Sidebar({ user, collapsed, onToggle }) {
  const location = useLocation();
  const { logout } = useAuth();
  const userRole = user?.role || "teacher";

  const filteredNav = navItems.filter(item => item.roles.includes(userRole));

  const roleLabels = {
    admin: "Administrador",
    coordination: "Coordenação",
    teacher: "Professor",
    secretary: "Secretaria"
  };

  const roleColors = {
    admin: "bg-red-500",
    coordination: "bg-yellow-500",
    teacher: "bg-blue-500",
    secretary: "bg-gray-400"
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col z-50 transition-all duration-300 ${collapsed ? "w-[72px]" : "w-64"}`}>
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm tracking-tight text-white leading-tight">Escolar Pro Max</h1>
            <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">Sistema de Gestão</p>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button 
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                ${isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/25" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-lg transition-opacity z-50">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-white">
              {(user?.full_name || "U").charAt(0).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name || "Usuário"}</p>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${roleColors[userRole]}`} />
                <p className="text-xs text-sidebar-foreground/50">{roleLabels[userRole]}</p>
              </div>
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={() => logout()}
              className="text-sidebar-foreground/40 hover:text-red-400 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}