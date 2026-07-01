import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, TrendingUp, Calendar, Egg, Wheat, ChevronRight, Image as ImageIcon, Video } from "lucide-react";
import { PhotoGallery } from "@/components/PhotoGallery";
import { VideoEmbed } from "@/components/VideoEmbed";
import { getMediaForEntity } from "@/lib/mediaStore";
import type { Poultry, FeedingRecord, EggRecord, AppState, VideoLink } from "@/types";

interface PoultryManagementProps {
  state: AppState;
  addItem: (key: "poultries", item: Poultry) => void;
  addItemGeneric: (key: "feedingRecords", item: FeedingRecord) => void;
  addItemGeneric2: (key: "eggRecords", item: EggRecord) => void;
  removeItem: (key: "poultries", id: string) => void;
  onAddVideo: (video: Omit<VideoLink, "id" | "createdAt">) => void;
  onRemoveVideo: (id: string) => void;
}

const typeLabels: Record<string, string> = {
  chicken: "鸡",
  duck: "鸭",
  goose: "鹅",
  other: "其他",
};

const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  active: { label: "活跃", variant: "default" },
  sick: { label: "生病", variant: "destructive" },
  brooding: { label: "抱窝", variant: "secondary" },
  deceased: { label: "已死亡", variant: "outline" },
};

export function PoultryManagement({ state, addItem, addItemGeneric, addItemGeneric2, removeItem, onAddVideo, onRemoveVideo }: PoultryManagementProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", type: "chicken" as Poultry["type"], breed: "", age: "90", gender: "hen" as Poultry["gender"] });
  const [showFeeding, setShowFeeding] = useState(false);
  const [showEgg, setShowEgg] = useState(false);
  const [feedForm, setFeedForm] = useState({ feedType: "", amount: "300", notes: "" });
  const [eggForm, setEggForm] = useState({ count: "5", type: "chicken" as EggRecord["type"] });

  const [selectedPoultry, setSelectedPoultry] = useState<string | null>(null);

  // Photo system for selected poultry
  const [poultryPhotos, setPoultryPhotos] = useState<{ id: string; url: string }[]>([]);
  const loadPhotos = useCallback(async () => {
    if (!selectedPoultry) { setPoultryPhotos([]); return; }
    const photos = await getMediaForEntity(selectedPoultry, "poultry");
    setPoultryPhotos(photos);
  }, [selectedPoultry]);
  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  const handleAdd = () => {
    if (!form.name.trim() || !form.breed.trim()) return;
    addItem("poultries", {
      id: `p${Date.now()}`,
      type: form.type,
      breed: form.breed,
      name: form.name,
      age: parseInt(form.age) || 0,
      gender: form.gender,
      status: "active",
      createdAt: new Date().toISOString(),
    });
    setForm({ name: "", type: "chicken", breed: "", age: "90", gender: "hen" });
    setShowAdd(false);
  };

  const handleFeeding = () => {
    if (!feedForm.feedType.trim()) return;
    const today = new Date().toISOString().split("T")[0];
    addItemGeneric("feedingRecords", {
      id: `f${Date.now()}`,
      poultryId: null,
      date: today,
      feedType: feedForm.feedType,
      amount: parseInt(feedForm.amount) || 0,
      notes: feedForm.notes,
    });
    setFeedForm({ feedType: "", amount: "300", notes: "" });
    setShowFeeding(false);
  };

  const handleEgg = () => {
    const today = new Date().toISOString().split("T")[0];
    addItemGeneric2("eggRecords", {
      id: `e${Date.now()}`,
      date: today,
      count: parseInt(eggForm.count) || 0,
      type: eggForm.type,
    });
    setEggForm({ count: "5", type: "chicken" });
    setShowEgg(false);
  };

  const today = new Date().toISOString().split("T")[0];
  const todayEggs = state.eggRecords.filter((e) => e.date === today).reduce((s, e) => s + e.count, 0);
  const totalEggs = state.eggRecords.reduce((s, e) => s + e.count, 0);

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">家禽饲养</h1>
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
          <Plus className="w-4 h-4" />添加禽只
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <Egg className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{todayEggs}</p>
            <p className="text-xs text-muted-foreground">今日产蛋（枚）</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{totalEggs}</p>
            <p className="text-xs text-muted-foreground">累计产蛋（枚）</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowFeeding(true)} className="gap-1.5">
          <Wheat className="w-4 h-4" />记录喂养
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowEgg(true)} className="gap-1.5">
          <Egg className="w-4 h-4" />记录产蛋
        </Button>
      </div>

      <Tabs defaultValue="birds">
        <TabsList className="w-full">
          <TabsTrigger value="birds" className="flex-1">禽只档案</TabsTrigger>
          <TabsTrigger value="feeding" className="flex-1">喂养记录</TabsTrigger>
          <TabsTrigger value="eggs" className="flex-1">产蛋记录</TabsTrigger>
        </TabsList>

        <TabsContent value="birds" className="mt-4 space-y-3">
          {state.poultries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <h3 className="text-lg font-medium text-foreground">暂无家禽</h3>
              <p className="text-sm text-muted-foreground mt-1">添加第一只家禽开始记录</p>
            </div>
          ) : (
            state.poultries.map((p) => (
              <Card
                key={p.id}
                className={`cursor-pointer hover:shadow-md transition-all duration-200 ${selectedPoultry === p.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedPoultry(selectedPoultry === p.id ? null : p.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                        {p.type === "chicken" ? "🐔" : p.type === "duck" ? "🦆" : p.type === "goose" ? "🦢" : "🐦"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{p.name} <span className="text-muted-foreground font-normal">({p.breed})</span></h3>
                        <p className="text-xs text-muted-foreground">
                          {typeLabels[p.type]} · {p.gender === "hen" ? "母" : p.gender === "rooster" ? "公" : "未知"} · {p.age} 天
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusBadge[p.status].variant} className="text-xs">{statusBadge[p.status].label}</Badge>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${selectedPoultry === p.id ? "rotate-90" : ""}`} />
                    </div>
                  </div>

                  {selectedPoultry === p.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" />{p.name}的照片
                      </p>
                      <PhotoGallery
                        photos={poultryPhotos}
                        entityId={p.id}
                        entityType="poultry"
                        onPhotosChange={loadPhotos}
                      />
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" />{p.name}的视频
                      </p>
                      <VideoEmbed
                        videos={state.videoLinks.filter((v) => v.entityId === p.id && v.entityType === "poultry")}
                        entityId={p.id}
                        entityType="poultry"
                        onAdd={onAddVideo}
                        onRemove={onRemoveVideo}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive text-xs" onClick={(e) => { e.stopPropagation(); removeItem("poultries", p.id); setSelectedPoultry(null); }}>
                          删除
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="feeding" className="mt-4 space-y-3">
          {state.feedingRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <h3 className="text-lg font-medium text-foreground">暂无喂养记录</h3>
              <p className="text-sm text-muted-foreground mt-1">点击「记录喂养」开始</p>
            </div>
          ) : (
            state.feedingRecords.sort((a, b) => b.date.localeCompare(a.date)).map((f) => (
              <Card key={f.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{f.date}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{f.amount}g</Badge>
                  </div>
                  <p className="text-sm mt-1">{f.feedType}</p>
                  {f.notes && <p className="text-xs text-muted-foreground mt-0.5">{f.notes}</p>}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="eggs" className="mt-4 space-y-3">
          {state.eggRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <h3 className="text-lg font-medium text-foreground">暂无产蛋记录</h3>
              <p className="text-sm text-muted-foreground mt-1">点击「记录产蛋」开始</p>
            </div>
          ) : (
            state.eggRecords.sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
              <Card key={e.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{e.date}</span>
                    <span className="text-muted-foreground">{typeLabels[e.type]}蛋</span>
                  </div>
                  <Badge variant="default" className="text-sm px-3">
                    {e.count} 枚
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>添加新禽只</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>名称</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="如：花花" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>种类</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Poultry["type"] })}
                >
                  <option value="chicken">鸡</option>
                  <option value="duck">鸭</option>
                  <option value="goose">鹅</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div>
                <Label>性别</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as Poultry["gender"] })}
                >
                  <option value="hen">母</option>
                  <option value="rooster">公</option>
                  <option value="unknown">未知</option>
                </select>
              </div>
            </div>
            <div>
              <Label>品种</Label>
              <Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="如：芦花鸡" />
            </div>
            <div>
              <Label>日龄（天）</Label>
              <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
            <Button onClick={handleAdd} className="w-full">确认添加</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFeeding} onOpenChange={setShowFeeding}>
        <DialogContent>
          <DialogHeader><DialogTitle>记录喂养</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>饲料类型</Label>
              <Input value={feedForm.feedType} onChange={(e) => setFeedForm({ ...feedForm, feedType: e.target.value })} placeholder="如：玉米碎+麦麸" />
            </div>
            <div>
              <Label>用量（克）</Label>
              <Input type="number" value={feedForm.amount} onChange={(e) => setFeedForm({ ...feedForm, amount: e.target.value })} />
            </div>
            <div>
              <Label>备注</Label>
              <Input value={feedForm.notes} onChange={(e) => setFeedForm({ ...feedForm, notes: e.target.value })} placeholder="可选" />
            </div>
            <Button onClick={handleFeeding} className="w-full">记录喂养</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEgg} onOpenChange={setShowEgg}>
        <DialogContent>
          <DialogHeader><DialogTitle>记录产蛋</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>数量（枚）</Label>
              <Input type="number" value={eggForm.count} onChange={(e) => setEggForm({ ...eggForm, count: e.target.value })} />
            </div>
            <div>
              <Label>蛋种类</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={eggForm.type}
                onChange={(e) => setEggForm({ ...eggForm, type: e.target.value as EggRecord["type"] })}
              >
                <option value="chicken">鸡蛋</option>
                <option value="duck">鸭蛋</option>
                <option value="goose">鹅蛋</option>
              </select>
            </div>
            <Button onClick={handleEgg} className="w-full">记录产蛋</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
