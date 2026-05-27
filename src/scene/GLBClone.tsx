/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const GLBClone = React.memo(function GLBClone({ baseScene, position, rotation, glbBox, panelId, desc, unitId, isBlinking, doubleHeight }: {
  baseScene: THREE.Group;
  position: [number, number, number];
  rotation: [number, number, number];
  glbBox: THREE.Box3;
  panelId: number;
  desc: string;
  unitId: string;
  isBlinking: boolean;
  doubleHeight?: boolean;
}) {
  const cloned = useMemo(() => baseScene.clone(), [baseScene]);
  const groupRef = useRef<THREE.Group>(null);
  const blinkOverlayRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!blinkOverlayRef.current) return;
    if (isBlinking) {
      const isOn = Math.floor(clock.elapsedTime * 6) % 2 === 0;
      blinkOverlayRef.current.opacity = isOn ? 0.55 : 0;
    } else {
      blinkOverlayRef.current.opacity = 0;
    }
  });

  // 목표 틀 크기 (하나의 판넬 칸 기준)
  const TARGET_PW = 2.0;
  const TARGET_PH = 2.5;
  const TARGET_PD = 1.0;

  const { finalScale, cx, cy, fz, pw, ph, modelOffset } = useMemo(() => {
    const size = glbBox.getSize(new THREE.Vector3());
    const center = glbBox.getCenter(new THREE.Vector3());

    // 모델을 틀에 꽉 채우기 위한 스케일 계산
    const currentPH = doubleHeight ? TARGET_PH * 2.07 : TARGET_PH;
    const currentPD = doubleHeight ? TARGET_PD * 0.96 : TARGET_PD; // 두께 살짝 보정 (47번 등)
    const scaleX = TARGET_PW / size.x;
    const scaleY = currentPH / size.y;
    const scaleZ = currentPD / size.z;

    return {
      finalScale: [scaleX, scaleY, scaleZ] as [number, number, number],
      cx: 0, // 중앙 정렬 위해 0
      cy: currentPH / 2, // 바닥 기준 절반 높이
      fz: currentPD / 2 + 0.002, // 앞면 돌출
      pw: TARGET_PW,
      ph: currentPH,
      modelOffset: [-center.x * scaleX, -glbBox.min.y * scaleY, -center.z * scaleZ] as [number, number, number],
    };
  }, [glbBox, doubleHeight]);

  const fontPh = TARGET_PH;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* 모델링 파일을 틀 중앙/바닥 기준으로 배치 */}
      <primitive object={cloned} scale={finalScale} position={modelOffset} />

      {/* 앞면 전체 블링킹 오버레이 */}
      <mesh position={[cx, cy, fz + 0.0005]}>
        <planeGeometry args={[pw, ph]} />
        <meshBasicMaterial ref={blinkOverlayRef} color="#dd1111" transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 명판 엠보싱 그림자 (80%) */}
      <mesh position={[cx, cy + ph * 0.327, fz + 0.002]}>
        <planeGeometry args={[pw * 0.742, ph * 0.254]} />
        <meshStandardMaterial color="#05080d" metalness={0} roughness={1} transparent opacity={0.4} />
      </mesh>

      {/* 정밀 CNC 아노다이징 프레임 (80%) */}
      <mesh position={[cx, cy + ph * 0.33, fz + 0.003]}>
        <planeGeometry args={[pw * 0.726, ph * 0.245]} />
        <meshStandardMaterial color="#1b2434" metalness={1.0} roughness={0.20} envMapIntensity={1.6} />
      </mesh>

      {/* 명판 본체 — 브러시드 알루미늄 (80%) */}
      <mesh position={[cx, cy + ph * 0.33, fz + 0.004]}>
        <planeGeometry args={[pw * 0.700, ph * 0.218]} />
        <meshStandardMaterial color="#c2ccd5" metalness={0.78} roughness={0.14} envMapIntensity={3.0} />
      </mesh>

      {/* 기기번호 */}
      <React.Suspense fallback={null}>
        <Text
          position={[cx, cy + ph * 0.358, fz + 0.006]}
          fontSize={fontPh * 0.056}
          color="#08111e"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          letterSpacing={0.06}
          textAlign="center"
          font="/fonts/Pretendard-Bold.woff"
        >
          {unitId}
        </Text>
      </React.Suspense>

      {/* 기기명 */}
      <React.Suspense fallback={null}>
        <Text
          position={[cx, cy + ph * 0.302, fz + 0.006]}
          fontSize={fontPh * 0.040}
          color="#243245"
          anchorX="center"
          anchorY="middle"
          maxWidth={pw * 0.65}
          textAlign="center"
          font="/fonts/Pretendard-Bold.woff"
        >
          {desc}
        </Text>
      </React.Suspense>
    </group>
  );
});

export default GLBClone;
