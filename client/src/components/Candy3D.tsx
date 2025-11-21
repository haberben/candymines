import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { CandyType } from '@/types/game';
import { CANDY_COLORS } from '@/types/icons';
import vertexShader from '@/shaders/vertex.glsl?raw';
import fragmentShader from '@/shaders/fragment.glsl?raw';

interface Candy3DProps {
  type: CandyType;
  position: { x: number; y: number };
  isSelected?: boolean;
  isMatched?: boolean;
  onAnimationComplete?: () => void;
  size?: number;
}

const COLOR_MAP: Record<CandyType, string> = {
  play: CANDY_COLORS.fuchsia,
  shop: CANDY_COLORS.warmGold,
  wallet: CANDY_COLORS.cyan,
  quests: CANDY_COLORS.purple,
  profile: CANDY_COLORS.fuchsia,
  settings: CANDY_COLORS.warmGold,
  cash_out: CANDY_COLORS.cyan,
  sound: CANDY_COLORS.purple,
};

export default function Candy3D({
  type,
  position,
  isSelected = false,
  isMatched = false,
  onAnimationComplete,
  size = 60,
}: Candy3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    mesh: THREE.Mesh;
    animationId: number | null;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0.5, 2.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const keyLight = new THREE.DirectionalLight(0xfff8e5, 1.2);
    keyLight.position.set(1, 2, 1);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93e0ff, 0.4);
    fillLight.position.set(-1, 0.5, 0.8);
    scene.add(fillLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    // Create geometry based on type
    const geometry = createGeometry(type);

    // Shader material
    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uBaseColor: { value: new THREE.Color(COLOR_MAP[type]) },
        uLightDir: { value: keyLight.position.clone().normalize() },
        uViewDir: { value: camera.position.clone() },
        uRimPower: { value: 2.5 },
        uSpecular: { value: 1.0 },
        uTime: { value: 0 },
      },
    });

    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    mesh.scale.setScalar(0.5);
    scene.add(mesh);

    // Idle animation
    gsap.to(mesh.rotation, {
      y: Math.PI * 2,
      duration: 8,
      repeat: -1,
      ease: 'none',
    });

    gsap.to(mesh.position, {
      y: 0.05,
      duration: 1,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    // Animation loop
    const clock = new THREE.Clock();
    let animationId: number | null = null;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      shaderMaterial.uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = {
      scene,
      camera,
      renderer,
      mesh,
      animationId,
    };

    return () => {
      if (animationId !== null) cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      shaderMaterial.dispose();
      renderer.dispose();
    };
  }, [type, size]);

  // Selection effect
  useEffect(() => {
    if (!sceneRef.current) return;

    const { mesh } = sceneRef.current;
    
    if (isSelected) {
      gsap.to(mesh.scale, {
        x: 0.6,
        y: 0.6,
        z: 0.6,
        duration: 0.2,
        ease: 'back.out(2)',
      });
    } else {
      gsap.to(mesh.scale, {
        x: 0.5,
        y: 0.5,
        z: 0.5,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
  }, [isSelected]);

  // Match animation
  useEffect(() => {
    if (!sceneRef.current || !isMatched) return;

    const { mesh } = sceneRef.current;
    
    gsap.to(mesh.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.3,
      ease: 'back.in(2)',
      onComplete: () => {
        onAnimationComplete?.();
      },
    });

    gsap.to(mesh.rotation, {
      z: Math.PI * 2,
      duration: 0.3,
      ease: 'power2.in',
    });
  }, [isMatched, onAnimationComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        width: size,
        height: size,
        position: 'absolute',
        left: position.x,
        top: position.y,
        pointerEvents: 'none',
      }}
    />
  );
}

function createGeometry(type: CandyType): THREE.BufferGeometry {
  switch (type) {
    case 'play': {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0.6);
      shape.lineTo(-0.5, -0.3);
      shape.lineTo(0.5, -0.3);
      return new THREE.ExtrudeGeometry(shape, {
        depth: 0.25,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.08,
        bevelSegments: 4,
      });
    }

    case 'shop':
    case 'wallet':
      return new THREE.BoxGeometry(0.8, 0.8, 0.4, 2, 2, 2);

    case 'quests':
      return new THREE.CylinderGeometry(0.12, 0.12, 1, 12);

    case 'profile':
      return new THREE.SphereGeometry(0.5, 16, 16);

    case 'settings':
      return new THREE.TorusGeometry(0.4, 0.18, 12, 24);

    case 'cash_out':
      return new THREE.CylinderGeometry(0.5, 0.5, 0.2, 24);

    case 'sound':
      return new THREE.ConeGeometry(0.4, 0.8, 16);

    default:
      return new THREE.BoxGeometry(0.8, 0.8, 0.4);
  }
}
