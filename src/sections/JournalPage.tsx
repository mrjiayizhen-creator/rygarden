import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PhotoGallery } from "@/components/PhotoGallery";
import { getMediaForEntity } from "@/lib/mediaStore";
import {
  Plus, BookOpen, Smile, Meh, CloudSun, Zap, Heart, Coffee,
  ChevronDown, ChevronUp, Image as ImageIcon, CalendarDays,
} from "lucide-react";
import type { JournalEntry, AppState } from "@/types";

const moodMap: Record<JournalEntry["mood"], { emoji: string; label: string; color: string; icon: React.ReactNode }> = {
  excited: { emoji: "🤩", label: "激动", color: "bg-amber-100 text-amber-700 border-amber-200", icon: <Zap className="w-4 h-4" /> },
  happy: { emoji: "😊", label: "开心", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <Smile className="w-4 h-4" /> },
  grateful: { emoji: "🙏", label: "感恩", color: "bg-rose-100 text-rose-700 border-rose-200", icon: <Heart className="w-4 h-4" /> },
  calm: { emoji: "😌", label: "平静", color: "bg-sky-100 text-sky-700 border-sky-200", icon: <CloudSun className="w-4 h-4" /> },
  reflective: { emoji: "🤔", label: "沉思", color: "bg-purple-100 text-purple-700 border-purple-200", icon: <Meh className="w-4 h-4" /> },
  tired: { emoji: "😴", label: "疲惫", color: "bg-stone-100 text-stone-600 border-stone-200", icon: <Coffee className="w-4 h-4" /> },
};

interface JournalPageProps {
  state: AppState;
  addItem: (key: "journalEntries", item: JournalEntry) => void;
  removeItem: (key: "journalEntries", id: string) => void;
}

export function JournalPage({ state, addItem, removeItem }: JournalPageProps) {
  const [writeOpen, setWriteOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", mood: "happy" as JournalEntry["mood"] });
  const [entryPhotos, setEntryPhotos] = useState<Record<string, { id: string; url: string }[]>>({});

  const sortedEntries = [...state.journalEntries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const loadPhotos = useCallback(async (entryId: string) => {
    const photos = await getMediaForEntity(entryId, "journal");
    setEntryPhotos((prev) => ({ ...prev, [entryId]: photos }));
  }, []);

  const handleSubmit = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const now = new Date().toISOString();
    addItem("journalEntries", {
      id: `j${Date.now()}`,
      title: form.title.trim(),
      content: form.content.trim(),
      mood: form.mood,
      createdAt: now,
      updatedAt: now,
    });
    setForm({ title: "", content: "", mood: "happy" });
    setWriteOpen(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = d.toLocaleDateString("zh-CN");

    if (dateStr === today.toLocaleDateString("zh-CN")) return "今天";
    if (dateStr === yesterday.toLocaleDateString("zh-CN")) return "昨天";
    return dateStr;
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            心得笔记
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            记录田园生活的感悟、收获和日常
          </p>
        </div>
        <Button onClick={() => setWriteOpen(true)} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          写心得
        </Button>
      </div>

      {/* Empty state */}
      {sortedEntries.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">还没有心得笔记</h3>
          <p className="text-sm text-muted-foreground mb-4">
            写下你的田园感悟、劳动收获和日常观察
          </p>
          <Button onClick={() => setWriteOpen(true)} variant="outline" className="gap-1.5">
            <Plus className="w-4 h-4" />
            写下第一篇心得
          </Button>
        </div>
      )}

      {/* Timeline entries */}
      {sortedEntries.length > 0 && (
        <div className="space-y-4">
          {sortedEntries.map((entry) => {
            const m = moodMap[entry.mood];
            const isExpanded = expandedId === entry.id;
            const photos = entryPhotos[entry.id] ?? [];

            return (
              <div
                key={entry.id}
                className="bg-card rounded-xl border border-border overflow-hidden hover:border-emerald-200/50 transition-colors"
              >
                {/* Entry header */}
                <button
                  onClick={() => {
                    if (expandedId === entry.id) {
                      setExpandedId(null);
                    } else {
                      setExpandedId(entry.id);
                      loadPhotos(entry.id);
                    }
                  }}
                  className="w-full text-left p-4 flex items-start gap-3"
                >
                  {/* Mood emoji */}
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl shrink-0 mt-0.5">
                    {m.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-foreground">{entry.title}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${m.color} flex items-center gap-0.5`}>
                        {m.icon}
                        {m.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <CalendarDays className="w-3 h-3" />
                      <span>{formatDate(entry.createdAt)}</span>
                      <span>{formatTime(entry.createdAt)}</span>
                      {photos.length > 0 && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                          <ImageIcon className="w-3 h-3" />
                          <span>{photos.length} 张照片</span>
                        </>
                      )}
                    </div>
                    {/* Preview line */}
                    {!isExpanded && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {entry.content}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-muted-foreground">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-border -mt-1">
                    <div className="pt-4 space-y-4">
                      {/* Content */}
                      <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {entry.content}
                      </div>

                      {/* Photos */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" />照片
                        </p>
                        <PhotoGallery
                          photos={photos}
                          entityId={entry.id}
                          entityType="journal"
                          onPhotosChange={() => loadPhotos(entry.id)}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          更新于 {formatDate(entry.updatedAt)} {formatTime(entry.updatedAt)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-red-50 h-8"
                          onClick={() => {
                            if (confirm("确定要删除这篇心得吗？")) {
                              removeItem("journalEntries", entry.id);
                              setExpandedId(null);
                            }
                          }}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Write dialog */}
      <Dialog open={writeOpen} onOpenChange={setWriteOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              写心得
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                placeholder="给这篇心得起个名字..."
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>心情</Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(moodMap) as [JournalEntry["mood"], typeof moodMap["happy"]][]).map(
                  ([key, m]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, mood: key }))}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        form.mood === key
                          ? m.color + " border-current"
                          : "border-border hover:bg-secondary text-muted-foreground"
                      }`}
                    >
                      <span className="text-base">{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">内容</Label>
              <Textarea
                id="content"
                placeholder="今天在田园里有什么收获或感悟？发生了什么有趣的事？..."
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={5}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => { setWriteOpen(false); }}>
                取消
              </Button>
              <Button
                className="flex-1"
                disabled={!form.title.trim() || !form.content.trim()}
                onClick={handleSubmit}
              >
                发布心得
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
