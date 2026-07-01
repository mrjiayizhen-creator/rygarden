import { useState, useRef, useCallback, type DragEvent } from "react";
import { ImagePlus, Loader2, Trash2, Maximize2, X } from "lucide-react";
import { uploadMedia, deleteMedia } from "@/lib/mediaStore";

interface PhotoGalleryProps {
  photos: { id: string; url: string }[];
  entityId: string;
  entityType: "beehive" | "poultry" | "cropPlot" | "journal";
  onPhotosChange: () => void;
}

export function PhotoGallery({ photos, entityId, entityType, onPhotosChange }: PhotoGalleryProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      setIsUploading(true);
      for (const file of imageFiles) {
        try {
          await uploadMedia(file, entityId, entityType);
        } catch {
          // skip on error
        }
      }
      setIsUploading(false);
      onPhotosChange();
    },
    [entityId, entityType, onPhotosChange],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMedia(id);
      onPhotosChange();
    },
    [onPhotosChange],
  );

  return (
    <div className="space-y-3">
      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-emerald-500 bg-emerald-50"
            : "border-border hover:border-emerald-300 hover:bg-emerald-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <span className="text-sm text-muted-foreground">上传中...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <ImagePlus className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-700">点击或拖拽上传照片</span>
            <span className="text-xs text-muted-foreground">支持 JPG/PNG，自动压缩</span>
          </div>
        )}
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-secondary">
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => { e.stopPropagation(); setViewerUrl(photo.url); }}
                  className="p-1.5 rounded-full bg-white/90 hover:bg-white text-foreground transition-colors"
                  title="查看大图"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                  className="p-1.5 rounded-full bg-white/90 hover:bg-red-50 text-red-600 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox viewer */}
      {viewerUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setViewerUrl(null)}
        >
          <button
            onClick={() => setViewerUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={viewerUrl}
            alt=""
            className="max-w-full max-h-[90vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
