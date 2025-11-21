import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';
import vertexShader from '../shaders/vertex.glsl?raw';
import fragmentShader from '../shaders/fragment.glsl?raw';
import { IconType } from '../types/icons';

export class IconScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private iconMesh: THREE.Mesh | null = null;
  private shaderMaterial: THREE.ShaderMaterial | null = null;
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.DirectionalLight;
  private animationId: number | null = null;
  private clock: THREE.Clock;

  constructor(canvas: HTMLCanvasElement, size: number = 512) {
    this.clock = new THREE.Clock();
    
    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(size, size);
    this.renderer.setClearColor(0x000000, 0);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    this.camera.position.set(0, 1.2, 4);
    this.camera.lookAt(0, 0, 0);

    // Lights
    this.keyLight = new THREE.DirectionalLight(0xfff8e5, 1.4);
    this.keyLight.position.set(2, 3, 2);
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0x93e0ff, 0.6);
    this.fillLight.position.set(-2, 1, 1.5);
    this.scene.add(this.fillLight);

    // Ambient light for base illumination
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambient);

    // Post-processing
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size, size),
      0.4,  // strength
      0.6,  // radius
      0.85  // threshold
    );
    this.composer.addPass(bloomPass);
  }

  createIcon(type: IconType, color: string): void {
    // Remove existing icon
    if (this.iconMesh) {
      this.scene.remove(this.iconMesh);
      this.iconMesh.geometry.dispose();
      if (this.iconMesh.material instanceof THREE.Material) {
        this.iconMesh.material.dispose();
      }
    }

    // Create geometry based on icon type
    const geometry = this.createGeometry(type);

    // Create shader material
    this.shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uBaseColor: { value: new THREE.Color(color) },
        uLightDir: { value: this.keyLight.position.clone().normalize() },
        uViewDir: { value: this.camera.position.clone() },
        uRimPower: { value: 2.5 },
        uSpecular: { value: 1.2 },
        uTime: { value: 0 },
      },
    });

    this.iconMesh = new THREE.Mesh(geometry, this.shaderMaterial);
    this.scene.add(this.iconMesh);

    // Add platform
    this.addPlatform();

    // Start animations
    this.startAnimations();
  }

  private createGeometry(type: IconType): THREE.BufferGeometry {
    const roundedBoxGeometry = (width: number, height: number, depth: number, radius: number) => {
      const shape = new THREE.Shape();
      const hw = width / 2 - radius;
      const hh = height / 2 - radius;
      
      shape.moveTo(-hw, -hh + radius);
      shape.lineTo(-hw, hh - radius);
      shape.quadraticCurveTo(-hw, hh, -hw + radius, hh);
      shape.lineTo(hw - radius, hh);
      shape.quadraticCurveTo(hw, hh, hw, hh - radius);
      shape.lineTo(hw, -hh + radius);
      shape.quadraticCurveTo(hw, -hh, hw - radius, -hh);
      shape.lineTo(-hw + radius, -hh);
      shape.quadraticCurveTo(-hw, -hh, -hw, -hh + radius);
      
      const extrudeSettings = {
        depth: depth,
        bevelEnabled: true,
        bevelThickness: radius,
        bevelSize: radius,
        bevelSegments: 8,
      };
      
      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    };

    switch (type) {
      case 'play': {
        // Triangle play button
        const shape = new THREE.Shape();
        shape.moveTo(0, 0.8);
        shape.lineTo(-0.7, -0.4);
        shape.lineTo(0.7, -0.4);
        shape.lineTo(0, 0.8);
        
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: 0.3,
          bevelEnabled: true,
          bevelThickness: 0.1,
          bevelSize: 0.1,
          bevelSegments: 5,
        });
        geometry.center();
        return geometry;
      }

      case 'shop': {
        // Shopping bag
        const geometry = roundedBoxGeometry(1.2, 1.4, 0.6, 0.15);
        geometry.translate(0, -0.1, 0);
        return geometry;
      }

      case 'wallet': {
        // Wallet/card shape
        const geometry = roundedBoxGeometry(1.4, 1.0, 0.3, 0.12);
        return geometry;
      }

      case 'quests': {
        // Map/scroll shape
        const geometry = new THREE.CylinderGeometry(0.15, 0.15, 1.4, 16);
        geometry.rotateZ(Math.PI / 2);
        return geometry;
      }

      case 'profile': {
        // Avatar circle
        const geometry = new THREE.SphereGeometry(0.7, 32, 32);
        return geometry;
      }

      case 'settings': {
        // Gear/cog
        const geometry = new THREE.TorusGeometry(0.6, 0.25, 16, 32);
        return geometry;
      }

      case 'cash_out': {
        // Coin
        const geometry = new THREE.CylinderGeometry(0.7, 0.7, 0.25, 32);
        return geometry;
      }

      case 'sound': {
        // Speaker cone
        const geometry = new THREE.ConeGeometry(0.6, 1.2, 32);
        geometry.rotateZ(-Math.PI / 2);
        return geometry;
      }

      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }

  private addPlatform(): void {
    const platformGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.25, 64);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x2b0b5e,
      metalness: 0.3,
      roughness: 0.6,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -1;
    this.scene.add(platform);
  }

  private startAnimations(): void {
    if (!this.iconMesh) return;

    // Idle bob animation
    gsap.to(this.iconMesh.position, {
      y: 0.15,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    // Slow rotation
    gsap.to(this.iconMesh.rotation, {
      y: Math.PI * 2,
      duration: 20,
      repeat: -1,
      ease: 'none',
    });
  }

  animate(): void {
    const render = () => {
      this.animationId = requestAnimationFrame(render);
      
      if (this.shaderMaterial) {
        this.shaderMaterial.uniforms.uTime.value = this.clock.getElapsedTime();
      }
      
      this.composer.render();
    };
    render();
  }

  stopAnimation(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  async renderToImage(): Promise<string> {
    // Render one frame
    this.composer.render();
    
    // Get image data
    return this.renderer.domElement.toDataURL('image/png');
  }

  setSize(size: number): void {
    this.renderer.setSize(size, size);
    this.composer.setSize(size, size);
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    this.stopAnimation();
    
    if (this.iconMesh) {
      this.scene.remove(this.iconMesh);
      this.iconMesh.geometry.dispose();
      if (this.iconMesh.material instanceof THREE.Material) {
        this.iconMesh.material.dispose();
      }
    }
    
    this.renderer.dispose();
    this.composer.dispose();
  }
}
