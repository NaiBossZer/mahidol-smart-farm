import React, { useRef, useState, useEffect, Suspense, Component, ErrorInfo, ReactNode, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';
import { Maximize2, Minimize2, Eye, User } from 'lucide-react';

// --------------------------------------------------
// Error Boundary
// --------------------------------------------------
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ThreeErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('3D Loading Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

// --------------------------------------------------
// 1. Smart Farm Model
// --------------------------------------------------
function SmartFarmModel() {
  // ระบุ Path เต็มร่วมกับ import.meta.env.BASE_URL เพื่อป้องกัน Path หลุดบน Vercel
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}smart-farm3d.glb`);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <Center position={[0, 0, 0]} top>
      <primitive object={clonedScene} />
    </Center>
  );
}

// --------------------------------------------------
// 2. Camera Controller
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
      const offset = new THREE.Vector3(0, 3, -5);
      offset.applyQuaternion(charQuaternion);
      targetCamPos.copy(charPos).add(offset);
      targetLookAt.copy(charPos).add(new THREE.Vector3(0, 1.2, 0));
    } else {
      const eyeOffset = new THREE.Vector3(0, 1.5, 0.2);
      eyeOffset.applyQuaternion(charQuaternion);
      targetCamPos.copy(charPos).add(eyeOffset);

      const forward = new THREE.Vector3(0, 1.5, 5);
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
// 3. Character & Movement
// --------------------------------------------------
interface CharacterProps {
  playerRef: React.RefObject<THREE.Group | null>;
  activeControls: { forward: boolean; backward: boolean; left: boolean; right: boolean };
}

function CharacterModel() {
  // 1. ระบุ Base URL ชัดเจน
  // 2. ใช้ useMemo และ scene.clone() ป้องกัน Conflict ในระบบ Render
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}player.glb`);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return <primitive object={clonedScene} scale={[1, 1, 1]} position={[0, 0, 0]} />;
}

function FallbackPlayer() {
  return (
    <mesh position={[0, 1, 0]}>
      <capsuleGeometry args={[0.4, 1, 4, 8]} />
      <meshStandardMaterial color="#3b82f6" />
    </mesh>
  );
}

function Character({ playerRef, activeControls }: CharacterProps) {
  const keys = useRef<{ [key: string]: boolean }>({});
  const animGroupRef = useRef<THREE.Group>(null);

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

  useFrame((state, delta) => {
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

    const isMoving = isForward || isBackward || isLeft || isRight;

    if (animGroupRef.current) {
      if (isMoving) {
        animGroupRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 12)) * 0.12;
        animGroupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 12) * 0.06;
        animGroupRef.current.rotation.x = 0.05;
      } else {
        animGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
        animGroupRef.current.rotation.z = THREE.MathUtils.lerp(animGroupRef.current.rotation.z, 0, 0.1);
        animGroupRef.current.rotation.x = THREE.MathUtils.lerp(animGroupRef.current.rotation.x, 0, 0.1);
      }
    }
  });

  return (
    <group ref={playerRef} position={[0, 0, 8]}>
      <group ref={animGroupRef}>
        <ThreeErrorBoundary fallback={<FallbackPlayer />}>
          <Suspense fallback={<FallbackPlayer />}>
            <CharacterModel />
          </Suspense>
        </ThreeErrorBoundary>
      </group>
    </group>
  );
}

// --------------------------------------------------
// 4. Main Component
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
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
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
        height: isFullscreen ? '100vh' : '520px',
        backgroundColor: '#0f172a',
        borderRadius: isFullscreen ? '0' : '16px',
        overflow: 'hidden',
      }}
    >
      {/* UI ด้านบนขวา */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 20, display: 'flex', gap: '8px' }}>
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
            fontSize: '12px',
            backdropFilter: 'blur(6px)',
          }}
        >
          {cameraMode === '3rd' ? <User size={15} /> : <Eye size={15} />}
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
            padding: '8px 10px',
            borderRadius: '20px',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
          }}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* D-Pad ปุ่มกดมือถือ */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 44px)',
          gridTemplateRows: 'repeat(2, 44px)',
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
        >▲</button>
        <div />
        <button
          onMouseDown={() => setTouchControls((p) => ({ ...p, left: true }))}
          onMouseUp={() => setTouchControls((p) => ({ ...p, left: false }))}
          onTouchStart={() => setTouchControls((p) => ({ ...p, left: true }))}
          onTouchEnd={() => setTouchControls((p) => ({ ...p, left: false }))}
          style={touchButtonStyle}
        >◄</button>
        <button
          onMouseDown={() => setTouchControls((p) => ({ ...p, backward: true }))}
          onMouseUp={() => setTouchControls((p) => ({ ...p, backward: false }))}
          onTouchStart={() => setTouchControls((p) => ({ ...p, backward: true }))}
          onTouchEnd={() => setTouchControls((p) => ({ ...p, backward: false }))}
          style={touchButtonStyle}
        >▼</button>
        <button
          onMouseDown={() => setTouchControls((p) => ({ ...p, right: true }))}
          onMouseUp={() => setTouchControls((p) => ({ ...p, right: false }))}
          onTouchStart={() => setTouchControls((p) => ({ ...p, right: true }))}
          onTouchEnd={() => setTouchControls((p) => ({ ...p, right: false }))}
          style={touchButtonStyle}
        >►</button>
      </div>

      {/* ฉาก 3D Canvas */}
      <Canvas shadows camera={{ position: [0, 5, -10], fov: 60 }}>
        <Sky sunPosition={[100, 30, 100]} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[20, 30, 10]} intensity={2.0} castShadow />

        {/* พื้นหญ้ารองรับโมเดล */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#166534" />
        </mesh>

        <ThreeErrorBoundary>
          <Suspense fallback={null}>
            <SmartFarmModel />
          </Suspense>
        </ThreeErrorBoundary>

        <Character playerRef={playerRef} activeControls={touchControls} />
        <CharacterCameraController characterRef={playerRef} cameraMode={cameraMode} />
      </Canvas>
    </div>
  );
}

const touchButtonStyle: React.CSSProperties = {
  width: '44px',
  height: '44px',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  cursor: 'pointer',
  userSelect: 'none',
};

// สั่ง Preload ไฟล์ 3D ล่วงหน้า
useGLTF.preload(`${import.meta.env.BASE_URL}smart-farm3d.glb`);
useGLTF.preload(`${import.meta.env.BASE_URL}player.glb`);

export default SmartFarm3DGame;
