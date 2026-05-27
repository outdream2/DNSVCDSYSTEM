/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import GLBGrid from './GLBGrid';
import StaticEnvironment from './StaticEnvironment';
import PathArrow from './PathArrow';

// Stable initial target — module-level constant prevents new object on every render
const INITIAL_TARGET = new THREE.Vector3(40, 2.8, 0);

const Scene = React.memo(function Scene({ targetSubIds, clearActivePanels, onCameraUpdate, panels, isOperationActive }: { targetSubIds: number[], clearActivePanels: () => void, onCameraUpdate: (pos: { x: number, z: number, rotation: number }) => void, panels: any[], isOperationActive: boolean }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const colWidth = 2.0;
  const floorHeight = 2.5;
  const START_X = 10;
  const ROW_Z: [number, number] = [-4.9, 4.9];

  const [selectedPos, setSelectedPos] = useState<[number, number, number] | null>(null);
  const [moving, setMoving] = useState(false);
  const [pathArrows, setPathArrows] = useState<{ position: [number, number, number], target: [number, number, number] }[]>([]);
  const [blinkingIds, setBlinkingIds] = useState<number[]>([]);
  const lastUpdatePos = useRef(new THREE.Vector3());
  const lastUpdateRot = useRef(0);

  const sequenceRunning = useRef(false);

  const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  // 화살표 경로 계산 (순수 함수)
  const computeArrows = (startPos: THREE.Vector3, pos: [number, number, number]) => {
    const aisleZ = 0;
    const visualPts = [
      startPos.clone().setY(0),
      new THREE.Vector3(startPos.x, 0, aisleZ),
      new THREE.Vector3(pos[0], 0, aisleZ),
      new THREE.Vector3(pos[0], 0, pos[2]),
    ];
    const clean = (pts: THREE.Vector3[]) => {
      const r = [pts[0]];
      for (let i = 1; i < pts.length; i++)
        if (pts[i].distanceTo(r[r.length - 1]) > 0.2) r.push(pts[i]);
      if (r.length === 1) r.push(pts[pts.length - 1]);
      return r;
    };
    const curve = new THREE.CatmullRomCurve3(clean(visualPts), false, 'catmullrom', 0.1);
    const n = Math.max(3, Math.floor(curve.getLength() / 0.7));
    return Array.from({ length: n }, (_, idx) => {
      const t = (idx + 1) / (n + 1);
      const pt = curve.getPoint(t);
      const ahead = curve.getPoint(Math.min(1, t + 0.05));
      let tgt: [number, number, number] = [ahead.x, 0.02, ahead.z];
      if (idx === n - 1) tgt = [pos[0], 0.02, pos[2]];
      if (new THREE.Vector3(...tgt).distanceTo(pt) < 0.01) {
        const tan = curve.getTangent(t);
        tgt = [pt.x + tan.x * 0.1, 0.02, pt.z + tan.z * 0.1];
      }
      return { position: [pt.x, 0.02, pt.z] as [number, number, number], target: tgt };
    });
  };

  // 패널까지 이동 (Promise 반환)
  const walkToPanel = (exactPos: { x: number, y: number, z: number, camZ: number }): Promise<void> =>
    new Promise(resolve => {
      if (!controlsRef.current) { resolve(); return; }
      setMoving(true);
      const tl = gsap.timeline({ onComplete: () => { setTimeout(resolve, 2000); } });
      tl.to(camera.position, {
        duration: 4.5, ease: 'power2.inOut',
        x: exactPos.x, y: exactPos.y, z: exactPos.camZ,
        onUpdate: () => controlsRef.current?.update(),
      }, 0);
      tl.to(controlsRef.current.target, {
        duration: 4.5, ease: 'power2.inOut',
        x: exactPos.x, y: exactPos.y, z: exactPos.z,
        onUpdate: () => controlsRef.current?.update(),
      }, 0);
    });

  // 홈으로 복귀 (Promise 반환)
  const goHome = (): Promise<void> =>
    new Promise(resolve => {
      if (!controlsRef.current) { setMoving(false); resolve(); return; }
      setMoving(true);
      const tl = gsap.timeline({ onComplete: () => { setMoving(false); resolve(); } });
      tl.to(camera.position, {
        duration: 3.5, ease: 'power2.inOut',
        x: -6, y: 4.0, z: 0,
        onUpdate: () => controlsRef.current?.update(),
      }, 0);
      tl.to(controlsRef.current.target, {
        duration: 3.5, ease: 'power2.inOut',
        x: 40, y: 2.8, z: 0,
        onUpdate: () => controlsRef.current?.update(),
      }, 0);
    });

  // Keyboard state for navigation
  const keys = useRef<{ [key: string]: boolean }>({});
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Monitor OrbitControls for manual interaction
  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      const handleChange = () => { /* Inactivity timer removed */ };
      controls.addEventListener('change', handleChange);
      return () => controls.removeEventListener('change', handleChange);
    }
  }, []);

  useFrame((state, delta) => {
    const px = Math.round(state.camera.position.x * 100) / 100;
    const pz = Math.round(state.camera.position.z * 100) / 100;
    const rot = Math.round(state.camera.rotation.y * 1000) / 1000;
    if (px !== lastUpdatePos.current.x || pz !== lastUpdatePos.current.z || rot !== lastUpdateRot.current) {
      const scaledX = px >= START_X && colWidth > 0
        ? START_X + (px - START_X) * (2.0 / colWidth)
        : px;
      onCameraUpdate({ x: Math.round(scaledX * 100) / 100, z: pz, rotation: rot });
      lastUpdatePos.current.set(px, state.camera.position.y, pz);
      lastUpdateRot.current = rot;
    }

    if (moving || sequenceRunning.current || !isOperationActive) return;

    const speed = 0.75 * delta;
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3();
    const sideVector = new THREE.Vector3();

    camera.getWorldDirection(frontVector);
    frontVector.y = 0;
    frontVector.normalize();

    sideVector.copy(frontVector).cross(camera.up).normalize();

    if (keys.current['ArrowUp'] || keys.current['w'] || keys.current['W']) direction.add(frontVector);
    if (keys.current['ArrowDown'] || keys.current['s'] || keys.current['S']) direction.add(frontVector.clone().negate());
    if (keys.current['ArrowLeft'] || keys.current['a'] || keys.current['A']) direction.add(sideVector.clone().negate());
    if (keys.current['ArrowRight'] || keys.current['d'] || keys.current['D']) direction.add(sideVector);

    if (direction.length() > 0) {
      if (pathArrows.length > 0) setPathArrows([]);
      direction.normalize().multiplyScalar(speed);

      const nextPos = camera.position.clone().add(direction);
      const isInsidePanelRow1 = nextPos.z > -4.4 && nextPos.z < -3.6 && nextPos.x > -10 && nextPos.x < 10;
      const isInsidePanelRow2 = nextPos.z > 3.6 && nextPos.z < 4.4 && nextPos.x > -10 && nextPos.x < 10;
      const isOutsideRoom = nextPos.x < -24 || nextPos.x > 35 || Math.abs(nextPos.z) > 4.2;

      if (!isInsidePanelRow1 && !isInsidePanelRow2 && !isOutsideRoom) {
        camera.position.add(direction);
        if (controlsRef.current) {
          controlsRef.current.target.add(direction);
          controlsRef.current.update();
        }
      }
    }
  });

  // 메인 시퀀스: 2사이클 (패널깜박 → 경로깜박 → 이동 → 복귀)
  useEffect(() => {
    if (targetSubIds.length === 0) return;

    if (targetSubIds.length > 1) {
      setBlinkingIds(targetSubIds);
      const t = setTimeout(() => {
        setBlinkingIds([]);
        clearActivePanels();
      }, 5000);
      return () => clearTimeout(t);
    }

    const panel = panels.find((p: any) => p.upperId === targetSubIds[0] || p.lowerId === targetSubIds[0]);
    if (!panel) return;

    let cancelled = false;
    sequenceRunning.current = true;

    const run = async () => {
      setBlinkingIds(targetSubIds);

      let closestPanelId = targetSubIds[0];
      let minDistance = Infinity;

      const START_X = 11;
      const ROW_Z: [number, number] = [-4.9, 4.9];

      for (const pid of targetSubIds) {
        let pRow, pCol;
        if (pid <= 24) {
          pRow = 1;
          pCol = Math.floor((pid - 1) / 2);
        } else if (pid === 47) {
          pRow = 0;
          pCol = 0;
        } else {
          pRow = 0;
          const startId = pid % 2 === 1 ? pid : pid - 1;
          pCol = (47 - startId) / 2;
        }

        const pExactX = START_X + pCol * colWidth;
        const pExactZ = ROW_Z[pRow];

        const dist = Math.hypot(camera.position.x - pExactX, camera.position.z - pExactZ);
        if (dist < minDistance) {
          minDistance = dist;
          closestPanelId = pid;
        }
      }

      const panelId = closestPanelId;
      let row, col, floor;
      if (panelId <= 24) {
        row = 1;
        col = Math.floor((panelId - 1) / 2);
        floor = panelId % 2 === 1 ? 1 : 0;
      } else if (panelId === 47) {
        row = 0;
        col = 0;
        floor = 1;
      } else {
        row = 0;
        const startId = panelId % 2 === 1 ? panelId : panelId - 1;
        col = (47 - startId) / 2;
        floor = panelId % 2 === 1 ? 1 : 0;
      }

      const exactX = START_X + col * colWidth;
      const exactY = floor * floorHeight + (panelId === 47 ? floorHeight : (floorHeight / 2));
      const exactZ = ROW_Z[row];

      const distance = 8.0;
      const camZ = row === 0 ? exactZ + distance : exactZ - distance;

      for (let cycle = 0; cycle < 2; cycle++) {
        if (cancelled) break;

        await wait(1000);
        if (cancelled) break;

        const arrows = computeArrows(camera.position.clone(), [exactX, 0, ROW_Z[row]]);
        for (let i = 0; i < 3; i++) {
          if (cancelled) break;
          setPathArrows(arrows);
          await wait(350);
          setPathArrows([]);
          await wait(250);
        }
        if (cancelled) break;
        setPathArrows(arrows);
        await wait(300);

        await walkToPanel({ x: exactX, y: exactY, z: exactZ, camZ });
        if (cancelled) break;

        setPathArrows([]);
        await goHome();
        if (cancelled) break;
      }

      if (!cancelled) {
        await wait(5000);
        if (!cancelled) {
          setBlinkingIds([]);
          await clearActivePanels();
          sequenceRunning.current = false;
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      sequenceRunning.current = false;
      setMoving(false);
      setBlinkingIds([]);
      setPathArrows([]);
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(camera);
      if (controlsRef.current) {
        gsap.killTweensOf(controlsRef.current.target);
        controlsRef.current.update();
      }
    };
  }, [targetSubIds.join(',')]);

  return (
    <>
      <color attach="background" args={['#0a0a0a']} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={INITIAL_TARGET}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        enablePan={false}
        enableRotate={false}
        enableZoom={isOperationActive}
      />

      {pathArrows.map((arrow, idx) => (
        <PathArrow
          key={idx}
          index={idx}
          position={arrow.position}
          target={arrow.target}
        />
      ))}

      <GLBGrid blinkingIds={blinkingIds} />
      <StaticEnvironment />

      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
        <Text
          position={[0, 4.5, -8]}
          fontSize={0.6}
          color="#10b981"
          maxWidth={10}
          textAlign="center"
        >
          ELECTRICAL PANEL MONITORING
        </Text>
        <Text
          position={[0, 3.8, -8]}
          fontSize={0.2}
          color="#475569"
          fillOpacity={0.8}
        >
          {moving ? "Walking to panel..." : "Use Arrow Keys to walk • Click panel to inspect • Click open door to close"}
        </Text>
      </Float>
    </>
  );
});

export default Scene;
