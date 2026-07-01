import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Clock, MapPin, Heart, ChevronRight, Image as ImageIcon, Video } from "lucide-react";
import { PhotoGallery } from "@/components/PhotoGallery";
import { VideoEmbed } from "@/components/VideoEmbed";
import { getMediaForEntity } from "@/lib/mediaStore";
import type { Beehive, BeeInspection, AppState, VideoLink } from "@/types";

interface BeeManagementProps {
  state: AppState;
  addItem: (key: "beehives", item: Beehive) => void;
  addInspection: (item: BeeInspection) => void;
  updateItem: (key: "beehives", id: string, updates: Partial<Beehive>) => void;
  removeItem: (key: "beehives", id: string) => void;
  onAddVideo: (video: Omit<VideoLink, "id" | "createdAt">) => void;
  onRemoveVideo: (id: string) => void;
}

const queenStatusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  healthy: { label: "蜂王健康", variant: "default" },
  weak: { label: "蜂王虚弱", variant: "secondary" },
  replaced: { label: "已更替", variant: "outline" },
};

const strengthMap: Record<string, { label: string; color: string }> = {
  strong: { label: "强群", color: "bg-green-500" },
  medium: { label: "中等", color: "bg-amber-500" },
  weak: { label: "弱群", color: "bg-red-500" },
};

export function BeeManagement({ state, addItem, addInspection, updateItem, removeItem, onAddVideo, onRemoveVideo }: BeeManagementProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedHive, setSelectedHive] = useState<string | null>(null);
  const [showInspection, setShowInspection] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", queenAge: "6", notes: "" });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    const now = new Date().toISOString();
    addItem("beehives", {
      id: `h${Date.now()}`,
      name: form.name,
      location: form.location,
      queenAge: parseInt(form.queenAge) || 0,
      queenStatus: "healthy",
      colonyStrength: "medium",
      lastInspection: now.split("T")[0],
      notes: form.notes,
      createdAt: now,
    });
    setForm({ name: "", location: "", queenAge: "6", notes: "" });
    setShowAdd(false);
  };

  const hive = selectedHive ? state.beehives.find((h) => h.id === selectedHive) : null;
  const hiveInspections = selectedHive ? state.inspections.filter((i) => i.hiveId === selectedHive).sort((a, b) => b.date.localeCompare(a.date)) : [];

  const [inspForm, setInspForm] = useState({ honeyFrames: "4", broodPattern: "good" as BeeInspection["broodPattern"], mood: "calm" as BeeInspection["mood"], pests: "", actionTaken: "", notes: "" });

  // Photo system
  const [hivePhotos, setHivePhotos] = useState<{ id: string; url: string }[]>([]);
  const loadPhotos = useCallback(async () => {
    if (!selectedHive) { setHivePhotos([]); return; }
    const photos = await getMediaForEntity(selectedHive, "beehive");
    setHivePhotos(photos);
  }, [selectedHive]);
  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  const handleAddInspection = () => {
    if (!selectedHive) return;
    const today = new Date().toISOString().split("T")[0];
    addInspection({
      id: `i${Date.now()}`,
      hiveId: selectedHive,
      date: today,
      honeyFrames: parseInt(inspForm.honeyFrames) || 0,
      broodPattern: inspForm.broodPattern,
      pests: inspForm.pests ? inspForm.pests.split(",").map((s) => s.trim()) : [],
      mood: inspForm.mood,
      actionTaken: inspForm.actionTaken,
      notes: inspForm.notes,
    });
    updateItem("beehives", selectedHive, { lastInspection: today });
    setInspForm({ honeyFrames: "4", broodPattern: "good", mood: "calm", pests: "", actionTaken: "", notes: "" });
    setShowInspection(false);
  };

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">蜂群管理</h1>
        <Button size="sm" onClick={() => { setSelectedHive(null); setShowAdd(true); }} className="gap-1.5">
          <Plus className="w-4 h-4" />添加蜂箱
        </Button>
      </div>

      {state.beehives.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-lg font-medium text-foreground">暂无蜂箱</h3>
          <p className="text-sm text-muted-foreground mt-1">点击「添加蜂箱」开始记录你的蜂群</p>
        </div>
      ) : (
        <div className="space-y-3">
          {state.beehives.map((h) => (
            <Card
              key={h.id}
              className={`cursor-pointer hover:shadow-md transition-all duration-200 ${selectedHive === h.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelectedHive(selectedHive === h.id ? null : h.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-3 h-3 rounded-full ${strengthMap[h.colonyStrength].color} shrink-0`} />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{h.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3" />{h.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={queenStatusMap[h.queenStatus].variant} className="text-xs">
                      {queenStatusMap[h.queenStatus].label}
                    </Badge>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${selectedHive === h.id ? "rotate-90" : ""}`} />
                  </div>
                </div>

                {selectedHive === h.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-red-400" />
                        <span>蜂王月龄: <strong>{h.queenAge}</strong> 个月</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>上次检查: <strong>{h.lastInspection}</strong></span>
                      </div>
                    </div>
                    {h.notes && <p className="text-xs text-muted-foreground bg-muted rounded-lg p-2">{h.notes}</p>}

                    {hiveInspections.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground">检查记录</p>
                        {hiveInspections.map((insp) => (
                          <div key={insp.id} className="text-xs bg-secondary/50 rounded-lg p-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{insp.date}</span>
                              <Badge variant="outline" className="text-[10px] h-5">
                                {insp.broodPattern === "excellent" ? "子脾优秀" : insp.broodPattern === "good" ? "子脾良好" : "子脾不佳"}
                              </Badge>
                            </div>
                            <div className="flex gap-3 mt-1 text-muted-foreground">
                              <span>蜜脾: {insp.honeyFrames} 框</span>
                              <span>蜂性: {insp.mood === "calm" ? "温顺" : insp.mood === "defensive" ? "警觉" : "暴躁"}</span>
                            </div>
                            {insp.actionTaken && <p className="mt-1">处理: {insp.actionTaken}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Photos */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" />蜂箱照片
                      </p>
                      <PhotoGallery
                        photos={hivePhotos}
                        entityId={h.id}
                        entityType="beehive"
                        onPhotosChange={loadPhotos}
                      />
                    </div>

                    {/* Videos */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" />蜂箱视频
                      </p>
                      <VideoEmbed
                        videos={state.videoLinks.filter((v) => v.entityId === h.id && v.entityType === "beehive")}
                        entityId={h.id}
                        entityType="beehive"
                        onAdd={onAddVideo}
                        onRemove={onRemoveVideo}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setShowInspection(true); }} className="gap-1.5 text-xs">
                        <Plus className="w-3 h-3" />新增检查
                      </Button>
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); removeItem("beehives", h.id); setSelectedHive(null); }} className="text-xs text-destructive hover:text-destructive">
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

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>添加新蜂箱</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>蜂箱名称</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="如：东院蜂箱 A" />
            </div>
            <div>
              <Label>位置</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="如：东院槐树下" />
            </div>
            <div>
              <Label>蜂王月龄</Label>
              <Input type="number" value={form.queenAge} onChange={(e) => setForm({ ...form, queenAge: e.target.value })} />
            </div>
            <div>
              <Label>备注</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="其他备注信息..." />
            </div>
            <Button onClick={handleAdd} className="w-full">确认添加</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInspection} onOpenChange={setShowInspection}>
        <DialogContent>
          <DialogHeader><DialogTitle>{hive?.name} — 新增检查</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>蜜脾框数</Label>
              <Input type="number" value={inspForm.honeyFrames} onChange={(e) => setInspForm({ ...inspForm, honeyFrames: e.target.value })} />
            </div>
            <div>
              <Label>子脾情况</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={inspForm.broodPattern}
                onChange={(e) => setInspForm({ ...inspForm, broodPattern: e.target.value as BeeInspection["broodPattern"] })}
              >
                <option value="excellent">优秀</option>
                <option value="good">良好</option>
                <option value="poor">不佳</option>
              </select>
            </div>
            <div>
              <Label>蜂性</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={inspForm.mood}
                onChange={(e) => setInspForm({ ...inspForm, mood: e.target.value as BeeInspection["mood"] })}
              >
                <option value="calm">温顺</option>
                <option value="defensive">警觉</option>
                <option value="aggressive">暴躁</option>
              </select>
            </div>
            <div>
              <Label>病虫害（逗号分隔）</Label>
              <Input value={inspForm.pests} onChange={(e) => setInspForm({ ...inspForm, pests: e.target.value })} placeholder="蜂螨, 巢虫..." />
            </div>
            <div>
              <Label>采取措施</Label>
              <Input value={inspForm.actionTaken} onChange={(e) => setInspForm({ ...inspForm, actionTaken: e.target.value })} placeholder="如：放置螨虫贴" />
            </div>
            <div>
              <Label>备注</Label>
              <Textarea value={inspForm.notes} onChange={(e) => setInspForm({ ...inspForm, notes: e.target.value })} />
            </div>
            <Button onClick={handleAddInspection} className="w-full">记录检查</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
