
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import Sidebar from "@/components/Layout/Sidebar";

export default function AppLayout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`transition-all duration-300 ${collapsed ? "ml-[72px]" : "ml-64"}`}>
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}