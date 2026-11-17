"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./SockSpinHero.module.css";

export type SockBeat = {
  tag: string;
  title: string;
  text?: string;
  cta?: { label: string; href: string };
};

export type SockSpinHeroProps = {
  /** Folder in /public that holds the frames, e.g. "/sock-spin" */
  framesPath?: string;
  /** Number of frames, named 01.webp, 02.webp ... */
  frameCount?: number;
  /** File extension of the frames */
  frameExt?: string;
  /** Five text beats shown as the sock turns */
  beats?: SockBeat[];
  /** Big wordmark behind the sock, two lines */
  wordmark?: [string, string];
  /** Text around the rotating ring badge */
  ringText?: string;
  /** Accessible description of the product */
  alt?: string;
  /** Show the brand + nav bar inside the hero (turn off if your layout already has a header) */
  showNav?: boolean;
  brand?: string;
  navLinks?: { label: string; href: string }[];
  cartHref?: string;
};

const DEFAULT_BEATS: SockBeat[] = [
  { tag: "2011 оноос хойш", title: "Монгол оймс. Монгол чанар.", text: "Монголд үйлдвэрлэсэн, олон улсын стандартаар баталгаажсан оймс." },
  { tag: "ISO 9001", title: "Олон улсын стандарт.", text: "ISO 9001 чанарын удирдлагатай. Олон улсын болон үндэсний 5 гэрчилгээтэй." },
  { tag: "Органик", title: "Органик баталгаажуулалт.", text: "Монголын ҮХААТ-ын органик гэрчилгээтэй." },
  { tag: "Загвар", title: "Өнгө бүрт өөр хэв маяг.", text: "Өдөр тутам, спорт, ажил — хөл бүрт тохирох оймс. Өөрийнхөө өнгийг сонго." },
  { tag: "Улаанбаатарт хүргэлттэй", title: "Хөлд эвтэйхэн.", text: "Өдөржин өмсөхөд тав тухтай. QPay-ээр төлөөд, хүргэлтээ сайтаас шууд хянаарай.", cta: { label: "Дэлгүүр үзэх", href: "/shop" } },
];

// Scroll progress at which each beat starts (beat 0 starts at 0)
const BEAT_STARTS = [0, 0.12, 0.34, 0.56, 0.8];

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export default function SockSpinHero({
  framesPath = "/sock-spin",
  frameCount = 28,
  frameExt = "webp",
  beats = DEFAULT_BEATS,
  wordmark = ["ТОД", "ОЙМС"],
  ringText = "POSITIVE ОРЧИН ✦ ТОД ОЙМС ✦",
  alt = "Гаа ногоон өнгийн, гүн ногоон хүзүү, өсгий, хуруутай Positive Орчин хээтэй оймс. Гүйлгэхэд эргэнэ.",
  showNav = true,
  brand = "ТОД ОЙМС",
  navLinks = [
    { label: "Дэлгүүр", href: "/shop" },
    { label: "Шинэ загварууд", href: "/shop?sort=new" },
    { label: "Бидний тухай", href: "/about" },
  ],
  cartHref = "/cart",
}: SockSpinHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sockRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const hero = heroRef.current, pin = pinRef.current, cv = canvasRef.current, sock = sockRef.current;
    if (!hero || !pin || !cv || !sock) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const N = frameCount;
    const frames: (HTMLImageElement | undefined)[] = new Array(N);
    let drag = 0, shown = -1, beat = 0, raf = 0, alive = true;

    const progress = () => {
      const total = hero.offsetHeight - window.innerHeight;
      const y = window.scrollY - hero.offsetTop;
      return total > 0 ? Math.min(1, Math.max(0, y / total)) : 0;
    };
    const wanted = () => (((Math.round(progress() * N + drag) % N) + N) % N);

    const draw = (force = false) => {
      const f = wanted();
      let k = f;
      // nearest loaded frame, so the sock is never blank while images arrive
      for (let d = 0; d < N && !frames[k]; d++) {
        k = (f + d) % N; if (frames[k]) break;
        k = (f - d + N) % N;
      }
      const img = frames[k];
      if (!img || (k === shown && !force)) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      shown = k;
    };

    const update = () => {
      const p = progress();
      pin.style.setProperty("--p", p.toFixed(4));
      let b = 0;
      for (let i = 0; i < Math.min(beats.length, BEAT_STARTS.length); i++) if (p >= BEAT_STARTS[i]) b = i;
      if (b !== beat) {
        beatRefs.current[beat]?.classList.remove(styles.on);
        beatRefs.current[b]?.classList.add(styles.on);
        beat = b;
        pin.dataset.beat = String(b);
      }
      pin.classList.toggle(styles.moved, p > 0.03);
      draw();
    };

    for (let i = 0; i < N; i++) {
      const im = new Image();
      im.decoding = "async";
      im.onload = () => {
        if (!alive) return;
        frames[i] = im;
        if (shown === -1 || i === wanted()) draw(true);
      };
      im.src = `${framesPath}/${pad(i + 1)}.${frameExt}`;
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(() => { ticking = false; update(); });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // drag to spin
    let down = false, sx = 0, sd = 0;
    const onDown = (e: PointerEvent) => {
      down = true; sx = e.clientX; sd = drag;
      sock.classList.add(styles.dragging);
      try { sock.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const per = sock.offsetWidth / (N * 0.55);
      drag = sd + Math.round((e.clientX - sx) / per);
      update();
    };
    const onUp = () => { down = false; sock.classList.remove(styles.dragging); };
    sock.addEventListener("pointerdown", onDown);
    sock.addEventListener("pointermove", onMove);
    sock.addEventListener("pointerup", onUp);
    sock.addEventListener("pointercancel", onUp);

    update();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      sock.removeEventListener("pointerdown", onDown);
      sock.removeEventListener("pointermove", onMove);
      sock.removeEventListener("pointerup", onUp);
      sock.removeEventListener("pointercancel", onUp);
    };
  }, [framesPath, frameCount, frameExt, beats]);

  return (
    <section ref={heroRef} className={styles.hero} aria-label={brand}>
      <div ref={pinRef} className={styles.pin} data-beat="0">
        {showNav && (
          <header className={styles.nav}>
            <Link className={styles.brand} href="/"><i />{brand}</Link>
            <nav className={styles.links} aria-label="Үндсэн цэс">
              {navLinks.map((l) => <Link key={l.href + l.label} href={l.href}>{l.label}</Link>)}
            </nav>
            <Link className={styles.cart} href={cartHref}>Сагс</Link>
          </header>
        )}

        <div className={styles.ghost} aria-hidden="true">
          <span>{wordmark[0]}</span><span>{wordmark[1]}</span>
        </div>
        <div className={styles.burst} aria-hidden="true" />

        <svg className={styles.ring} viewBox="0 0 200 200" aria-hidden="true">
          <defs><path id="sockRingPath" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
          <circle cx="100" cy="100" r="44" />
          <text><textPath href="#sockRingPath" textLength="478" lengthAdjust="spacing">{ringText}</textPath></text>
        </svg>

        <div ref={sockRef} className={styles.sock}>
          <canvas ref={canvasRef} width={800} height={1120} role="img" aria-label={alt} />
        </div>

        <div className={styles.copy}>
          {beats.map((b, i) => {
            const Heading = i === 0 ? "h1" : "h2";
            return (
              <div key={i} ref={(el) => { beatRefs.current[i] = el; }} className={`${styles.beat} ${i === 0 ? styles.on : ""}`}>
                <span className={styles.tag}>{b.tag}</span>
                <Heading>{b.title}</Heading>
                {b.text && <p>{b.text}</p>}
                {b.cta && (
                  <Link className={styles.btn} href={b.cta.href}>
                    {b.cta.label}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </Link>
                )}
              </div>
            );
          })}
        </div>


        <div className={styles.hint} aria-hidden="true"><i />Гүйлгэж эргүүл</div>
      </div>
    </section>
  );
}
