import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PhotoGallery } from "@/components/PhotoGallery";
import { VideoEmbed } from "@/components/VideoEmbed";
import { getMediaForEntity } from "@/lib/mediaStore";
import { Plus, Sprout, Droplets, Scissors, Shovel, Bug, Image as ImageIcon, Video } from "lucide-react";
import type { CropPlot, GardenLog, AppState, VideoLink } from "@/types";

interface GardenProps {
  state: AppState;
  addPlot: (item: CropPlot) => void;
  addLog: (item: GardenLog) => void;
  removePlot: (id: string) => void;
  onAddVideo: (video: Omit<VideoLink, "id" | "createdAt">) => void;
  onRemoveVideo: (id: string) => void;
}

const seasons = [
  { key: "all", label: "全部" },
  { key: "spring", label: "春" },
  { key: "summer", label: "夏" },
  { key: "autumn", label: "秋" },
  { key: "winter", label: "冬" },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  seeding: { label: "播种期", color: "bg-amber-400" },
  growing: { label: "生长期", color: "bg-green-400" },
  flowering: { label: "开花期", color: "bg-pink-400" },
  fruiting: { label: "结果期", color: "bg-red-400" },
  harvested: { label: "已收获", color: "bg-blue-400" },
  dormant: { label: "休耕", color: "bg-gray-400" },
};

const actionIcons: Record<GardenLog["action"], React.ReactNode> = {
  watered: <Droplets className="w-3.5 h-3.5 text-blue-500" />,
  fertilized: <Shovel className="w-3.5 h-3.5 text-amber-700" />,
  weeded: <Bug className="w-3.5 h-3.5 text-green-600" />,
  pruned: <Scissors className="w-3.5 h-3.5 text-purple-500" />,
  pest_control: <Bug className="w-3.5 h-3.5 text-red-500" />,
  harvested: <Sprout className="w-3.5 h-3.5 text-green-500" />,
  planted: <Sprout className="w-3.5 h-3.5 text-emerald-500" />,
};

const actionLabels: Record<GardenLog["action"], string> = {
  watered: "浇水",
  fertilized: "施肥",
  weeded: "除草",
  pruned: "修剪",
  pest_control: "除虫",
  harvested: "收获",
  planted: "播种",
};

export function GardenManagement({ state, addPlot, addLog, removePlot, onAddVideo, onRemoveVideo }: GardenProps) {
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [showAddPlot, setShowAddPlot] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);

  const [plotForm, setPlotForm] = useState({ name: "", crop: "", season: "summer" as CropPlot["season"], plantedDate: "", expectedHarvest: "", area: "10", notes: "" });
  const [logForm, setLogForm] = useState({ action: "watered" as GardenLog["action"], detail: "", harvestAmount: "" });

  // Photo system
  const [plotPhotos, setPlotPhotos] = useState<{ id: string; url: string }[]>([]);
  const loadPhotos = useCallback(async () => {
    if (!selectedPlotId) { setPlotPhotos([]); return; }
    const photos = await getMediaForEntity(selectedPlotId, "cropPlot");
    setPlotPhotos(photos);
  }, [selectedPlotId]);
  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  const filteredPlots = seasonFilter === "all" ? state.cropPlots : state.cropPlots.filter((p) => p.season === seasonFilter);
  const selectedPlot = state.cropPlots.find((p) => p.id === selectedPlotId);
  const plotLogs = selectedPlotId ? state.gardenLogs.filter((l) => l.plotId === selectedPlotId).sort((a, b) => b.date.localeCompare(a.date)) : [];

  const handleAddPlot = () => {
    if (!plotForm.name.trim() || !plotForm.crop.trim()) return;
    addPlot({
      id: `c${Date.now()}`,
      name: plotForm.name,
      crop: plotForm.crop,
      season: plotForm.season,
      plantedDate: plotForm.plantedDate,
      expectedHarvest: plotForm.expectedHarvest,
      status: "seeding",
      area: parseInt(plotForm.area) || 0,
      notes: plotForm.notes,
      createdAt: new Date().toISOString(),
    });
    setPlotForm({ name: "", crop: "", season: "summer", plantedDate: "", expectedHarvest: "", area: "10", notes: "" });
    setShowAddPlot(false);
  };

  const handleAddLog = () => {
    if (!selectedPlotId) return;
    const today = new Date().toISOString().split("T")[0];
    addLog({
      id: `g${Date.now()}`,
      plotId: selectedPlotId,
      date: today,
      action: logForm.action,
      detail: logForm.detail,
      harvestAmount: logForm.harvestAmount ? parseFloat(logForm.harvestAmount) : undefined,
    });
    setLogForm({ action: "watered", detail: "", harvestAmount: "" });
    setShowAddLog(false);
  };

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">菜园四季</h1>
        <Button size="sm" onClick={() => setShowAddPlot(true)} className="gap-1.5">
          <Plus className="w-4 h-4" />添加菜地
        </Button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {seasons.map((s) => (
          <Button
            key={s.key}
            size="sm"
            variant={seasonFilter === s.key ? "default" : "outline"}
            onClick={() => setSeasonFilter(s.key)}
            className="shrink-0 text-xs h-8"
          >
            {s.label}
          </Button>
        ))}
      </div>

      {filteredPlots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-lg font-medium text-foreground">暂无菜地</h3>
          <p className="text-sm text-muted-foreground mt-1">点击「添加菜地」规划你的种植</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPlots.map((plot) => (
            <Card
              key={plot.id}
              className={`cursor-pointer hover:shadow-md transition-all duration-200 ${selectedPlotId === plot.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelectedPlotId(selectedPlotId === plot.id ? null : plot.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusLabels[plot.status].color} mt-1.5 shrink-0`} />
                    <div>
                      <h3 className="font-semibold text-sm">{plot.name}</h3>
                      <p className="text-sm text-muted-foreground">{plot.crop} · {plot.area}m²</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{statusLabels[plot.status].label}</Badge>
                </div>

                {plot.plantedDate && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>种植: {plot.plantedDate}</span>
                    {plot.expectedHarvest && <span>预计收获: {plot.expectedHarvest}</span>}
                  </div>
                )}

                {selectedPlotId === plot.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    {plot.notes && <p className="text-xs text-muted-foreground bg-muted rounded-lg p-2">{plot.notes}</p>}

                    {plotLogs.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground">农事日志</p>
                        {plotLogs.slice(0, 5).map((log) => (
                          <div key={log.id} className="flex items-start gap-2 text-xs bg-secondary/50 rounded-lg p-2">
                            <div className="mt-0.5">{actionIcons[log.action]}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{actionLabels[log.action]}</span>
                                <span className="text-muted-foreground">{log.date}</span>
                              </div>
                              {log.detail && <p className="text-muted-foreground mt-0.5">{log.detail}</p>}
                              {log.harvestAmount !== undefined && (
                                <Badge variant="default" className="text-[10px] mt-1 h-4">收获 {log.harvestAmount}kg</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Photos */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" />菜地照片
                      </p>
                      <PhotoGallery
                        photos={plotPhotos}
                        entityId={plot.id}
                        entityType="cropPlot"
                        onPhotosChange={loadPhotos}
                      />
                    </div>

                    {/* Videos */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" />菜地视频
                      </p>
                      <VideoEmbed
                        videos={state.videoLinks.filter((v) => v.entityId === plot.id && v.entityType === "cropPlot")}
                        entityId={plot.id}
                        entityType="cropPlot"
                        onAdd={onAddVideo}
                        onRemove={onRemoveVideo}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setShowAddLog(true); }} className="gap-1.5 text-xs">
                        <Plus className="w-3 h-3" />记录农事
                      </Button>
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); removePlot(plot.id); setSelectedPlotId(null); }} className="text-xs text-destructive hover:text-destructive">
                        删除
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddPlot} onOpenChange={setShowAddPlot}>
        <DialogContent>
          <DialogHeader><DialogTitle>添加新菜地</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>菜地名称</Label>
                <Input value={plotForm.name} onChange={(e) => setPlotForm({ ...plotForm, name: e.target.value })} placeholder="如：A区番茄" />
              </div>
              <div>
                <Label>种植作物</Label>
                <Input value={plotForm.crop} onChange={(e) => setPlotForm({ ...plotForm, crop: e.target.value })} placeholder="如：番茄" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>季节</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={plotForm.season}
                  onChange={(e) => setPlotForm({ ...plotForm, season: e.target.value as CropPlot["season"] })}
                >
                  <option value="spring">春季</option>
                  <option value="summer">夏季</option>
                  <option value="autumn">秋季</option>
                  <option value="winter">冬季</option>
                </select>
              </div>
              <div>
                <Label>面积（m²）</Label>
                <Input type="number" value={plotForm.area} onChange={(e) => setPlotForm({ ...plotForm, area: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>种植日期</Label>
                <Input type="date" value={plotForm.plantedDate} onChange={(e) => setPlotForm({ ...plotForm, plantedDate: e.target.value })} />
              </div>
              <div>
                <Label>预计收获</Label>
                <Input type="date" value={plotForm.expectedHarvest} onChange={(e) => setPlotForm({ ...plotForm, expectedHarvest: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>备注</Label>
              <Textarea value={plotForm.notes} onChange={(e) => setPlotForm({ ...plotForm, notes: e.target.value })} />
            </div>
            <Button onClick={handleAddPlot} className="w-full">确认添加</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddLog} onOpenChange={setShowAddLog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedPlot?.name} — 记录农事</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>农事类型</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={logForm.action}
                onChange={(e) => setLogForm({ ...logForm, action: e.target.value as GardenLog["action"] })}
              >
                <option value="watered">浇水</option>
                <option value="fertilized">施肥</option>
                <option value="weeded">除草</option>
                <option value="pruned">修剪</option>
                <option value="pest_control">除虫</option>
                <option value="harvested">收获</option>
                <option value="planted">播种</option>
              </select>
            </div>
            <div>
              <Label>详细描述</Label>
              <Textarea value={logForm.detail} onChange={(e) => setLogForm({ ...logForm, detail: e.target.value })} placeholder="具体操作描述..." />
            </div>
            {logForm.action === "harvested" && (
              <div>
                <Label>收获量（kg）</Label>
                <Input type="number" step="0.1" value={logForm.harvestAmount} onChange={(e) => setLogForm({ ...logForm, harvestAmount: e.target.value })} />
              </div>
            )}
            <Button onClick={handleAddLog} className="w-full">记录农事</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
