/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import GLBGrid from './GLBGrid';
import StaticEnvironment from './StaticEnvironment';
import PathArrow from './PathArrow';

const INITIAL_TARGET = new THREE.Vector3(40, 2.8, 0);

export type SceneHandle = {
  cancelAnimation: () => void;
  startAnimation: (ids: number[]) => void;
};

const SceneComponent = React.forwardRef<SceneHandle, {
  clearActivePanels: () => void;
  onCameraUpdate: (pos: { x: number; z: number; rotation: number }) => void;
  panels: any[];
  isOperationActiveRef: React.MutableRefObject<boolean>;
}>(function Scene({ clearActivePanels, onCameraUpdate, panels, isOperationActiveRef }, ref) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const cancelledRef = useRef(false);

  const animationTriggerRef = useRef<number[]>([]);
  const [animationTick, setAnimationTick] = useState(0);

  const colWidth = 2.0;
  const floorHeight = 2.5;
  const START_X = 10;
  const ROW_Z: [number, number] = [-4.9, 4.9];

  const [moving, setMoving] = useState(false);
  const [pathArrows, setPathArrows] = useState<{ position: [number, number, number], target: [number, number, number] }[]>([]);

  // blinkingIds를 React state 대신 ref로 관리 → GLBGrid/GLBClone 재렌더링 완전 차단
  const blinkingSetRef = useRef<Set<number>>(new Set());

  const lastUpdatePos = useRef(new THREE.Vector3());
  const lastUpdateRot = useRef(0);
  const sequenceRunning = useRef(false);

  useImperativeHandle(ref, () => ({
    cancelAnimation: () => {
      cancelledRef.current = true;
      sequenceRunning.current = false;
      setMoving(false);
      blinkingSetRef.current = new Set();
      setPathArrows([]);
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(camera);
      if (controlsRef.current) {
        gsap.killTweensOf(controlsRef.current.target);
        camera.position.set(-6, 4.0, 0);
        controlsRef.current.target.set(40, 2.8, 0);
        controlsRef.current.update();
      }
    },
    startAnimation: (ids: number[]) => {
      animationTriggerRef.current = ids;
      setAnimationTick(prev => prev + 1);
    },
  }), []);

  const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

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

  useFrame((state, delta) => {
    if (controlsRef.current && controlsRef.current.enableZoom !== isOperationActiveRef.current) {
      controlsRef.current.enableZoom = isOperationActiveRef.current;
    }

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

    if (moving || sequenceRunning.current || !isOperationActiveRef.current) return;

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

  // ── 애니메이션 시퀀스: startAnimation()이 호출될 때만 실행 ──
  useEffect(() => {
    const ids = animationTriggerRef.current;
    if (ids.length === 0) return;

    cancelledRef.current = false;

    if (ids.length > 1) {
      blinkingSetRef.current = new Set(ids);
      const t = setTimeout(() => {
        if (!cancelledRef.current) {
          blinkingSetRef.current = new Set();
          clearActivePanels();
        }
      }, 5000);
      return () => {
        clearTimeout(t);
        cancelledRef.current = true;
      };
    }

    const panel = panels.find((p: any) => p.upperId === ids[0] || p.lowerId === ids[0]);
    if (!panel) return;

    sequenceRunning.current = true;

    const run = async () => {
      blinkingSetRef.current = new Set(ids);

      let closestPanelId = ids[0];
      let minDistance = Infinity;
      const S_X = 11;
      const R_Z: [number, number] = [-4.9, 4.9];

      for (const pid of ids) {
        let pRow, pCol;
        if (pid <= 24) { pRow = 1; pCol = Math.floor((pid - 1) / 2); }
        else if (pid === 47) { pRow = 0; pCol = 0; }
        else { pRow = 0; const s = pid % 2 === 1 ? pid : pid - 1; pCol = (47 - s) / 2; }
        const dist = Math.hypot(camera.position.x - (S_X + pCol * colWidth), camera.position.z - R_Z[pRow]);
        if (dist < minDistance) { minDistance = dist; closestPanelId = pid; }
      }

      const panelId = closestPanelId;
      let row, col, floor;
      if (panelId <= 24) { row = 1; col = Math.floor((panelId - 1) / 2); floor = panelId % 2 === 1 ? 1 : 0; }
      else if (panelId === 47) { row = 0; col = 0; floor = 1; }
      else { row = 0; const s = panelId % 2 === 1 ? panelId : panelId - 1; col = (47 - s) / 2; floor = panelId % 2 === 1 ? 1 : 0; }

      const exactX = 11 + col * colWidth;
      const exactY = floor * floorHeight + (panelId === 47 ? floorHeight : floorHeight / 2);
      const exactZ = R_Z[row];
      const camZ = row === 0 ? exactZ + 8.0 : exactZ - 8.0;

      for (let cycle = 0; cycle < 2; cycle++) {
        if (cancelledRef.current) break;
        await wait(1000);
        if (cancelledRef.current) break;

        const arrows = computeArrows(camera.position.clone(), [exactX, 0, R_Z[row]]);
        for (let i = 0; i < 3; i++) {
          if (cancelledRef.current) break;
          setPathArrows(arrows); await wait(350);
          setPathArrows([]); await wait(250);
        }
        if (cancelledRef.current) break;
        setPathArrows(arrows);
        await wait(300);
        await walkToPanel({ x: exactX, y: exactY, z: exactZ, camZ });
        if (cancelledRef.current) break;
        setPathArrows([]);
        await goHome();
        if (cancelledRef.current) break;
      }

      if (!cancelledRef.current) {
        await wait(5000);
        if (!cancelledRef.current) {
          blinkingSetRef.current = new Set();
          await clearActivePanels();
          sequenceRunning.current = false;
        }
      }
    };

    run();

    return () => {
      cancelledRef.current = true;
      sequenceRunning.current = false;
      setMoving(false);
      blinkingSetRef.current = new Set();
      setPathArrows([]);
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(camera);
      if (controlsRef.current) {
        gsap.killTweensOf(controlsRef.current.target);
        controlsRef.current.update();
      }
    };
  }, [animationTick]);

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
        enableZoom={false}
      />

      {pathArrows.map((arrow, idx) => (
        <PathArrow key={idx} index={idx} position={arrow.position} target={arrow.target} />
      ))}

      <GLBGrid blinkingIdsRef={blinkingSetRef} />
      <StaticEnvironment />

      <React.Suspense fallback={null}>
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
          <Text position={[0, 4.5, -8]} fontSize={0.6} color="#10b981" maxWidth={10} textAlign="center">
            ELECTRICAL PANEL MONITORING
          </Text>
          <Text position={[0, 3.8, -8]} fontSize={0.2} color="#475569" fillOpacity={0.8}>
            {moving ? "Walking to panel..." : "Use Arrow Keys to walk"}
          </Text>
        </Float>
      </React.Suspense>
    </>
  );
});

const Scene = React.memo(SceneComponent);
export default Scene;
