import type { Page } from "@/types";
import { LayoutDashboard, Bug, Bird, Sprout, BookOpen } from "lucide-react";

interface BottomNavProps {
  current: Page;
  onNavigate: (page: Page) => void;
}

const tabs: { key: Page; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "首页", icon: <LayoutDashboard className="w-5 h-5" /> },
  { key: "bee", label: "蜂群", icon: <Bug className="w-5 h-5" /> },
  { key: "poultry", label: "家禽", icon: <Bird className="w-5 h-5" /> },
  { key: "garden", label: "菜园", icon: <Sprout className="w-5 h-5" /> },
  { key: "journal", label: "心得", icon: <BookOpen className="w-5 h-5" /> },
];

export function BottomNav({ current, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom sm:hidden">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onNavigate(tab.key)}
            className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors duration-150 ${
              current === tab.key
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
