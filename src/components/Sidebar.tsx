import type { Page } from "@/types";
import type { User } from "@/hooks/useAuth";
import { LayoutDashboard, Bug, Bird, Sprout, Settings, Flower2, LogIn, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

const tabs: { key: Page; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "首页概览", icon: <LayoutDashboard className="w-5 h-5" /> },
  { key: "bee", label: "蜂群管理", icon: <Bug className="w-5 h-5" /> },
  { key: "poultry", label: "家禽饲养", icon: <Bird className="w-5 h-5" /> },
  { key: "garden", label: "菜园四季", icon: <Sprout className="w-5 h-5" /> },
  { key: "settings", label: "设置", icon: <Settings className="w-5 h-5" /> },
];

export function Sidebar({ current, onNavigate, user, onOpenAuth, onLogout }: SidebarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

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
      <div className="px-4 py-4 border-t border-border space-y-3">
        {/* User area */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-foreground truncate">{user.username}</p>
                <p className="text-xs text-muted-foreground">会员</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
            </button>
            {showUserMenu && (
              <div className="absolute bottom-full left-2 right-2 mb-1 bg-card border border-border rounded-lg shadow-lg py-1 animate-in slide-in-from-bottom-2 duration-150">
                <button
                  onClick={() => { onLogout(); setShowUserMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-sm font-medium"
          >
            <LogIn className="w-4 h-4" />
            登录 / 注册
          </button>
        )}
        <p className="text-xs text-muted-foreground text-center">
          记录田园生活的每一天
        </p>
      </div>
    </aside>
  );
}
