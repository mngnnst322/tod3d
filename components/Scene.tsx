"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Splat from "./Splat";
import CameraRig from "./CameraRig";
import { SECTIONS } from "@/lib/config";

gsap.registerPlugin(ScrollTrigger);

export default function Scene() {
  const progress = useRef(0);
  const wrap = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const onLoad = useCallback(() => setLoaded(true), []);

  useEffect(() => {
    // Smooth scroll
    const lenis = new Lenis({ lerp: 0.08 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // Нийт scroll → камерын progress
      ScrollTrigger.create({
        trigger: wrap.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (s) => (progress.current = s.progress),
      });

      // Хэсэг бүрийн текст гарч ирэх
      gsap.utils.toArray<HTMLElement>(".section-inner").forEach((el, i) => {
        if (i === 0) {
          gsap.set(el, { autoAlpha: 0, y: 40, filter: "blur(12px)" });
          return;
        }
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 60, filter: "blur(12px)" },
          {
            autoAlpha: 1, y: 0, filter: "blur(0px)",
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 80%", end: "top 40%", scrub: true },
          }
        );
      });
    }, wrap);

    return () => {
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  // Эхний хэсгийн текст loader алга болох үед гарч ирэх
  useEffect(() => {
    if (!loaded) return;
    const el = wrap.current?.querySelector<HTMLElement>(".section-inner");
    if (!el) return;
    const tween = gsap.to(el, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.4, delay: 0.4, ease: "power3.out" });
    return () => {
      tween.kill();
    };
  }, [loaded]);

  return (
    <>
      <div className="canvas-wrap">
        <Canvas
          camera={{ fov: 50, near: 0.01, far: 100, position: [0, 0.3, 4] }}
          dpr={[1, 1.5]}
          gl={{ antialias: false }}
        >
          <color attach="background" args={["#0b0c0e"]} />
          <Splat onLoad={onLoad} />
          <CameraRig progress={progress} />
        </Canvas>
      </div>

      <div className={`loader ${loaded ? "hide" : ""}`}>Далавч дэлгэж байна…</div>

      <main ref={wrap} className="scroll">
        {SECTIONS.map((s, i) => (
          <section key={i} className={`section ${i % 2 ? "right" : "left"}`}>
            <div className="section-inner">
              <span className="kicker">{s.kicker}</span>
              <h2>{s.title}</h2>
              <p>{s.body}</p>
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
