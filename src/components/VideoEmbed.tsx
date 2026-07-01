import { useState } from "react";
import { Video, Plus, Trash2, Link2, X } from "lucide-react";
import type { VideoLink } from "@/types";

interface VideoEmbedProps {
  videos: VideoLink[];
  entityId: string;
  entityType: "beehive" | "poultry" | "cropPlot";
  onAdd: (video: Omit<VideoLink, "id" | "createdAt">) => void;
  onRemove: (id: string) => void;
}

/** Parse URL to get embeddable iframe src */
function parseVideoUrl(raw: string): { platform: VideoLink["platform"]; embedUrl: string; title: string } | null {
  const url = raw.trim();
  if (!url) return null;

  // Bilibili: bilibili.com/video/BVxxxxx or b23.tv/xxxx
  const bvMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
  if (bvMatch) {
    return {
      platform: "bilibili",
      embedUrl: `//player.bilibili.com/player.html?bvid=${bvMatch[1]}&autoplay=0`,
      title: `B站视频 BV${bvMatch[1].slice(0, 8)}...`,
    };
  }

  // Youku: v.youku.com/v_show/id_XXXXX.html
  const ykMatch = url.match(/youku\.com\/v_show\/id_([a-zA-Z0-9=]+)/);
  if (ykMatch) {
    return {
      platform: "youku",
      embedUrl: `//player.youku.com/embed/${ykMatch[1]}`,
      title: `优酷视频`,
    };
  }

  // Generic iframe fallback — detect common video embed URLs
  // QQ Video: v.qq.com/x/page/xxxxx.html
  const qqMatch = url.match(/v\.qq\.com\/x\/page\/([a-zA-Z0-9]+)/);
  if (qqMatch) {
    return {
      platform: "other",
      embedUrl: `https://v.qq.com/txp/iframe/player.html?vid=${qqMatch[1]}`,
      title: "腾讯视频",
    };
  }

  // Generic: if it's already an embeddable URL (contains /embed/ or player)
  if (url.includes("/embed/") || url.includes("player.") || url.includes("iframe")) {
    return {
      platform: "other",
      embedUrl: url,
      title: "嵌入视频",
    };
  }

  return null;
}

export function VideoEmbed({ videos, entityId, entityType, onAdd, onRemove }: VideoEmbedProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    setError("");
    const parsed = parseVideoUrl(urlInput);
    if (!parsed) {
      setError("无法识别该视频链接。支持：B站 (bilibili.com/video/)、优酷 (v.youku.com)、腾讯视频 (v.qq.com)");
      return;
    }
    onAdd({
      entityId,
      entityType,
      url: parsed.embedUrl,
      platform: parsed.platform,
      title: customTitle.trim() || parsed.title,
    });
    setUrlInput("");
    setCustomTitle("");
    setShowAdd(false);
    setError("");
  };

  const platformBadge: Record<string, { label: string; color: string }> = {
    bilibili: { label: "B站", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300" },
    youku: { label: "优酷", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
    other: { label: "其他", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  };

  return (
    <div className="space-y-3">
      {/* Video list */}
      {videos.length > 0 && (
        <div className="space-y-3">
          {videos.map((v) => (
            <div key={v.id} className="rounded-xl overflow-hidden border border-border bg-secondary/30">
              {/* Title bar */}
              <div className="flex items-center justify-between px-3 py-2 bg-secondary/50">
                <div className="flex items-center gap-2 min-w-0">
                  <Video className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium truncate">{v.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${platformBadge[v.platform].color}`}>
                    {platformBadge[v.platform].label}
                  </span>
                </div>
                <button
                  onClick={() => onRemove(v.id)}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 transition-colors shrink-0"
                  title="删除视频"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Embed player */}
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={v.url}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={v.title}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add button or input */}
      {showAdd ? (
        <div className="border-2 border-dashed border-emerald-300 rounded-xl p-4 space-y-3 bg-emerald-50/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-700 flex items-center gap-1.5">
              <Link2 className="w-4 h-4" />粘贴视频链接
            </span>
            <button onClick={() => { setShowAdd(false); setError(""); setUrlInput(""); }} className="p-1 rounded hover:bg-emerald-100 text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); setError(""); }}
            placeholder="粘贴 B站 / 优酷 / 腾讯视频 链接..."
            className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            autoFocus
          />
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="视频标题（可选）"
            className="w-full h-9 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!urlInput.trim()}
              className="flex-1 h-9 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              确认添加
            </button>
            <button
              onClick={() => { setShowAdd(false); setError(""); setUrlInput(""); }}
              className="h-9 px-4 rounded-lg border border-input bg-background text-sm text-muted-foreground hover:bg-secondary transition-colors"
            >
              取消
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            支持：B站视频链接、优酷视频链接、腾讯视频链接
          </p>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full border-2 border-dashed border-border hover:border-emerald-300 hover:bg-emerald-50/50 rounded-xl p-4 text-center cursor-pointer transition-colors flex items-center justify-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <Video className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-emerald-700">添加视频链接</p>
            <p className="text-xs text-muted-foreground">支持 B站 / 优酷 / 腾讯视频</p>
          </div>
          <Plus className="w-4 h-4 text-muted-foreground ml-auto" />
        </button>
      )}
    </div>
  );
}
