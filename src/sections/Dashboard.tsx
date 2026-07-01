import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bug, Bird, Sprout, Calendar, AlertTriangle, TrendingUp, Plus, Sun, CloudRain, Leaf, Megaphone, X } from "lucide-react";
import type { AppState, Page, SiteConfig } from "@/types";
import { useState, useEffect } from "react";

interface DashboardProps {
  state: AppState;
  hasData: boolean;
  seedDemoData: () => void;
  onNavigate: (page: Page) => void;
}

function getSeason(): { name: string; icon: React.ReactNode; emoji: string } {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return { name: "春", icon: <Leaf className="w-4 h-4" />, emoji: "🌸" };
  if (m >= 6 && m <= 8) return { name: "夏", icon: <Sun className="w-4 h-4" />, emoji: "☀️" };
  if (m >= 9 && m <= 11) return { name: "秋", icon: <CloudRain className="w-4 h-4" />, emoji: "🍂" };
  return { name: "冬", icon: <CloudRain className="w-4 h-4" />, emoji: "❄️" };
}

export function Dashboard({ state, hasData, seedDemoData, onNavigate }: DashboardProps) {
  const season = getSeason();
  const today = new Date().toISOString().split("T")[0];
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  // Load site config announcement
  const [announcement, setAnnouncement] = useState<{ text: string; show: boolean }>({ text: "", show: false });
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tianyuan-site-config");
      if (raw) {
        const config: SiteConfig = JSON.parse(raw);
        if (config.showAnnouncement && config.announcement) {
          setAnnouncement({ text: config.announcement, show: true });
        }
      }
    } catch { /* ignore */ }
  }, []);

  const todayInspections = state.inspections.filter((i) => i.date === today);
  const todayFeedings = state.feedingRecords.filter((f) => f.date === today);
  const todayGardenLogs = state.gardenLogs.filter((g) => g.date === today);
  const activePoultries = state.poultries.filter((p) => p.status === "active");
  const activePlots = state.cropPlots.filter((p) => p.status !== "harvested" && p.status !== "dormant");

  if (!hasData) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <div className="text-6xl">{season.emoji}</div>
        <h1 className="text-2xl font-semibold text-foreground">欢迎来到田园管家</h1>
        <p className="text-muted-foreground max-w-md">
          记录你的蜂群、家禽和菜园日常，追踪四季变化。
          <br />
          先用演示数据体验一下？
        </p>
        <Button size="lg" onClick={seedDemoData} className="gap-2">
          <Plus className="w-5 h-5" />
          载入演示数据
        </Button>
      </div>
    );
  }

  const stats = [
    { label: "蜂箱", value: state.beehives.length, icon: Bug, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950", onClick: () => onNavigate("bee") },
    { label: "家禽", value: state.poultries.length, icon: Bird, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950", onClick: () => onNavigate("poultry") },
    { label: "菜地", value: state.cropPlots.length, icon: Sprout, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950", onClick: () => onNavigate("garden") },
  ];

  return (
    <div className="page-container space-y-6">
      {/* Announcement Banner */}
      {announcement.show && !announcementDismissed && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
          <Megaphone className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-blue-800 font-medium">公告</p>
            <p className="text-sm text-blue-700 mt-0.5">{announcement.text}</p>
          </div>
          <button
            onClick={() => setAnnouncementDismissed(true)}
            className="text-blue-400 hover:text-blue-600 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-6 border border-primary/20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {season.emoji} {season.name}日安，田园管家
        </h1>
        <p className="text-muted-foreground mt-1">
          今日记录：{todayInspections.length} 次检查 · {todayFeedings.length} 次喂养 · {todayGardenLogs.length} 次农事
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={s.onClick}>
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bug className="w-4 h-4 text-amber-500" />
              蜂群状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.beehives.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无蜂箱，点击蜂群模块添加</p>
            ) : (
              <div className="space-y-2">
                {state.beehives.slice(0, 3).map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[140px]">{h.name}</span>
                    <Badge variant={h.queenStatus === "healthy" ? "default" : "secondary"}>
                      {h.queenStatus === "healthy" ? "健康" : h.queenStatus === "weak" ? "需关注" : "已更替"}
                    </Badge>
                  </div>
                ))}
                {state.beehives.length > 3 && (
                  <p className="text-xs text-muted-foreground">还有 {state.beehives.length - 3} 个蜂箱...</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bird className="w-4 h-4 text-blue-500" />
              家禽总览
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.poultries.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无家禽记录</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>活跃禽只</span>
                  <span className="font-semibold">{activePoultries.length} 只</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>今日产蛋</span>
                  <span className="font-semibold">
                    {state.eggRecords.filter((e) => e.date === today).reduce((s, e) => s + e.count, 0)} 枚
                  </span>
                </div>
                {state.poultries.some((p) => p.status === "sick") && (
                  <div className="flex items-center gap-1.5 text-sm text-red-500">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>有病禽需要关注</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sprout className="w-4 h-4 text-green-500" />
              菜园动态
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activePlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无活跃菜地</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activePlots.map((plot) => (
                  <Badge key={plot.id} variant="outline" className="gap-1.5 py-1.5 px-3 text-xs">
                    <span className={`w-2 h-2 rounded-full ${
                      plot.status === "seeding" ? "bg-amber-400" :
                      plot.status === "growing" ? "bg-green-400" :
                      plot.status === "flowering" ? "bg-pink-400" :
                      "bg-red-400"
                    }`} />
                    {plot.crop}
                    <span className="text-muted-foreground ml-1">
                      {plot.status === "seeding" ? "播种期" :
                       plot.status === "growing" ? "生长期" :
                       plot.status === "flowering" ? "开花期" :
                       "结果期"}
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            本月概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{state.beehives.length}</p>
              <p className="text-xs text-muted-foreground">蜂箱总数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{state.poultries.length}</p>
              <p className="text-xs text-muted-foreground">禽只总数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activePlots.length}</p>
              <p className="text-xs text-muted-foreground">活跃菜地</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {state.eggRecords.reduce((s, e) => s + e.count, 0)}
              </p>
              <p className="text-xs text-muted-foreground">累计产蛋</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
