"use client";
import { motion, useReducedMotion } from "framer-motion";
import {
  MessageSquare, ClipboardList, MessageCircle, Database, Mail, Bot, CalendarDays,
  ShoppingCart, Sparkles, Cpu, BarChart3, Compass, PenTool, LayoutDashboard,
  Clapperboard, Users, TrendingUp, Globe, ArrowRight, Check,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ── Icon maps ─────────────────────────────────────────────── */
export const ICONS: Record<string, LucideIcon> = {
  message: MessageSquare, clipboard: ClipboardList, whatsapp: MessageCircle,
  database: Database, mail: Mail, bot: Bot, calendar: CalendarDays,
  cart: ShoppingCart, sparkles: Sparkles, cpu: Cpu, chart: BarChart3,
  compass: Compass, pen: PenTool, dashboard: LayoutDashboard,
  video: Clapperboard, users: Users, trend: TrendingUp, globe: Globe,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = ICONS[name] || Sparkles;
  return <C className={className} aria-hidden />;
}

/* ── Brand glyphs (platform icons) ─────────────────────────── */
const P: Record<string, React.ReactNode> = {
  instagram: (
    <path d="M12 2.2c2.7 0 3 0 4.1.06 2.7.12 4.5 1.9 4.63 4.63.05 1.06.06 1.37.06 4.1s0 3-.06 4.1c-.12 2.7-1.9 4.5-4.63 4.63-1.06.05-1.37.06-4.1.06s-3 0-4.1-.06c-2.7-.12-4.5-1.9-4.63-4.63C3.2 15 3.2 14.7 3.2 12s0-3 .06-4.1C3.4 5.2 5.2 3.4 7.9 3.26 9 3.2 9.3 3.2 12 3.2Zm0 4.6a5.2 5.2 0 1 0 0 10.4 5.2 5.2 0 0 0 0-10.4Zm0 2.2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm5.4-3.1a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z" />
  ),
  facebook: <path d="M13.5 21v-7h2.4l.4-2.9h-2.8V9.2c0-.85.28-1.43 1.47-1.43h1.4V5.16c-.26-.03-1.14-.11-2.17-.11-2.15 0-3.63 1.31-3.63 3.72v2.33H8.2V14h2.37v7h2.93Z" />,
  whatsapp: (
    <path d="M12 2.7a9.1 9.1 0 0 0-7.86 13.7L3 21.3l5-1.1A9.1 9.1 0 1 0 12 2.7Zm0 1.8a7.3 7.3 0 1 1-3.7 13.6l-.27-.16-2.9.64.66-2.83-.17-.28A7.3 7.3 0 0 1 12 4.5Zm-2.6 3.4c-.18 0-.47.07-.72.34-.24.27-.94.92-.94 2.24 0 1.32.96 2.6 1.1 2.78.13.18 1.86 2.97 4.6 4.05 2.27.9 2.73.72 3.23.67.5-.04 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07a7.4 7.4 0 0 1-2.18-1.35 8.2 8.2 0 0 1-1.51-1.88c-.16-.27-.02-.42.12-.55.12-.12.27-.32.4-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.13-.6-1.46-.83-2-.2-.48-.4-.42-.61-.43h-.46Z" />
  ),
  linkedin: <path d="M6.94 8.6H4V20h2.94V8.6ZM5.47 7.3a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM20 13.34c0-3.2-1.7-4.69-3.98-4.69-1.83 0-2.65 1-3.12 1.72V8.6H9.96V20h2.94v-5.9c0-1.57.3-3.09 2.24-3.09 1.9 0 1.92 1.78 1.92 3.19V20H20v-6.66Z" />,
  tiktok: <path d="M16.6 3c.36 1.94 1.63 3.35 3.9 3.5v2.6c-1.5.14-2.83-.3-3.94-1.06v6.06a5.72 5.72 0 1 1-5.72-5.73c.32 0 .63.03.93.09v2.75a2.98 2.98 0 1 0 2.08 2.89V3h2.75Z" />,
  youtube: <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8L15.6 12 10 15.2Z" />,
  x: <path d="M17.9 3H21l-6.8 7.8L22.2 21h-6.3l-4.9-6.4L5.4 21H2.3l7.3-8.3L2 3h6.4l4.4 5.9L17.9 3Zm-1.1 16.1h1.7L7.6 4.8H5.8l11 14.3Z" />,
  website: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.9 9h-3.4a15.6 15.6 0 0 0-1.2-5.6A8 8 0 0 1 19.9 11ZM12 4.1c.9 1.1 1.9 3.3 2.1 6.9H9.9c.2-3.6 1.2-5.8 2.1-6.9ZM4.1 13h3.4c.1 2.2.6 4.1 1.2 5.6A8 8 0 0 1 4.1 13Zm3.4-2H4.1a8 8 0 0 1 4.6-5.6A15.6 15.6 0 0 0 7.5 11ZM12 19.9c-.9-1.1-1.9-3.3-2.1-6.9h4.2c-.2 3.6-1.2 5.8-2.1 6.9Zm3.3-1.3c.6-1.5 1.1-3.4 1.2-5.6h3.4a8 8 0 0 1-4.6 5.6Z" />,
};

export function PlatformGlyph({ id, className = "h-5 w-5" }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      {P[id] || P.website}
    </svg>
  );
}

/* ── Logo ──────────────────────────────────────────────────── */
export function Logo({ size = 34, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="FLUXMEDIA logo"
        width={size}
        height={size}
        className="rounded-[10px] shadow-glow-sm"
        style={{ width: size, height: size }}
      />
      {wordmark && (
        <span className="font-display text-lg font-extrabold tracking-[0.08em] text-ink">
          FLUX<span className="grad-text">MEDIA</span>
        </span>
      )}
    </span>
  );
}

/* ── Motion helper ─────────────────────────────────────────── */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.65, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Section heading ───────────────────────────────────────── */
export function SectionHead({
  badge,
  title,
  sub,
  center = true,
}: {
  badge?: string;
  title: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {badge && <span className="tag mb-4">{badge}</span>}
      <h2 className="section-title">{title}</h2>
      {sub && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{sub}</p>}
    </Reveal>
  );
}

export function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return <ArrowRight className={`${className} rtl-flip`} aria-hidden />;
}

export function CheckIcon({ className = "h-4 w-4 text-sky" }: { className?: string }) {
  return <Check className={className} aria-hidden />;
}
