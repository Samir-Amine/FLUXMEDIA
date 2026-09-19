"use client";
import { motion } from "framer-motion";
import type { Locale, SocialLink } from "@/lib/types";
import { L } from "@/lib/utils";
import { Logo, PlatformGlyph, ArrowIcon, Reveal } from "./ui";

const TONE: Record<string, string> = {
  instagram: "from-[#6C2BFB] to-[#0A84FF]",
  facebook: "from-[#2F5BFB] to-[#4FA9FF]",
  whatsapp: "from-[#0A84FF] to-[#2F5BFB]",
  linkedin: "from-[#2F5BFB] to-[#6C2BFB]",
  x: "from-[#4B18B8] to-[#2F5BFB]",
  website: "from-[#4FA9FF] to-[#6C2BFB]",
};

export default function SocialLinksClient({
  links, title, sub, locale,
}: { links: SocialLink[]; title: string; sub: string; locale: Locale }) {
  return (
    <div className="relative min-h-screen overflow-hidden pb-20 pt-36">
      <div className="bg-grid absolute inset-0" />
      <div className="glow-orb -top-24 start-1/2 h-[420px] w-[420px] -translate-x-1/2 bg-indigo/25" />
      <div className="glow-orb bottom-0 end-[10%] h-72 w-72 bg-violet/20" />
      <div className="container-x relative mx-auto max-w-xl">
        <Reveal className="text-center">
          <div className="mx-auto grid w-fit place-items-center rounded-3xl border border-line/25 bg-surface/80 p-4 shadow-glow backdrop-blur-xl">
            <Logo size={64} wordmark={false} />
          </div>
          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-muted">{sub}</p>
        </Reveal>

        <ul className="mt-10 space-y-3.5">
          {links.map((l, i) => (
            <motion.li
              key={l.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.5 }}
            >
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-line/20 bg-surface/80 p-4 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-indigo/60 hover:shadow-glow"
              >
                <span className={`absolute inset-0 bg-gradient-to-r ${TONE[l.platform] || TONE.website} opacity-0 transition duration-300 group-hover:opacity-10`} />
                <span className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${TONE[l.platform] || TONE.website} text-white shadow-glow-sm`}>
                  <PlatformGlyph id={l.platform} className="h-6 w-6" />
                </span>
                <span className="relative min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-display text-base font-bold">{l.name}</span>
                    <span className="truncate text-xs text-muted" dir="ltr">{l.username}</span>
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">{L(l.description, locale)}</span>
                </span>
                <ArrowIcon className="relative h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-sky rtl:group-hover:-translate-x-1" />
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
