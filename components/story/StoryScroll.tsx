"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Story.module.css";

gsap.registerPlugin(ScrollTrigger);

type Manifest = { count: number; width: number; height: number; ext: string };

export type StoryBeat = { from: number; tag: string; title: string };

// Видеоны 4 хэсэгт тааруулсан текст (from = scroll progress 0..1)
const DEFAULT_BEATS: StoryBeat[] = [
  { from: 0, tag: "01 — Утас", title: "Утас бүрээс эхэлнэ." },
  { from: 0.27, tag: "02 — Дэлгүүр", title: "Тавиур дээр таныг хүлээнэ." },
  { from: 0.52, tag: "03 — Савлагаа", title: "Хайртайгаар савлана." },
  { from: 0.76, tag: "04 — Хүргэлт", title: "Таны үүд хүртэл." },
];

const MOBILE_QUERY = "(max-width: 767px)";

const frameUrl = (base: string, variant: string, i: number, ext: string) =>
  `${base}/${variant}/${String(i + 1).padStart(4, "0")}.${ext}`;

export type StoryScrollProps = {
  /** public/ доторх хавтас: desktop/ ба mobile/ дэд хавтастай, manifest.json-той */
  framesPath?: string;
  /** Scroll-ийн урт (vh) */
  scrollVh?: number;
  beats?: StoryBeat[];
  badge?: string;
  label?: string;
};

export default function StoryScroll({
  framesPath = "/story",
  scrollVh = 450,
  beats = DEFAULT_BEATS,
  badge = "Бодит бүтээгдэхүүн, дэлгүүр, савлагаан дээр суурилсан AI хөдөлгөөн",
  label = "Утаснаас таны үүд хүртэл: оймсны аялал",
}: StoryScrollProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [beat, setBeat] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    let images: HTMLImageElement[] = [];
    let current = 0;
    let rafId = 0;

    // object-fit: cover; кадр ачаалагдаагүй бол хамгийн ойрын ачаалагдсаныг зурна
    const draw = (index: number) => {
      let img: HTMLImageElement | undefined;
      for (let d = 0; d < images.length; d++) {
        const a = images[index - d];
        const b = images[index + d];
        if (a?.complete && a.naturalWidth) { img = a; break; }
        if (b?.complete && b.naturalWidth) { img = b; break; }
      }
      if (!img) return;
      const cw = canvas.width, ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };
    const requestDraw = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => draw(current));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      requestDraw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const load = async (variant: string, animate: boolean) => {
      const res = await fetch(`${framesPath}/${variant}/manifest.json`);
      if (!res.ok || cancelled) return null;
      const m: Manifest = await res.json();
      images.forEach((im) => (im.src = ""));
      images = new Array(m.count);
      const make = (i: number) => {
        const im = new Image();
        im.decoding = "async";
        im.onload = () => { if (!cancelled && Math.abs(i - current) < 3) requestDraw(); };
        im.src = frameUrl(framesPath, variant, i, m.ext);
        images[i] = im;
      };
      make(0);
      if (!animate) return m;
      for (let i = 8; i < m.count; i += 8) make(i);
      for (let i = 1; i < m.count; i++) if (!images[i]) make(i);
      return m;
    };

    const mm = gsap.matchMedia();
    mm.add(
      // "all" заавал: нэг ч нөхцөл таарахгүй бол gsap функцийг ажиллуулдаггүй
      { all: "all", reduce: "(prefers-reduced-motion: reduce)", mobile: MOBILE_QUERY },
      (context) => {
        const { reduce, mobile } = context.conditions as { reduce: boolean; mobile: boolean };
        setReduced(reduce);
        let st: ScrollTrigger | undefined;
        load(mobile ? "mobile" : "desktop", !reduce).then((m) => {
          if (!m || cancelled || reduce) { requestDraw(); return; }
          st = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              const next = Math.round(self.progress * (m.count - 1));
              if (next !== current) { current = next; requestDraw(); }
              let b = 0;
              for (let i = 0; i < beats.length; i++) if (self.progress >= beats[i].from) b = i;
              setBeat(b);
            },
          });
          ScrollTrigger.refresh();
        });
        return () => st?.kill();
      }
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      mm.revert();
      images.forEach((im) => (im.src = ""));
      images = [];
    };
  }, [framesPath, beats]);

  return (
    <section
      ref={sectionRef}
      className={styles.story}
      style={{ height: reduced ? "100vh" : `${scrollVh}vh` }}
      aria-label={label}
    >
      <div className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label={label} />
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.copy}>
          {beats.map((b, i) => (
            <div key={i} className={`${styles.beat} ${i === beat ? styles.on : ""}`} aria-hidden={i !== beat}>
              <span className={styles.tag}>{b.tag}</span>
              <h2>{b.title}</h2>
            </div>
          ))}
        </div>
        <div className={styles.progress} aria-hidden="true">
          {beats.map((_, i) => <i key={i} className={i <= beat ? styles.done : ""} />)}
        </div>
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>
    </section>
  );
}
