"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";
import {
  SPLAT_URL,
  SPLAT_QUATERNION,
  SPLAT_SCALE,
  SOCK_CENTER,
  SOCK_RADIUS,
  SOCK_BOTTOM_Y,
  SOCK_TOP_Y,
  MAX_SPLAT_SIZE,
  MIN_OPACITY,
  MIN_BRIGHTNESS,
} from "@/lib/config";

// Оймсны цилиндрээс гадуурх бүх splat-ыг нууна (opacity = 0)
function keepOnlySock(mesh: SplatMesh) {
  const packed = mesh.packedSplats;
  if (!packed) return;

  const [cx, , cz] = SOCK_CENTER;
  const hide = new Set<number>();

  packed.forEachSplat((i, c, scales, _q, opacity, color) => {
    const r = Math.hypot(c.x - cx, c.z - cz);
    const size = Math.max(scales.x, scales.y, scales.z);
    const inside = r < SOCK_RADIUS && c.y > SOCK_BOTTOM_Y && c.y < SOCK_TOP_Y;
    const brightness = (color.r + color.g + color.b) / 3;
    if (!inside || size > MAX_SPLAT_SIZE || opacity < MIN_OPACITY || brightness < MIN_BRIGHTNESS) hide.add(i);
  });

  const c = new THREE.Vector3();
  const s = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const col = new THREE.Color();
  packed.forEachSplat((i, center, scales, quat, _o, color) => {
    if (!hide.has(i)) return;
    c.copy(center); s.copy(scales); q.copy(quat); col.copy(color);
    packed.setSplat(i, c, s, q, 0, col);
  });
  packed.needsUpdate = true;

  console.log(`[splat] нийт ${packed.numSplats}, оймсонд үлдсэн ${packed.numSplats - hide.size}`);
}

export default function Splat({ onLoad }: { onLoad?: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  // Renderer ба splat-ыг effect дотор үүсгэж, cleanup-д бүрэн устгана.
  // (React dev горимд effect 2 удаа ажилладаг тул устгасан объектыг дахин ашиглахгүй)
  useEffect(() => {
    let alive = true;

    const spark = new SparkRenderer({ renderer: gl, maxPixelRadius: 128 });
    scene.add(spark);

    const splat = new SplatMesh({ url: SPLAT_URL });
    splat.quaternion.set(...SPLAT_QUATERNION);
    splat.scale.setScalar(SPLAT_SCALE);

    // Эхлээд ачаалж, оймсыг тусгаарласны дараа л scene-д нэмнэ
    splat.initialized.then(() => {
      if (!alive) return;
      keepOnlySock(splat);
      scene.add(splat);
      onLoad?.();
    });

    return () => {
      alive = false;
      scene.remove(splat);
      scene.remove(spark);
      splat.dispose();
      spark.dispose();
    };
  }, [gl, scene, onLoad]);

  return null;
}
