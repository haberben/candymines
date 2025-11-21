import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

interface ParticleEffectProps {
  x: number;
  y: number;
  type: 'star' | 'coin';
  onComplete?: () => void;
}

export default function ParticleEffect({ x, y, type, onComplete }: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Particle[] = [];
    const particleCount = type === 'coin' ? 30 : 15;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = type === 'coin' ? 3 + Math.random() * 4 : 2 + Math.random() * 3;
      
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'coin' ? 2 : 1),
        life: 1,
        size: type === 'coin' ? 8 + Math.random() * 6 : 4 + Math.random() * 4,
        color: type === 'coin' 
          ? `hsl(${45 + Math.random() * 15}, 100%, ${50 + Math.random() * 20}%)`
          : `hsl(${45 + Math.random() * 30}, 100%, ${60 + Math.random() * 20}%)`,
      });
    }

    let animationId: number;
    const gravity = 0.15;
    const friction = 0.98;

    function animate() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Update physics
        p.vy += gravity;
        p.vx *= friction;
        p.vy *= friction;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        if (p.life <= 0) return;

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        // shadowBlur kaldırıldı - performans optimizasyonu

        if (type === 'star') {
          // Draw star
          drawStar(ctx, p.x, p.y, 5, p.size, p.size / 2);
        } else {
          // Draw coin (circle)
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // Continue animation if particles are alive
      if (particles.some(p => p.life > 0)) {
        animationId = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    }

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [x, y, type, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={800}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }

  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}
