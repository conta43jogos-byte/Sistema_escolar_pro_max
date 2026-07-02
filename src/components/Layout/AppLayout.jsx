import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Layout/Sidebar";

const mlDesktop = "lg:ml-64";

export default function AppLayout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main className={`transition-all duration-300 ${mlDesktop}`}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto pt-16 lg:pt-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}
