import type { Page } from "@/types";
import { LayoutDashboard, Bug, Bird, Sprout, Settings, Flower2 } from "lucide-react";

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
}

const tabs: { key: Page; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "首页概览", icon: <LayoutDashboard className="w-5 h-5" /> },
  { key: "bee", label: "蜂群管理", icon: <Bug className="w-5 h-5" /> },
  { key: "poultry", label: "家禽饲养", icon: <Bird className="w-5 h-5" /> },
  { key: "garden", label: "菜园四季", icon: <Sprout className="w-5 h-5" /> },
  { key: "settings", label: "设置", icon: <Settings className="w-5 h-5" /> },
];

export function Sidebar({ current, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden sm:flex flex-col w-56 h-screen sticky top-0 border-r border-border bg-card shrink-0">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
        <Flower2 className="w-6 h-6 text-accent" />
        <span className="font-semibold text-base text-foreground">田园管家</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onNavigate(tab.key)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
              current === tab.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">田园管家 v1.0</p>
        <p className="text-xs text-muted-foreground">记录田园生活的每一天</p>
      </div>
    </aside>
  );
}
