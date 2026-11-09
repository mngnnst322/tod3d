"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA_PATH, LOOK_AT } from "@/lib/config";

// progress: 0..1, Scene-ээс ref-ээр ирнэ (re-render хийхгүй)
export default function CameraRig({ progress }: { progress: { current: number } }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(CAMERA_PATH.map((p) => new THREE.Vector3(...p))),
    []
  );
  const target = useMemo(() => new THREE.Vector3(...LOOK_AT), []);
  const smooth = useRef(0);
  const mouse = useRef(new THREE.Vector2());
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, pointer }, dt) => {
    // scroll-ийг зөөлөн дагана
    smooth.current = THREE.MathUtils.damp(smooth.current, progress.current, 4, dt);
    curve.getPointAt(THREE.MathUtils.clamp(smooth.current, 0, 1), tmp);

    // хулганаар бага зэрэг parallax
    mouse.current.lerp(pointer, 1 - Math.exp(-3 * dt));
    tmp.x += mouse.current.x * 0.15;
    tmp.y += mouse.current.y * 0.1;

    camera.position.copy(tmp);
    camera.lookAt(target);
  });

  return null;
}
