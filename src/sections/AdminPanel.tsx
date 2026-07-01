import { useState, useCallback } from "react";
import type { AppState, SiteConfig } from "@/types";
import type { User } from "@/hooks/useAuth";
import {
  LayoutDashboard, Users, Settings, Database, Download, Upload,
  Megaphone, Shield, Trash2, Crown, User as UserIcon, TrendingUp,
  Bug, Bird, Sprout, BookOpen, Video, AlertTriangle, CheckCircle2,
  RefreshCw, Copy, FileJson
} from "lucide-react";

const SITE_CONFIG_KEY = "tianyuan-site-config";

const defaultSiteConfig: SiteConfig = {
  siteName: "田园管家",
  siteDescription: "记录蜂群管理、家禽饲养、菜园四季变化的个人田园助手。",
  announcement: "",
  showAnnouncement: false,
  updatedAt: new Date().toISOString(),
};

function loadSiteConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(SITE_CONFIG_KEY);
    if (raw) return JSON.parse(raw) as SiteConfig;
  } catch { /* ignore */ }
  return { ...defaultSiteConfig };
}

function saveSiteConfig(config: SiteConfig) {
  localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(config));
}

type AdminTab = "overview" | "users" | "config" | "data";

interface AdminPanelProps {
  state: AppState;
  user: User;
  getAllUsers: () => (User & { role: string })[];
  updateUserRole: (userId: string, newRole: "admin" | "user") => boolean;
  deleteUser: (userId: string) => boolean;
}

export function AdminPanel({ state, user, getAllUsers, updateUserRole, deleteUser }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(loadSiteConfig);
  const [savedMsg, setSavedMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [userListRefresh, setUserListRefresh] = useState(0);

  const users = getAllUsers();
  const refreshUsers = () => setUserListRefresh((n) => n + 1);

  // Stats
  const stats = [
    { label: "蜂箱", value: state.beehives.length, icon: Bug, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "家禽", value: state.poultries.length, icon: Bird, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "菜地", value: state.cropPlots.length, icon: Sprout, color: "text-green-600", bg: "bg-green-50" },
    { label: "笔记", value: state.journalEntries.length, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "视频", value: state.videoLinks.length, icon: Video, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "检查记录", value: state.inspections.length, icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50" },
  ];

  // Save config
  const handleSaveConfig = useCallback(() => {
    const updated = { ...siteConfig, updatedAt: new Date().toISOString() };
    saveSiteConfig(updated);
    setSiteConfig(updated);
    setSavedMsg("配置已保存！");
    setTimeout(() => setSavedMsg(""), 2500);
  }, [siteConfig]);

  // Export data
  const handleExportData = useCallback(() => {
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      exportedBy: user.username,
      data: state,
      siteConfig: loadSiteConfig(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tianyuan-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state, user]);

  // Import data
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const handleImportData = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const imported = JSON.parse(re.target?.result as string);
          if (!imported.data || !imported.version) {
            setImportStatus("error");
            return;
          }
          // Save to current user's storage
          const key = `tianyuan-app-state-${user.id}`;
          localStorage.setItem(key, JSON.stringify(imported.data));
          if (imported.siteConfig) {
            saveSiteConfig(imported.siteConfig);
            setSiteConfig(imported.siteConfig);
          }
          setImportStatus("success");
          setTimeout(() => {
            setImportStatus("idle");
            window.location.reload();
          }, 1500);
        } catch {
          setImportStatus("error");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [user]);

  const handleDeleteUser = useCallback((userId: string, username: string) => {
    if (userId === user.id) return;
    const ok = deleteUser(userId);
    if (ok) {
      refreshUsers();
      // Clean up their data
      localStorage.removeItem(`tianyuan-app-state-${userId}`);
    }
    setDeleteConfirm(null);
  }, [user, deleteUser]);

  const handleToggleRole = useCallback((userId: string, currentRole: string) => {
    if (userId === user.id) return; // Can't change own role
    const newRole: "admin" | "user" = currentRole === "admin" ? "user" : "admin";
    updateUserRole(userId, newRole);
    refreshUsers();
  }, [user, updateUserRole]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">后台管理</h1>
            <p className="text-xs text-muted-foreground">网站配置 · 用户管理 · 数据维护</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border px-4 sm:px-6 gap-1 overflow-x-auto">
        {([
          { key: "overview" as const, label: "数据概览", icon: LayoutDashboard },
          { key: "users" as const, label: "用户管理", icon: Users },
          { key: "config" as const, label: "网站配置", icon: Settings },
          { key: "data" as const, label: "数据备份", icon: Database },
        ] satisfies { key: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                数据统计
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className={`${s.bg} rounded-lg p-4 flex flex-col items-center text-center`}>
                    <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
                    <span className="text-2xl font-bold text-foreground">{s.value}</span>
                    <span className="text-xs text-muted-foreground mt-1">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                系统信息
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">注册用户数</span>
                  <span className="font-medium">{users.length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">管理员数</span>
                  <span className="font-medium">{users.filter((u: User & { role: string }) => u.role === "admin").length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">数据存储</span>
                  <span className="font-medium">localStorage</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">图片存储</span>
                  <span className="font-medium">IndexedDB</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">当前用户</span>
                  <span className="font-medium">{user.username}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">用户角色</span>
                  <span className={`font-medium ${user.role === "admin" ? "text-red-600" : "text-green-600"}`}>
                    {user.role === "admin" ? "管理员" : "普通用户"}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                由于本站使用纯前端存储，管理员只能管理<strong>当前浏览器</strong>中的数据。不同浏览器/设备的数据相互独立。
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                注册用户列表
                <span className="text-xs text-muted-foreground font-normal">({users.length} 人)</span>
              </h2>
              <button
                onClick={refreshUsers}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border hover:bg-secondary transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                刷新
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">用户名</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">角色</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs hidden sm:table-cell">注册时间</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                              (u as User & { role: string }).role === "admin"
                                ? "bg-red-100 text-red-600"
                                : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{u.username}</span>
                            {u.id === user.id && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">我</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            (u as User & { role: string }).role === "admin"
                              ? "bg-red-50 text-red-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {(u as User & { role: string }).role === "admin" ? (
                              <><Crown className="w-3 h-3" /> 管理员</>
                            ) : (
                              <><UserIcon className="w-3 h-3" /> 用户</>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                          {new Date(u.createdAt).toLocaleDateString("zh-CN")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {u.id !== user.id && (
                              <>
                                <button
                                  onClick={() => handleToggleRole(u.id, (u as User & { role: string }).role)}
                                  className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 transition-colors"
                                >
                                  {(u as User & { role: string }).role === "admin" ? "降级" : "升级"}
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(u.id)}
                                  className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  删除
                                </button>
                              </>
                            )}
                            {u.id === user.id && (
                              <span className="text-xs text-muted-foreground">当前用户</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                          暂无注册用户
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delete confirm dialog */}
            {deleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-card border border-border rounded-xl p-6 max-w-sm mx-4 shadow-2xl animate-in zoom-in-95 duration-150">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">确认删除用户？</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        该用户的所有数据将被永久删除，此操作不可撤销。
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-secondary transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        const targetUser = users.find((u: User & { role: string }) => u.id === deleteConfirm);
                        if (targetUser) handleDeleteUser(deleteConfirm, targetUser.username);
                      }}
                      className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      确认删除
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Config Tab */}
        {activeTab === "config" && (
          <div className="space-y-4 max-w-xl">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              网站全局配置
            </h2>

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">网站名称</label>
                <input
                  type="text"
                  value={siteConfig.siteName}
                  onChange={(e) => setSiteConfig({ ...siteConfig, siteName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">网站描述</label>
                <textarea
                  value={siteConfig.siteDescription}
                  onChange={(e) => setSiteConfig({ ...siteConfig, siteDescription: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="border-t border-border pt-4">
                <label className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">网站公告</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-muted-foreground">显示公告</span>
                    <input
                      type="checkbox"
                      checked={siteConfig.showAnnouncement}
                      onChange={(e) => setSiteConfig({ ...siteConfig, showAnnouncement: e.target.checked })}
                      className="rounded border-border"
                    />
                  </label>
                </label>
                <textarea
                  value={siteConfig.announcement}
                  onChange={(e) => setSiteConfig({ ...siteConfig, announcement: e.target.value })}
                  placeholder="输入公告内容，将在网站首页顶部显示..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              {siteConfig.showAnnouncement && siteConfig.announcement && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Megaphone className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-blue-800 mb-0.5">公告预览</p>
                      <p className="text-sm text-blue-700">{siteConfig.announcement}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  保存配置
                </button>
                {savedMsg && (
                  <span className="text-xs text-green-600 animate-in fade-in duration-200">{savedMsg}</span>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">
                注意：网站配置保存在当前浏览器的 localStorage 中。如果你在其他设备或浏览器访问，需要重新配置。
              </p>
            </div>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === "data" && (
          <div className="space-y-4 max-w-xl">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              数据备份与恢复
            </h2>

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              {/* Export */}
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Download className="w-4 h-4 text-green-600" />
                  导出数据
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  将所有数据（蜂群、家禽、菜园、笔记、视频链接、网站配置）导出为 JSON 文件，可用于备份或迁移。
                </p>
                <button
                  onClick={handleExportData}
                  className="px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  导出备份文件
                </button>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  导入数据
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  从之前导出的 JSON 备份文件恢复数据。导入将覆盖当前数据，请谨慎操作。
                </p>
                <button
                  onClick={handleImportData}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  选择备份文件
                </button>
                {importStatus === "success" && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 导入成功，即将刷新页面...
                  </p>
                )}
                {importStatus === "error" && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> 文件格式不正确，请选择有效的备份文件。
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Copy className="w-4 h-4 text-purple-600" />
                  原始数据查看
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  查看当前存储的原始 JSON 数据，方便调试和排查问题。
                </p>
                <details className="group">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex items-center gap-1">
                    <FileJson className="w-3.5 h-3.5" />
                    展开查看数据
                  </summary>
                  <pre className="mt-2 p-3 bg-secondary/50 rounded-lg text-xs font-mono overflow-auto max-h-64 whitespace-pre-wrap">
                    {JSON.stringify(state, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
