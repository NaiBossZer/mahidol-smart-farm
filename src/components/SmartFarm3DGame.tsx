import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CharacterCameraProps {
  // Pass ref ของ Object3D / Group ตัวละครมาที่นี่
  characterRef: React.RefObject<THREE.Object3D | null>;
}

export const CharacterCameraController: React.FC<CharacterCameraProps> = ({ characterRef }) => {
  const { camera } = useThree();
  
  // Mode: '1st' = บุคคลที่ 1, '3rd' = บุคคลที่ 3
  const [cameraMode, setCameraMode] = useState<'1st' | '3rd'>('3rd');

  // ตำแหน่งเป้าหมายและเวกเตอร์คำนวณ
  const currentPosition = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());

  // สลับมุมมองด้วยการกดปุ่ม 'V' หรือ 'C'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'v' || e.key === 'V' || e.key === 'c' || e.key === 'C') {
        setCameraMode((prev) => (prev === '3rd' ? '1st' : '3rd'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useFrame((_, delta) => {
    if (!characterRef.current) return;

    const character = characterRef.current;
    
    // ดึงตำแหน่งของตัวละคร
    const charPos = new THREE.Vector3();
    character.getWorldPosition(charPos);

    // ดึงทิศทางที่ตัวละครหันไป
    const charQuaternion = new THREE.Quaternion();
    character.getWorldQuaternion(charQuaternion);

    let targetCamPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3();

    if (cameraMode === '3rd') {
      // --- มุมมองบุคคลที่ 3 (3rd Person) ---
      // ระยะห่างกล้องด้านหลัง (-Z) และความสูง (+Y)
      const offset = new THREE.Vector3(0, 3.5, -5.5);
      offset.applyQuaternion(charQuaternion);
      
      targetCamPos.copy(charPos).add(offset);
      
      // มองไปที่ระดับอก/หัวของตัวละคร
      targetLookAt.copy(charPos).add(new THREE.Vector3(0, 1.6, 0));
    } else {
      // --- มุมมองบุคคลที่ 1 (1st Person) ---
      // กล้องอยู่ที่ระดับสายตาของตัวละคร
      const eyeOffset = new THREE.Vector3(0, 1.7, 0.2);
      eyeOffset.applyQuaternion(charQuaternion);
      
      targetCamPos.copy(charPos).add(eyeOffset);

      // จุดมองไปข้างหน้าตัวละคร
      const forward = new THREE.Vector3(0, 1.7, 5);
      forward.applyQuaternion(charQuaternion);
      targetLookAt.copy(charPos).add(forward);
    }

    // ใช้ Lerp เพื่อให้กล้องเคลื่อนที่อย่างนุ่มนวล (Smooth Transition)
    const lerpFactor = 1 - Math.exp(-10 * delta); // ค่าประมาณความลื่นไหล
    currentPosition.current.lerp(targetCamPos, lerpFactor);
    currentLookAt.current.lerp(targetLookAt, lerpFactor);

    // อัปเดตกล้อง
    camera.position.copy(currentPosition.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};
