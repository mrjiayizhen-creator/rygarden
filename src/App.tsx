import { useState, useCallback } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
import { AuthModal } from "@/components/AuthModal";
import { Dashboard } from "@/sections/Dashboard";
import { BeeManagement } from "@/sections/BeeManagement";
import { PoultryManagement } from "@/sections/PoultryManagement";
import { GardenManagement } from "@/sections/GardenManagement";
import { useLocalStore } from "@/hooks/useLocalStore";
import { useAuth } from "@/hooks/useAuth";
import type { Page } from "@/types";
import { User, LogIn, LogOut, ChevronDown, Flower2 } from "lucide-react";
import "./App.css";

function SettingsPage() {
  return (
    <div className="page-container space-y-6">
      <h1 className="text-xl font-bold text-foreground">设置</h1>
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-semibold text-sm mb-2">数据管理</h2>
        <p className="text-sm text-muted-foreground mb-4">
          所有数据存储在你的浏览器本地存储（localStorage）中。你可以导出数据进行备份，或导入之前备份的数据。
        </p>
        <p className="text-xs text-muted-foreground">
          数据不会上传到服务器，请定期备份。
        </p>
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-semibold text-sm mb-2">关于</h2>
        <p className="text-sm text-muted-foreground">
          田园管家 — 记录蜂群管理、家禽饲养、菜园四季变化的个人田园助手。
        </p>
        <p className="text-xs text-muted-foreground mt-2">版本 1.0.0</p>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [authOpen, setAuthOpen] = useState(false);
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false);

  const { user, isLoading, error, login, register, logout, clearError } = useAuth();
  const userId = user?.id ?? null;
  const { state, addItem, updateItem, removeItem, seedDemoData, hasData } = useLocalStore(userId);

  const handleLogout = useCallback(() => {
    logout();
    setShowMobileUserMenu(false);
  }, [logout]);

  // Don't render until auth is loaded (to prevent flash of data switching)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Flower2 className="w-8 h-8 text-accent animate-pulse" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        current={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar (mobile: user status + title) */}
        <header className="sm:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-accent" />
            <span className="font-semibold text-sm text-foreground">田园管家</span>
          </div>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowMobileUserMenu(!showMobileUserMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-emerald-700">{user.username}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-emerald-500 transition-transform ${showMobileUserMenu ? "rotate-180" : ""}`} />
              </button>
              {showMobileUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-card border border-border rounded-lg shadow-lg py-1 z-50 animate-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user.username}</p>
                    <p className="text-xs text-muted-foreground">会员</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-xs font-medium"
            >
              <LogIn className="w-3.5 h-3.5" />
              登录
            </button>
          )}
        </header>

        {/* Page content */}
        {currentPage === "dashboard" && (
          <Dashboard state={state} hasData={hasData} seedDemoData={seedDemoData} onNavigate={setCurrentPage} />
        )}
        {currentPage === "bee" && (
          <BeeManagement
            state={state}
            addItem={(key, item) => addItem(key, item)}
            addInspection={(item) => addItem("inspections", item)}
            updateItem={(key, id, updates) => updateItem(key, id, updates)}
            removeItem={(key, id) => removeItem(key, id)}
          />
        )}
        {currentPage === "poultry" && (
          <PoultryManagement
            state={state}
            addItem={(key, item) => addItem(key, item)}
            addItemGeneric={(key, item) => addItem(key, item)}
            addItemGeneric2={(key, item) => addItem(key, item)}
            removeItem={(key, id) => removeItem(key, id)}
          />
        )}
        {currentPage === "garden" && (
          <GardenManagement
            state={state}
            addPlot={(item) => addItem("cropPlots", item)}
            addLog={(item) => addItem("gardenLogs", item)}
            removePlot={(id) => removeItem("cropPlots", id)}
          />
        )}
        {currentPage === "settings" && <SettingsPage />}
      </main>

      <BottomNav current={currentPage} onNavigate={setCurrentPage} />

      {/* Auth Modal */}
      <AuthModal
        open={authOpen}
        onClose={() => { setAuthOpen(false); clearError(); }}
        onLogin={login}
        onRegister={register}
        error={error}
        onClearError={clearError}
      />
    </div>
  );
}

export default App;
