/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function PathArrow({ position, target, index }: { position: [number, number, number], target: [number, number, number], index: number }) {
  const ref = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(...position);
      ref.current.lookAt(...target);
    }
  }, [position, target]);

  useFrame((state) => {
    if (materialRef.current) {
      // Flowing animation effect: opacity pulses based on time and index
      materialRef.current.opacity = 0.2 + 0.8 * Math.max(0, Math.sin(state.clock.elapsedTime * 8 - index * 0.5));
    }
  });

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.3);
    s.lineTo(0.2, -0.1);
    s.lineTo(0.08, -0.1);
    s.lineTo(0.08, -0.4);
    s.lineTo(-0.08, -0.4);
    s.lineTo(-0.08, -0.1);
    s.lineTo(-0.2, -0.1);
    s.closePath();
    return s;
  }, []);

  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial ref={materialRef} color="#ff3333" transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default PathArrow;
