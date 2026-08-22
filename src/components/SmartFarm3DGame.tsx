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
      const offset = new THREE.Vector3(0, 3.5, -6);
      offset.applyQuaternion(charQuaternion);
      targetCamPos.copy(charPos).add(offset);
      targetLookAt.copy(charPos).add(new THREE.Vector3(0, 1.5, 0));
    } else {
      const eyeOffset = new THREE.Vector3(0, 1.7, 0.2);
      eyeOffset.applyQuaternion(charQuaternion);
      targetCamPos.copy(charPos).add(eyeOffset);

      const forward = new THREE.Vector3(0, 1.7, 5);
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
// 2. Character & Movement (ตัวละครและการบังคับ)
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

    const moveSpeed = 5 * delta;
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
    <group ref={playerRef} position={[0, 0, 0]}>
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.4, 1, 4, 8]} />
        <meshStandardMaterial color="#1E88E5" />
      </mesh>
      <mesh position={[0, 1.6, 0.2]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.2]} />
        <meshStandardMaterial color="#212121" />
      </mesh>
    </group>
  );
}

// --------------------------------------------------
// 3. Main SmartFarm3DGame Component
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

  // สลับ Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
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
        height: isFullscreen ? '100vh' : '500px',
        backgroundColor: '#0f172a',
        borderRadius: isFullscreen ? '0' : '16px',
        overflow: 'hidden',
      }}
    >
      {/* --- แถบปุ่มกดควบคุมด้านบน (UI Overlays) --- */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 10,
          display: 'flex',
          gap: '8px',
        }}
      >
        {/* ปุ่มสลับโหมดบุคคลที่ 1 / 3 */}
        <button
          onClick={() => setCameraMode((prev) => (prev === '3rd' ? '1st' : '3rd'))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            backdropFilter: 'blur(4px)',
          }}
        >
          {cameraMode === '3rd' ? <User size={16} /> : <Eye size={16} />}
          <span>{cameraMode === '3rd' ? 'มุมมองบุคคลที่ 3' : 'มุมมองบุคคลที่ 1'}</span>
        </button>

        {/* ปุ่ม Fullscreen */}
        <button
          onClick={toggleFullscreen}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* --- ปุ่มควบคุมบนหน้าจอมือถือ (Touch D-Pad) --- */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 10,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 48px)',
          gridTemplateRows: 'repeat(2, 48px)',
          gap: '6px',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          padding: '8px',
          borderRadius: '16px',
          backdropFilter: 'blur(4px)',
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

      {/* --- ฉาก 3D Canvas --- */}
      <Canvas shadows camera={{ position: [0, 5, -10], fov: 60 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[20, 30, 10]} intensity={1.2} castShadow />

        {/* พื้นดินแปลงเกษตร */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#388E3C" />
        </mesh>

        {/* ตัวละครผู้เล่น */}
        <Character playerRef={playerRef} activeControls={touchControls} />

        {/* กล้องตามตัวละคร */}
        <CharacterCameraController characterRef={playerRef} cameraMode={cameraMode} />
      </Canvas>
    </div>
  );
}

const touchButtonStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
