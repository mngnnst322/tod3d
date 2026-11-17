"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Story.module.css";

gsap.registerPlugin(ScrollTrigger);

// Албан ёсны уриа: бичлэгийг өөрчлөхгүй
const SLOGAN = "Алхам бүрт хамт";

/** Видеоны дараах төгсгөл: жинхэнэ лого гарч ирээд, уриа үг үгээрээ гарна. */
export default function BrandEnd() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(el);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 60%", toggleActions: "play none none reverse" },
      });
      tl.from(q(`.${styles.logo}`), { scale: 1.5, opacity: 0, filter: "blur(14px)", duration: 0.75, ease: "expo.out" })
        .from(q(`.${styles.glow}`), { opacity: 0, scale: 0.4, duration: 0.9, ease: "power2.out" }, "<")
        .from(q(`.${styles.slogan} span`), { y: 26, opacity: 0, duration: 0.45, stagger: 0.14, ease: "back.out(2)" }, "-=0.25");
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} className={styles.end} aria-label={SLOGAN}>
      <div className={styles.glow} aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.logo} src="/images/logo.png" alt="ТОД ОЙМС" width={1200} height={603} />
      <p className={styles.slogan}>
        {SLOGAN.split(" ").map((w, i) => <span key={i}>{w}</span>)}
      </p>
    </section>
  );
}
