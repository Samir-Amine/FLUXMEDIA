"use client";
import { useEffect, useRef, useState } from "react";
import { Upload, Copy, Loader2 } from "lucide-react";
import { PageHeader, Panel, DeleteButton } from "./kit";
import { useToast } from "./toast";

type F = { name: string; url: string; size: number; at: string };

export function MediaAdmin() {
  const [files, setFiles] = useState<F[]>([]);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const load = () => fetch("/api/admin/media/upload").then((r) => r.json()).then(setFiles);
  useEffect(() => { load(); }, []);

  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    for (const f of Array.from(list)) {
      const fd = new FormData(); fd.append("file", f);
      const r = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      if (!r.ok) toast((await r.json()).error || "Upload failed", "err");
    }
    await load(); setBusy(false); toast("Upload complete.");
  };

  return (
    <>
      <PageHeader title="Media" sub="Upload images and videos for content and pages." actions={<button className="btn-brand !py-2.5" onClick={() => input.current?.click()} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload</button>} />
      <input ref={input} type="file" multiple hidden accept="image/*,video/mp4" onChange={(e) => upload(e.target.files)} />
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
        className="mb-6 grid place-items-center rounded-2xl border border-dashed border-line/30 bg-surface/40 p-10 text-center text-sm text-muted"
      >
        Drag & drop files here, or use the Upload button. PNG, JPG, WEBP, GIF, SVG, MP4 · max 8 MB.
      </div>
      {files.length === 0 ? (
        <Panel><p className="text-center text-sm text-muted">No media uploaded yet.</p></Panel>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {files.map((f) => (
            <div key={f.name} className="card overflow-hidden">
              <div className="aspect-square bg-surface2">
                {f.name.endsWith(".mp4") ? <video src={f.url} className="h-full w-full object-cover" /> : /* eslint-disable-next-line @next/next/no-img-element */ <img src={f.url} alt={f.name} className="h-full w-full object-cover" />}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-semibold" title={f.name}>{f.name}</p>
                <p className="text-[10px] text-muted">{(f.size / 1024).toFixed(0)} KB</p>
                <div className="mt-2 flex items-center justify-between">
                  <button onClick={() => { navigator.clipboard.writeText(f.url); toast("URL copied."); }} className="inline-flex items-center gap-1 text-xs text-sky"><Copy className="h-3 w-3" /> Copy URL</button>
                  <DeleteButton label="" what={f.name} onConfirm={async () => { await fetch(`/api/admin/media/upload?name=${encodeURIComponent(f.name)}`, { method: "DELETE" }); load(); }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
