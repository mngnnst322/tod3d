"use client";

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";
import { SPLAT_URL, SPLAT_QUATERNION, SPLAT_SCALE } from "@/lib/config";

export default function Splat({ onLoad }: { onLoad?: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  // SparkRenderer нь R3F-ийн renderer-тэй нэг pipeline дээр splat зурна
  useEffect(() => {
    const spark = new SparkRenderer({ renderer: gl });
    scene.add(spark);
    return () => {
      scene.remove(spark);
    };
  }, [gl, scene]);

  const splat = useMemo(() => {
    const m = new SplatMesh({ url: SPLAT_URL });
    m.quaternion.set(...SPLAT_QUATERNION);
    m.scale.setScalar(SPLAT_SCALE);
    return m;
  }, []);

  useEffect(() => {
    let alive = true;
    splat.initialized.then(() => alive && onLoad?.());
    return () => {
      alive = false;
      splat.dispose();
    };
  }, [splat, onLoad]);

  return <primitive object={splat} />;
}
