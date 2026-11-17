"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LOOK_AT, ORBIT_RADIUS, ORBIT_TURNS } from "@/lib/config";

// Scroll хийхэд камер оймсыг 360° тойрно. Хулганаар/хуруугаар чирж бас эргүүлнэ.
// progress: 0..1, Scene-ээс ref-ээр ирнэ (re-render хийхгүй)
export default function CameraRig({ progress }: { progress: { current: number } }) {
  const gl = useThree((s) => s.gl);
  const target = useMemo(() => new THREE.Vector3(...LOOK_AT), []);
  const smooth = useRef(0);
  const drag = useRef({ active: false, lastX: 0, lastY: 0, yaw: 0, pitch: 0 });
  const dragSmooth = useRef({ yaw: 0, pitch: 0 });

  // Чирж эргүүлэх
  useEffect(() => {
    const el = gl.domElement;
    el.style.cursor = "grab";
    el.style.touchAction = "pan-y"; // гар утсан дээр босоо scroll хэвээр
    const down = (e: PointerEvent) => {
      drag.current.active = true;
      drag.current.lastX = e.clientX;
      drag.current.lastY = e.clientY;
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.active) return;
      d.yaw -= (e.clientX - d.lastX) * 0.008;
      d.pitch = THREE.MathUtils.clamp(d.pitch + (e.clientY - d.lastY) * 0.004, -0.35, 0.6);
      d.lastX = e.clientX;
      d.lastY = e.clientY;
    };
    const up = () => {
      drag.current.active = false;
      el.style.cursor = "grab";
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  useFrame(({ camera }, dt) => {
    // scroll-ийг зөөлөн дагана
    smooth.current = THREE.MathUtils.damp(smooth.current, progress.current, 4, dt);
    const p = THREE.MathUtils.clamp(smooth.current, 0, 1);

    dragSmooth.current.yaw = THREE.MathUtils.damp(dragSmooth.current.yaw, drag.current.yaw, 8, dt);
    dragSmooth.current.pitch = THREE.MathUtils.damp(dragSmooth.current.pitch, drag.current.pitch, 8, dt);

    // Тойрох өнцөг: scroll + чирэлт
    const angle = p * Math.PI * 2 * ORBIT_TURNS + dragSmooth.current.yaw;
    // Дундаа бага зэрэг ойртож, дээрээс харна
    const radius = ORBIT_RADIUS * (1 - 0.25 * Math.sin(p * Math.PI));
    const elev = 0.15 + 0.25 * Math.sin(p * Math.PI) + dragSmooth.current.pitch;

    camera.position.set(
      target.x + Math.sin(angle) * Math.cos(elev) * radius,
      target.y + Math.sin(elev) * radius,
      target.z + Math.cos(angle) * Math.cos(elev) * radius
    );
    camera.lookAt(target);
  });

  return null;
}
