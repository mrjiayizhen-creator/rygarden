import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/sections/Dashboard";
import { BeeManagement } from "@/sections/BeeManagement";
import { PoultryManagement } from "@/sections/PoultryManagement";
import { GardenManagement } from "@/sections/GardenManagement";
import { useLocalStore } from "@/hooks/useLocalStore";
import type { Page } from "@/types";
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
  const { state, addItem, updateItem, removeItem, seedDemoData, hasData } = useLocalStore();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar current={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 min-w-0">
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
    </div>
  );
}

export default App;
