"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { SOCK_CENTER, SOCK_BOTTOM_Y } from "@/lib/config";

// Дэлгүүрийн витрин шиг: оймсны доор дугуй тавцан + зөөлөн сүүдэр
export default function Pedestal() {
  const [cx, , cz] = SOCK_CENTER;
  const top = SOCK_BOTTOM_Y - 0.003;
  const height = 0.08;

  // Төвдөө бараан, гадагшаа уусах сүүдэр
  const shadow = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(40,20,10,0.45)");
    grad.addColorStop(0.35, "rgba(40,20,10,0.2)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <group position={[cx, top, cz]}>
      <ambientLight intensity={1.1} />
      <spotLight position={[0.4, 1.2, 0.6]} angle={0.5} penumbra={1} intensity={6} color="#ffe9d2" />
      <directionalLight position={[-1, 0.5, -0.5]} intensity={0.4} color="#b9c6ff" />

      {/* тавцан */}
      <mesh position={[0, -height / 2, 0]}>
        <cylinderGeometry args={[0.2, 0.21, height, 96]} />
        <meshStandardMaterial color="#f7f3ee" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* алтан зураас */}
      <mesh position={[0, -0.004, 0]}>
        <cylinderGeometry args={[0.2015, 0.2015, 0.004, 96]} />
        <meshStandardMaterial color="#c8a46a" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* оймсны сүүдэр */}
      <mesh position={[0, 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.22, 0.22]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}
