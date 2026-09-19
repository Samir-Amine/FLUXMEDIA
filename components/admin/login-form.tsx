"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Logo } from "@/components/ui";

export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (res.ok) { router.push(sp.get("next") || "/admin"); router.refresh(); }
    else { setErr((await res.json()).error || "Login failed"); setBusy(false); }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6" dir="ltr">
      <div className="bg-grid absolute inset-0" />
      <div className="glow-orb -top-24 start-1/3 h-96 w-96 bg-indigo/25" />
      <div className="glow-orb bottom-0 end-1/4 h-72 w-72 bg-violet/20" />
      <form onSubmit={submit} className="card relative w-full max-w-sm p-8">
        <div className="flex justify-center"><Logo size={40} /></div>
        <h1 className="mt-6 text-center font-display text-xl font-bold">Admin sign in</h1>
        <p className="mt-1 text-center text-xs text-muted">FLUXMEDIA content management</p>
        <label className="label mt-7">Password</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="input !ps-10" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus autoComplete="current-password" />
        </div>
        {err && <p className="mt-2 text-xs font-medium text-[#ff8f8f]" role="alert">{err}</p>}
        <button className="btn-brand mt-5 w-full" disabled={busy || !pw}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
        </button>
        <p className="mt-5 text-center text-[11px] text-muted/70">Set ADMIN_PASSWORD in .env.local. Default dev password: <code className="text-sky">fluxmedia-admin</code></p>
      </form>
    </div>
  );
}
