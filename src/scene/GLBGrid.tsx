/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import GLBClone from './GLBClone';
import { PANEL_DATA, GLB_VERSION, getDesc, getUnitId, getGlbKey } from '../data/panelData';
import { Placement } from '../data/types';

const COL_WIDTH = 2.0;
const FLOOR_HEIGHT = 2.5;
const START_X = 11;
const ROW_Z: [number, number] = [-4.9, 4.9];

// blinkingIdsRef: React.MutableRefObject<Set<number>> — 안정적인 ref 객체
// → prop이 절대 바뀌지 않으므로 GLBGrid는 마운트 이후 재렌더링 없음
const GLBGrid = React.memo(function GLBGrid({ blinkingIdsRef }: { blinkingIdsRef: React.MutableRefObject<Set<number>> }) {
  const { scene: sceneA } = useGLTF(`/A.glb?v=${GLB_VERSION}`);
  const { scene: sceneB } = useGLTF(`/B.glb?v=${GLB_VERSION}`);
  const { scene: sceneC } = useGLTF(`/C.glb?v=${GLB_VERSION}`);
  const { scene: sceneD } = useGLTF(`/D.glb?v=${GLB_VERSION}`);
  const { scene: sceneE } = useGLTF(`/E.glb?v=${GLB_VERSION}`);
  const { scene: sceneF } = useGLTF(`/F.glb?v=${GLB_VERSION}`);
  const { scene: sceneG } = useGLTF(`/G.glb?v=${GLB_VERSION}`);

  const sceneMap: Record<string, THREE.Group> = useMemo(
    () => ({ A: sceneA, B: sceneB, C: sceneC, D: sceneD, E: sceneE, F: sceneF, G: sceneG }),
    [sceneA, sceneB, sceneC, sceneD, sceneE, sceneF, sceneG]
  );

  const boxMap = useMemo(() => ({
    A: new THREE.Box3().setFromObject(sceneA),
    B: new THREE.Box3().setFromObject(sceneB),
    C: new THREE.Box3().setFromObject(sceneC),
    D: new THREE.Box3().setFromObject(sceneD),
    E: new THREE.Box3().setFromObject(sceneE),
    F: new THREE.Box3().setFromObject(sceneF),
    G: new THREE.Box3().setFromObject(sceneG),
  }), [sceneA, sceneB, sceneC, sceneD, sceneE, sceneF, sceneG]);

  const placements = useMemo<Placement[]>(() => {
    const items: Placement[] = [];

    for (let col = 0; col < 12; col++) {
      for (let floor = 0; floor < 2; floor++) {
        const isUpper = floor === 1;
        const panelId = col * 2 + (isUpper ? 1 : 2);
        items.push({
          key: `r1-c${col}-f${floor}`,
          position: [START_X + col * COL_WIDTH, floor * FLOOR_HEIGHT, ROW_Z[1]],
          rotation: [0, Math.PI, 0],
          panelId,
          desc: getDesc(panelId),
          unitId: getUnitId(panelId),
        });
      }
    }

    for (let col = 0; col < 12; col++) {
      if (col === 0) {
        items.push({
          key: `r0-c0-merged`,
          position: [START_X + col * COL_WIDTH, 0, ROW_Z[0]],
          rotation: [0, 0, 0],
          panelId: 47,
          desc: getDesc(47),
          unitId: getUnitId(47),
          doubleHeight: true,
        });
        continue;
      }

      for (let floor = 0; floor < 2; floor++) {
        const isUpper = floor === 1;
        const panelId = (47 - (col * 2)) + (isUpper ? 0 : 1);
        items.push({
          key: `r0-c${col}-f${floor}`,
          position: [START_X + col * COL_WIDTH, floor * FLOOR_HEIGHT, ROW_Z[0]],
          rotation: [0, 0, 0],
          panelId,
          desc: getDesc(panelId),
          unitId: getUnitId(panelId),
        });
      }
    }
    return items;
  }, []);

  return (
    <>
      {placements.map(({ key, position, rotation, panelId, desc, unitId, doubleHeight }) => {
        const glbKey = getGlbKey(panelId);
        return (
          <GLBClone
            key={key}
            baseScene={sceneMap[glbKey]}
            position={position}
            rotation={rotation}
            glbBox={boxMap[glbKey as keyof typeof boxMap]}
            panelId={panelId}
            desc={desc}
            unitId={unitId}
            blinkingIdsRef={blinkingIdsRef}
            doubleHeight={doubleHeight}
          />
        );
      })}
    </>
  );
});

useGLTF.preload(`/A.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/B.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/C.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/D.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/E.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/F.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/G.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/floor.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/ceiling.glb?v=${GLB_VERSION}`);

export default GLBGrid;
