import { useEffect, useRef, useState } from 'react';
import { IconScene } from '@/lib/IconScene';
import { IconType, ICON_CONFIGS } from '@/types/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Grid3x3, Loader2 } from 'lucide-react';

export default function IconViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<IconScene | null>(null);
  const [currentIcon, setCurrentIcon] = useState<IconType>('play');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize scene
    sceneRef.current = new IconScene(canvasRef.current, 512);
    
    // Create initial icon
    const config = ICON_CONFIGS.find(c => c.name === currentIcon);
    if (config) {
      sceneRef.current.createIcon(config.name, config.color);
      sceneRef.current.animate();
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    const config = ICON_CONFIGS.find(c => c.name === currentIcon);
    if (config) {
      sceneRef.current.createIcon(config.name, config.color);
    }
  }, [currentIcon]);

  const downloadIcon = async (size: number) => {
    if (!sceneRef.current) return;

    setIsRendering(true);
    
    try {
      // Set render size
      sceneRef.current.setSize(size);
      
      // Wait a frame for render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Render to image
      const dataUrl = await sceneRef.current.renderToImage();
      
      // Download
      const link = document.createElement('a');
      link.download = `icon_${currentIcon}_${size}.png`;
      link.href = dataUrl;
      link.click();
      
      // Reset to preview size
      sceneRef.current.setSize(512);
    } finally {
      setIsRendering(false);
    }
  };

  const renderAllIcons = async () => {
    if (!sceneRef.current) return;

    setIsRendering(true);
    setRenderProgress(0);

    try {
      const size = 2048;
      sceneRef.current.setSize(size);

      for (let i = 0; i < ICON_CONFIGS.length; i++) {
        const config = ICON_CONFIGS[i];
        
        // Create icon
        sceneRef.current.createIcon(config.name, config.color);
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Render to image
        const dataUrl = await sceneRef.current.renderToImage();
        
        // Download
        const link = document.createElement('a');
        link.download = `icon_${config.name}_${size}.png`;
        link.href = dataUrl;
        link.click();
        
        // Update progress
        setRenderProgress(((i + 1) / ICON_CONFIGS.length) * 100);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Reset to first icon and preview size
      sceneRef.current.setSize(512);
      const firstConfig = ICON_CONFIGS[0];
      sceneRef.current.createIcon(firstConfig.name, firstConfig.color);
      setCurrentIcon(firstConfig.name);
    } finally {
      setIsRendering(false);
      setRenderProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#35105A] to-[#5B0EC8] p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">
            Candy 3D Icons
          </h1>
          <p className="text-white/80 text-lg">
            Parlak, lüks ve profesyonel 3D ikonlar - Candy Crush estetiği
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Canvas Preview */}
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="aspect-square bg-black/20 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => downloadIcon(512)}
                disabled={isRendering}
                variant="outline"
                className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                512px
              </Button>
              <Button
                onClick={() => downloadIcon(1024)}
                disabled={isRendering}
                variant="outline"
                className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                1024px
              </Button>
              <Button
                onClick={() => downloadIcon(2048)}
                disabled={isRendering}
                variant="outline"
                className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                2048px
              </Button>
            </div>
          </Card>

          {/* Icon Selection */}
          <div className="space-y-4">
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">İkon Seç</h2>
              <div className="grid grid-cols-2 gap-3">
                {ICON_CONFIGS.map((config) => (
                  <Button
                    key={config.name}
                    onClick={() => setCurrentIcon(config.name)}
                    variant={currentIcon === config.name ? 'default' : 'outline'}
                    className={
                      currentIcon === config.name
                        ? 'bg-white text-black hover:bg-white/90'
                        : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                    }
                  >
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: config.color }}
                    />
                    {config.label}
                  </Button>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Toplu İşlemler</h2>
              <Button
                onClick={renderAllIcons}
                disabled={isRendering}
                className="w-full bg-gradient-to-r from-[#FF5DA2] to-[#7C4DFF] hover:opacity-90 text-white font-bold"
                size="lg"
              >
                {isRendering ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Render Ediliyor... {Math.round(renderProgress)}%
                  </>
                ) : (
                  <>
                    <Grid3x3 className="w-5 h-5 mr-2" />
                    Tüm İkonları Render Et (2048px)
                  </>
                )}
              </Button>
              
              {isRendering && (
                <div className="mt-4">
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#FF5DA2] to-[#7C4DFF] h-full transition-all duration-300"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <p className="text-white/70 text-sm mt-3">
                8 ikonu 2048x2048 çözünürlükte PNG formatında indirir
              </p>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <h2 className="text-xl font-bold text-white mb-3">Özellikler</h2>
              <ul className="text-white/80 space-y-2 text-sm">
                <li>✨ GLSL shader'lar ile dither efekti</li>
                <li>🎨 Toon shading ve rim lighting</li>
                <li>💫 GSAP ile smooth animasyonlar</li>
                <li>🌟 UnrealBloomPass post-processing</li>
                <li>🎯 Candy Crush renk paleti</li>
                <li>📦 PNG export (512px - 2048px)</li>
              </ul>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            Three.js • GLSL Shaders • GSAP • UnrealBloomPass
          </p>
        </div>
      </div>
    </div>
  );
}
