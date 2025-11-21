import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  emoji: string;
}

export default function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const fpsLimit = 30; // 30 FPS ile sınırla

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    if (!ctx) return;

    // Canvas boyutunu ayarla
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Parçacık emojileri
    const emojis = ['🍬', '🍭', '🍫', '🍩', '🧁', '🎀', '⭐', '✨', '💎', '🌟'];
    const colors = [
      'rgba(168, 85, 247, 0.6)',
      'rgba(236, 72, 153, 0.6)',
      'rgba(251, 191, 36, 0.6)',
      'rgba(52, 211, 153, 0.6)',
    ];

    // Parçacıkları oluştur
    const createParticles = () => {
      const particles: Particle[] = [];
      const particleCount = 15; // Performans için azaltıldı

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 20 + 10,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
        });
      }

      return particles;
    };

    particlesRef.current = createParticles();

    // Animasyon loop (FPS throttled)
    const animate = (currentTime: number) => {
      // FPS limitleme
      const elapsed = currentTime - lastFrameTimeRef.current;
      if (elapsed < 1000 / fpsLimit) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTimeRef.current = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Pozisyon güncelle
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.rotation += particle.rotationSpeed;

        // Ekran dışına çıkarsa karşı taraftan getir
        if (particle.x < -50) particle.x = canvas.width + 50;
        if (particle.x > canvas.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = canvas.height + 50;
        if (particle.y > canvas.height + 50) particle.y = -50;

        // Çiz (glow efekti kaldırıldı - performans için)
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        
        // Emoji çiz
        ctx.font = `${particle.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(particle.emoji, 0, 0);
        
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
}
