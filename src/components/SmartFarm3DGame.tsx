import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import { Maximize2, Minimize2, Eye, User } from 'lucide-react';

// --------------------------------------------------
// 1. Camera Controller (ระบบกล้องติดตามตัวละคร)
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
    const charPos = new THREE.Vector3();
    character.getWorldPosition(charPos);

    const charQuaternion = new THREE.Quaternion();
    character.getWorldQuaternion(charQuaternion);

    const targetCamPos = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3();

    if (cameraMode === '3rd') {
      const offset = new THREE.Vector3(0, 3.2, -5.5);
      offset.applyQuaternion(charQuaternion);
      targetCamPos.copy(charPos).add(offset);
      targetLookAt.copy(charPos).add(new THREE.Vector3(0, 1.5, 0));
    } else {
      const eyeOffset = new THREE.Vector3(0, 1.6, 0.2);
      eyeOffset.applyQuaternion(charQuaternion);
      targetCamPos.copy(charPos).add(eyeOffset);

      const forward = new THREE.Vector3(0, 1.6, 5);
      forward.applyQuaternion(charQuaternion);
      targetLookAt.copy(charPos).add(forward);
    }

    const lerpFactor = 1 - Math.exp(-10 * delta);
    currentPosition.current.lerp(targetCamPos, lerpFactor);
    currentLookAt.current.lerp(targetLookAt, lerpFactor);

    camera.position.copy(currentPosition.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

// --------------------------------------------------
// 2. Character & Movement (ตัวละครผู้เล่น)
// --------------------------------------------------
interface CharacterProps {
  playerRef: React.RefObject<THREE.Group | null>;
  activeControls: { forward: boolean; backward: boolean; left: boolean; right: boolean };
}

function Character({ playerRef, activeControls }: CharacterProps) {
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

    const moveSpeed = 6 * delta;
    const rotateSpeed = 3 * delta;

    const isLeft = keys.current['KeyA'] || keys.current['ArrowLeft'] || activeControls.left;
    const isRight = keys.current['KeyD'] || keys.current['ArrowRight'] || activeControls.right;
    const isForward = keys.current['KeyW'] || keys.current['ArrowUp'] || activeControls.forward;
    const isBackward = keys.current['KeyS'] || keys.current['ArrowDown'] || activeControls.backward;

    if (isLeft) playerRef.current.rotation.y += rotateSpeed;
    if (isRight) playerRef.current.rotation.y -= rotateSpeed;
    if (isForward) playerRef.current.translateZ(moveSpeed);
    if (isBackward) playerRef.current.translateZ(-moveSpeed);
  });

  return (
    <group ref={playerRef} position={[0, 0, 8]}>
      {/* ลำตัวละคร */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.35, 0.9, 4, 8]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      {/* แว่นตา/ตาเพื่อบอกทิศทางหันหน้า */}
      <mesh position={[0, 1.45, 0.2]} castShadow>
        <boxGeometry args={[0.3, 0.15, 0.15]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}

// --------------------------------------------------
// 3. Greenhouse Structure (แบบจำลองโรงเรือนสมาร์ทฟาร์ม)
// --------------------------------------------------
function FarmGreenhouse() {
  return (
    <group position={[0, 0, 0]}>
      {/* โครงสร้างพื้นโรงเรือน */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[12, 0.1, 20]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      {/* แปลงปลูกผักไฮโดรโปนิกส์ */}
      {[-3, 0, 3].map((x, i) => (
        <group key={i} position={[x, 0.5, 0]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[1.8, 0.8, 16]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          {/* ต้นผักสีเขียว */}
          {[-6, -4, -2, 0, 2, 4, 6].map((z, j) => (
            <mesh key={j} position={[0, 0.6, z]} castShadow>
              <sphereGeometry args={[0.35, 8, 8]} />
              <meshStandardMaterial color="#22c55e" />
            </mesh>
          ))}
        </group>
      ))}

      {/* โครงเหล็กหลังคาโรงเรือน */}
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[12.2, 0.2, 20.2]} />
        <meshStandardMaterial color="#e2e8f0" wireframe />
      </mesh>
    </group>
  );
}

// --------------------------------------------------
// 4. Main SmartFarm3DGame Component
// --------------------------------------------------
export function SmartFarm3DGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<THREE.Group>(null);
  
  const [cameraMode, setCameraMode] = useState<'1st' | '3rd'>('3rd');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchControls, setTouchControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch((err) => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : '550px',
        backgroundColor: '#020617',
        borderRadius: isFullscreen ? '0' : '16px',
        overflow: 'hidden',
      }}
    >
      {/* แถบปุ่มควบคุมมุมขวาบน */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 20,
          display: 'flex',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setCameraMode((prev) => (prev === '3rd' ? '1st' : '3rd'))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '8px 14px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            backdropFilter: 'blur(6px)',
          }}
        >
          {cameraMode === '3rd' ? <User size={16} /> : <Eye size={16} />}
          <span>{cameraMode === '3rd' ? 'มุมมองบุคคลที่ 3' : 'มุมมองบุคคลที่ 1'}</span>
        </button>

        <button
          onClick={toggleFullscreen}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '8px 12px',
            borderRadius: '20px',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
          }}
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* ปุ่มควบคุม Touch Screen บนมือถือ */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 46px)',
          gridTemplateRows: 'repeat(2, 46px)',
          gap: '6px',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          padding: '8px',
          borderRadius: '16px',
          backdropFilter: 'blur(6px)',
        }}
      >
        <div />
        <button
          onMouseDown={() => setTouchControls((p) => ({ ...p, forward: true }))}
          onMouseUp={() => setTouchControls((p) => ({ ...p, forward: false }))}
          onTouchStart={() => setTouchControls((p) => ({ ...p, forward: true }))}
          onTouchEnd={() => setTouchControls((p) => ({ ...p, forward: false }))}
          style={touchButtonStyle}
        >
          ▲
        </button>
        <div />
        <button
          onMouseDown={() => setTouchControls((p) => ({ ...p, left: true }))}
          onMouseUp={() => setTouchControls((p) => ({ ...p, left: false }))}
          onTouchStart={() => setTouchControls((p) => ({ ...p, left: true }))}
          onTouchEnd={() => setTouchControls((p) => ({ ...p, left: false }))}
          style={touchButtonStyle}
        >
          ◄
        </button>
        <button
          onMouseDown={() => setTouchControls((p) => ({ ...p, backward: true }))}
          onMouseUp={() => setTouchControls((p) => ({ ...p, backward: false }))}
          onTouchStart={() => setTouchControls((p) => ({ ...p, backward: true }))}
          onTouchEnd={() => setTouchControls((p) => ({ ...p, backward: false }))}
          style={touchButtonStyle}
        >
          ▼
        </button>
        <button
          onMouseDown={() => setTouchControls((p) => ({ ...p, right: true }))}
          onMouseUp={() => setTouchControls((p) => ({ ...p, right: false }))}
          onTouchStart={() => setTouchControls((p) => ({ ...p, right: true }))}
          onTouchEnd={() => setTouchControls((p) => ({ ...p, right: false }))}
          style={touchButtonStyle}
        >
          ►
        </button>
      </div>

      {/* 3D Canvas Scene */}
      <Canvas shadows camera={{ position: [0, 5, -10], fov: 60 }}>
        <Sky sunPosition={[100, 40, 100]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[20, 30, 10]} intensity={1.2} castShadow />

        {/* พื้นหญ้ารอบโรงเรือน */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>

        {/* โรงเรือนสมาร์ทฟาร์ม */}
        <FarmGreenhouse />

        {/* ตัวละครผู้เล่น */}
        <Character playerRef={playerRef} activeControls={touchControls} />

        {/* กล้องตามตัวละคร */}
        <CharacterCameraController characterRef={playerRef} cameraMode={cameraMode} />
      </Canvas>
    </div>
  );
}

const touchButtonStyle: React.CSSProperties = {
  width: '46px',
  height: '46px',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  cursor: 'pointer',
  userSelect: 'none',
};

export default SmartFarm3DGame;
