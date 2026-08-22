import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';

// --------------------------------------------------
// 1. Camera Controller Component (ระบบกล้องติดตามตัวละคร)
// --------------------------------------------------
interface CharacterCameraProps {
  characterRef: React.RefObject<THREE.Object3D | null>;
  cameraMode: '1st' | '3rd';
}

function CharacterCameraController({ characterRef, cameraMode }: CharacterCameraProps) {
  const { camera } = useThree();
  const currentPosition = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!characterRef.current) return;

    const character = characterRef.current;
    
    // ดึงตำแหน่งและทิศทางมุมหมุนของตัวละคร
    const charPos = new THREE.Vector3();
    character.getWorldPosition(charPos);

    const charQuaternion = new THREE.Quaternion();
    character.getWorldQuaternion(charQuaternion);

    const targetCamPos = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3();

    if (cameraMode === '3rd') {
      // --- มุมมองบุคคลที่ 3 (3rd Person) ---
      // ระยะห่างกล้องด้านหลัง (-Z) และความสูง (+Y)
      const offset = new THREE.Vector3(0, 3.5, -6);
      offset.applyQuaternion(charQuaternion);
      
      targetCamPos.copy(charPos).add(offset);
      
      // มองไปที่ระดับอก/สายตาของตัวละคร
      targetLookAt.copy(charPos).add(new THREE.Vector3(0, 1.5, 0));
    } else {
      // --- มุมมองบุคคลที่ 1 (1st Person) ---
      // ตำแหน่งสายตาตัวละคร
      const eyeOffset = new THREE.Vector3(0, 1.7, 0.2);
      eyeOffset.applyQuaternion(charQuaternion);
      
      targetCamPos.copy(charPos).add(eyeOffset);

      // ทิศทางมองไปข้างหน้า
      const forward = new THREE.Vector3(0, 1.7, 5);
      forward.applyQuaternion(charQuaternion);
      targetLookAt.copy(charPos).add(forward);
    }

    // Lerp เพื่อความนุ่มนวลของการเคลื่อนที่กล้อง (Smooth Follow)
    const lerpFactor = 1 - Math.exp(-10 * delta);
    currentPosition.current.lerp(targetCamPos, lerpFactor);
    currentLookAt.current.lerp(targetLookAt, lerpFactor);

    camera.position.copy(currentPosition.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

// --------------------------------------------------
// 2. Character Component (ตัวละครและการเคลื่อนที่)
// --------------------------------------------------
interface CharacterProps {
  playerRef: React.RefObject<THREE.Group | null>;
}

function Character({ playerRef }: CharacterProps) {
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!playerRef.current) return;

    const moveSpeed = 5 * delta;
    const rotateSpeed = 3 * delta;

    // การหมุนตัวละคร (A / D หรือ ArrowLeft / ArrowRight)
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) {
      playerRef.current.rotation.y += rotateSpeed;
    }
    if (keys.current['KeyD'] || keys.current['ArrowRight']) {
      playerRef.current.rotation.y -= rotateSpeed;
    }

    // การ เดินหน้า / ถอยหลัง (W / S หรือ ArrowUp / ArrowDown)
    if (keys.current['KeyW'] || keys.current['ArrowUp']) {
      playerRef.current.translateZ(moveSpeed);
    }
    if (keys.current['KeyS'] || keys.current['ArrowDown']) {
      playerRef.current.translateZ(-moveSpeed);
    }
  });

  return (
    <group ref={playerRef} position={[0, 0, 0]}>
      {/* ตัวละครจำลอง (Player Mesh) */}
      {/* ลำตัว */}
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.4, 1, 4, 8]} />
        <meshStandardMaterial color="#1E88E5" />
      </mesh>
      {/* ส่วนหัว/ดวงตาเพื่อระบุทิศทางหันหน้า */}
      <mesh position={[0, 1.6, 0.2]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.2]} />
        <meshStandardMaterial color="#212121" />
      </mesh>
    </group>
  );
}

// --------------------------------------------------
// 3. Main SmartFarm3DGame Component (Named Export)
// --------------------------------------------------
export function SmartFarm3DGame() {
  const playerRef = useRef<THREE.Group>(null);
  const [cameraMode, setCameraMode] = useState<'1st' | '3rd'>('3rd');

  // สลับมุมมองด้วยปุ่ม V หรือ C
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'v' || e.key === 'V' || e.key === 'c' || e.key === 'C') {
        setCameraMode((prev) => (prev === '3rd' ? '1st' : '3rd'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* UI สลับมุมมองและปุ่มควบคุม */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        padding: '12px 16px',
        borderRadius: '8px',
        fontFamily: 'sans-serif',
        fontSize: '14px'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
          มุมมองปัจจุบัน: <span style={{ color: '#4CAF50' }}>{cameraMode === '3rd' ? 'บุคคลที่ 3 (3rd Person)' : 'บุคคลที่ 1 (1st Person)'}</span>
        </p>
        <button
          onClick={() => setCameraMode(prev => prev === '3rd' ? '1st' : '3rd')}
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            marginBottom: '8px'
          }}
        >
          สลับมุมมอง (กด V หรือ C)
        </button>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          <div>• <b>W / S หรือ ⬆️ / ⬇️</b> : เดินหน้า / ถอยหลัง</div>
          <div>• <b>A / D หรือ ⬅️ / ➡️</b> : หมุนซ้าย / หมุนขวา</div>
        </div>
      </div>

      {/* ฉาก 3D Canvas */}
      <Canvas shadows camera={{ position: [0, 5, -10], fov: 60 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[20, 30, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* พื้นแปลงเกษตร Smart Farm จำลอง */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#388E3C" />
        </mesh>

        {/* ตัวละคร */}
        <Character playerRef={playerRef} />

        {/* คอนโทรลเลอร์ควบคุมกล้องตามตัวละคร */}
        <CharacterCameraController characterRef={playerRef} cameraMode={cameraMode} />
      </Canvas>
    </div>
  );
}

// รองรับทั้ง Default Export เผื่อจุดอื่นเรียกใช้
export default SmartFarm3DGame;
