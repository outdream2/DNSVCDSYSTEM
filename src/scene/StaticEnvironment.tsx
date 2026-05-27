/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Environment, ContactShadows, Text, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { GLB_VERSION } from '../data/panelData';

RectAreaLightUniformsLib.init();

// props 없음 → React.memo가 절대 re-render하지 않음 (마운트 이후)
const StaticEnvironment = React.memo(function StaticEnvironment() {
  const { scene: floorModel } = useGLTF(`/floor.glb?v=${GLB_VERSION}`);
  const { scene: ceilingModel } = useGLTF(`/ceiling.glb?v=${GLB_VERSION}`);

  const { floorScale, ceilingScale, floorPos, ceilingPos } = useMemo(() => {
    const fBox = new THREE.Box3().setFromObject(floorModel);
    const fSize = fBox.getSize(new THREE.Vector3());
    const cBox = new THREE.Box3().setFromObject(ceilingModel);
    const cSize = cBox.getSize(new THREE.Vector3());

    const targetWidth = 50;
    const targetDepth = 10.4;

    const fScale = [targetWidth / fSize.x, 1, targetDepth / fSize.z] as [number, number, number];
    const cScale = [targetWidth / cSize.x, 1, targetDepth / cSize.z] as [number, number, number];

    const fCenter = fBox.getCenter(new THREE.Vector3());
    const cCenter = cBox.getCenter(new THREE.Vector3());

    const fPos = [
      10 - fCenter.x * fScale[0],
      -fBox.min.y,
      0 - fCenter.z * fScale[2]
    ] as [number, number, number];

    const cPos = [
      10 - cCenter.x * cScale[0],
      6 - cBox.min.y,
      0 - cCenter.z * cScale[2]
    ] as [number, number, number];

    return { floorScale: fScale, ceilingScale: cScale, floorPos: fPos, ceilingPos: cPos };
  }, [floorModel, ceilingModel]);

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[10, 15, 0]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[10, 5.8, 0]} intensity={1.5} color="#e2e8f0" />
      <pointLight position={[30, 5.8, 0]} intensity={1.5} color="#e2e8f0" />
      <spotLight position={[0, 8, 0]} angle={0.6} penumbra={1} intensity={3} castShadow />

      <rectAreaLight width={20} height={1} position={[10, 5.8, 0]} rotation={[-Math.PI / 2, 0, 0]} intensity={6} color="#f8fafc" />
      <rectAreaLight width={20} height={1} position={[30, 5.8, 0]} rotation={[-Math.PI / 2, 0, 0]} intensity={6} color="#f8fafc" />

      <Environment files="/textures/empty_warehouse_01_1k.hdr" background blur={0.8} />

      <ContactShadows position={[0, 0.01, 0]} opacity={0.7} scale={80} blur={2.5} far={10} resolution={1024} color="#000000" />

      <EffectComposer>
        <Bloom luminanceThreshold={1.2} mipmapBlur intensity={0.8} radius={0.3} />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>

      <primitive object={floorModel} scale={floorScale} position={floorPos} receiveShadow />

      <mesh position={[10, 3, -5.2]} receiveShadow>
        <planeGeometry args={[50, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[10, 3, 5.2]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[50, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[-15, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10.4, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[35, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10.4, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />

        <group position={[0, 0.5, 0.05]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[10.0, 4.0, 0.2]} />
            <meshStandardMaterial color="#020617" roughness={0.7} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <planeGeometry args={[9.8, 3.8]} />
            <meshStandardMaterial color="#0f172a" emissive="#0ea5e9" emissiveIntensity={0.3} roughness={0.1} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.101]}>
            <planeGeometry args={[9.6, 3.6]} />
            <meshStandardMaterial color="#020617" roughness={0.4} metalness={0.5} />
          </mesh>
          <Text
            position={[0, 0.4, 0.15]}
            fontSize={2.5}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.15}
            fontStyle="italic"
            fontWeight="bold"
          >
            KOEN
            <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={1.5} roughness={0.2} metalness={0.8} />
          </Text>
          <Text
            position={[0, -1.1, 0.15]}
            fontSize={0.7}
            color="#475569"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.2}
            font="/fonts/Pretendard-Bold.woff"
          >
            한국남동발전
            <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
          </Text>
        </group>
      </mesh>

      <primitive object={ceilingModel} scale={ceilingScale} position={ceilingPos} receiveShadow />

      {[-5.1, 0.3, 5.7, 10.5, 15.3, 20.1, 24.9, 30.3].map(x => (
        <React.Fragment key={`light-${x}`}>
          <mesh position={[x, 5.95, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 0.6]} />
            <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[x, 5.95, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 0.6]} />
            <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.8} />
          </mesh>
        </React.Fragment>
      ))}

      <Text position={[0, 6.5, -14.9]} fontSize={1.2} color="#64748b" anchorX="center">
        MAIN ELECTRICAL ROOM
      </Text>
    </>
  );
});

export default StaticEnvironment;
