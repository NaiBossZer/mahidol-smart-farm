import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, UserCheck } from "lucide-react";

// 1. โหลดโมเดลฉากแปลงเกษตร 3D
function FarmScene() {
  const { scene } = useGLTF("/smart-farm3d.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={1} />;
}

// 2. ตัวละครจำลองพร้อมระบบบังคับเดิน
function Player({ keys }: { keys: { [key: string]: boolean } }) {
  const playerRef = useRef<THREE.Group>(null);
  const speed = 0.15;

  useFrame(() => {
    if (!playerRef.current) return;

    let moveX = 0;
    let moveZ = 0;

    if (keys["ArrowUp"] || keys["w"] || keys["W"]) moveZ -= 1;
    if (keys["ArrowDown"] || keys["s"] || keys["S"]) moveZ += 1;
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) moveX -= 1;
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) moveX += 1;

    if (moveX !== 0 || moveZ !== 0) {
      const moveVector = new THREE.Vector3(moveX, 0, moveZ).normalize();
      playerRef.current.position.x += moveVector.x * speed;
      playerRef.current.position.z += moveVector.z * speed;

      const angle = Math.atan2(moveVector.x, moveVector.z);
      playerRef.current.rotation.y = angle;
    }
  });

  return (
    <group ref={playerRef} position={[0, 0, 3]}>
      {/* หัวอวตาร */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#F5B800" />
      </mesh>
      {/* ตัวอวตาร */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.8, 16]} />
        <meshStandardMaterial color="#1B6B3C" />
      </mesh>
    </group>
  );
}

// 3. Component หลัก
export function SmartFarm3DGame() {
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setKeys((prev) => ({ ...prev, [e.key]: true }));
    const handleKeyUp = (e: KeyboardEvent) => setKeys((prev) => ({ ...prev, [e.key]: false }));

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleTouchStart = (key: string) => setKeys((prev) => ({ ...prev, [key]: true }));
  const handleTouchEnd = (key: string) => setKeys((prev) => ({ ...prev, [key]: false }));

  return (
    <section className="py-12 px-4 max-w-6xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 p-5 sm:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              🕹️ เดินสำรวจแปลงเกษตร 3D
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              กดปุ่ม W, A, S, D บนคีย์บอร์ด หรือใช้ปุ่มลูกศรบนหน้าจอเพื่อบังคับตัวละคร
            </p>
          </div>
          <div className="text-xs font-semibold bg-emerald-100 text-[#1B6B3C] px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" /> Mode: Walk Around
          </div>
        </div>

        <div className="relative w-full aspect-video min-h-[400px] bg-slate-900 rounded-2xl overflow-hidden shadow-inner">
          <Canvas camera={{ position: [0, 8, 12], fov: 50 }}>
            <ambientLight intensity={1.2} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <FarmScene />
            <Player keys={keys} />
            <OrbitControls target={[0, 0, 0]} maxPolarAngle={Math.PI / 2.1} />
          </Canvas>

          {/* D-Pad ปุ่มกดสัมผัสสำหรับมือถือ */}
          <div className="absolute bottom-4 right-4 z-20 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 flex flex-col items-center gap-2">
            <button
              type="button"
              onMouseDown={() => handleTouchStart("ArrowUp")}
              onMouseUp={() => handleTouchEnd("ArrowUp")}
              onTouchStart={() => handleTouchStart("ArrowUp")}
              onTouchEnd={() => handleTouchEnd("ArrowUp")}
              className="w-10 h-10 bg-white/10 active:bg-[#1B6B3C] text-white rounded-xl flex items-center justify-center select-none"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onMouseDown={() => handleTouchStart("ArrowLeft")}
                onMouseUp={() => handleTouchEnd("ArrowLeft")}
                onTouchStart={() => handleTouchStart("ArrowLeft")}
                onTouchEnd={() => handleTouchEnd("ArrowLeft")}
                className="w-10 h-10 bg-white/10 active:bg-[#1B6B3C] text-white rounded-xl flex items-center justify-center select-none"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onMouseDown={() => handleTouchStart("ArrowDown")}
                onMouseUp={() => handleTouchEnd("ArrowDown")}
                onTouchStart={() => handleTouchStart("ArrowDown")}
                onTouchEnd={() => handleTouchEnd("ArrowDown")}
                className="w-10 h-10 bg-white/10 active:bg-[#1B6B3C] text-white rounded-xl flex items-center justify-center select-none"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                type="button"
                onMouseDown={() => handleTouchStart("ArrowRight")}
                onMouseUp={() => handleTouchEnd("ArrowRight")}
                onTouchStart={() => handleTouchStart("ArrowRight")}
                onTouchEnd={() => handleTouchEnd("ArrowRight")}
                className="w-10 h-10 bg-white/10 active:bg-[#1B6B3C] text-white rounded-xl flex items-center justify-center select-none"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
