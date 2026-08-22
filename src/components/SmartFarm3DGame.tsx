import React, { useRef, useState, useEffect, Suspense, Component, ErrorInfo, ReactNode, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Sky, Center, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Maximize2, Minimize2, Eye, User } from 'lucide-react';

const PLAYER_MODEL_PATH = '/player.glb';
const FARM_MODEL_PATH = '/smart-farm3d.glb';

// ฟังก์ชันสร้าง GLTFLoader ที่ฝัง DRACO Decoder มาให้เรียบร้อย
const createCustomGLTFLoader = (loader: THREE.Loader) => {
  if (loader instanceof GLTFLoader) {
    const dracoLoader = new DRACOLoader();
    // ใช้ CDN Decoder ของ Google สำหรับการ Decode Draco Mesh
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
  }
};

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
    console.error('❌ [3D Loader Error]:', error, errorInfo);
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
  const gltf = useLoader(GLTFLoader, FARM_MODEL_PATH, createCustomGLTFLoader);
  const clonedScene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [gltf]);

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

interface CharacterModelProps {
  isMoving: boolean;
}

function CharacterModel({ isMoving }: CharacterModelProps) {
  const gltf = useLoader(GLTFLoader, PLAYER_MODEL_PATH, createCustomGLTFLoader);
  const { actions, names } = useAnimations(gltf.animations, gltf.scene);

  const adjustedScene = useMemo(() => {
    const clone = gltf.scene.clone(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const targetScale = 1.8 / maxDim;
      clone.scale.setScalar(targetScale);
    }

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return clone;
  }, [gltf]);

  // ระบบเล่น Animation ตามสถานะการเดิน
  useEffect(() => {
    if (!names || names.length === 0) return;

    // หาแอนิเมชันท่าเดินหรือวิ่ง
    const walkAnim = names.find((n) => /walk|run|move/i.test(n)) || names[1] || names[0];
    // หาแอนิเมชันท่ายืนนิ่ง
    const idleAnim = names.find((n) => /idle|stand|pose/i.test(n)) || names[0];

    const targetActionName = isMoving ? walkAnim : idleAnim;
    const currentAction = actions[targetActionName];

    if (currentAction) {
      currentAction.reset().fadeIn(0.2).play();
    }

    return () => {
      if (currentAction) currentAction.fadeOut(0.2);
    };
  }, [isMoving, actions, names]);

  return (
    <Center top>
      <primitive object={adjustedScene} />
    </Center>
  );
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
  const [isMoving, setIsMoving] = useState(false);

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

    const moving = isForward || isBackward || isLeft || isRight;
    if (moving !== isMoving) {
      setIsMoving(moving);
    }
  });

  return (
    <group ref={playerRef} position={[0, 0, 8]}>
      <ThreeErrorBoundary fallback={<FallbackPlayer />}>
        <Suspense fallback={<FallbackPlayer />}>
          <CharacterModel isMoving={isMoving} />
        </Suspense>
      </ThreeErrorBoundary>
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

export default SmartFarm3DGame;
