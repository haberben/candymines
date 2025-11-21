import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import GameBoard from '@/components/GameBoard';
import { GameState, GameStats, LEVELS } from '@/types/game';
import { Play, Trophy, RotateCcw, Home, Star } from 'lucide-react';

export default function Game() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [finalStats, setFinalStats] = useState<GameStats | null>(null);

  const handleStartGame = (level: number) => {
    setCurrentLevel(level);
    setGameState('playing');
    setFinalStats(null);
  };

  const handleVictory = (stats: GameStats) => {
    setFinalStats(stats);
    setGameState('victory');
  };

  const handleGameOver = (stats: GameStats) => {
    setFinalStats(stats);
    setGameState('gameover');
  };

  const handleRetry = () => {
    setGameState('playing');
    setFinalStats(null);
  };

  const handleBackToMenu = () => {
    setGameState('menu');
    setFinalStats(null);
  };

  const calculateStars = (score: number, targetScore: number): number => {
    const percentage = (score / targetScore) * 100;
    if (percentage >= 150) return 3;
    if (percentage >= 120) return 2;
    if (percentage >= 100) return 1;
    return 0;
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#35105A] to-[#5B0EC8] p-8 flex items-center justify-center">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4">
              🍬 Candy Match 3D
            </h1>
            <p className="text-white/80 text-xl">
              Eşleştir, patla ve yüksek skor yap!
            </p>
          </div>

          <Card className="p-8 bg-white/10 backdrop-blur-sm border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Seviye Seç
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {LEVELS.map((level) => (
                <Button
                  key={level.level}
                  onClick={() => handleStartGame(level.level)}
                  className="h-24 flex flex-col gap-2 bg-gradient-to-br from-[#FF5DA2] to-[#7C4DFF] hover:opacity-90 text-white border-2 border-white/30"
                  size="lg"
                >
                  <div className="text-3xl font-bold">{level.level}</div>
                  <div className="text-xs opacity-80">
                    Hedef: {level.targetScore.toLocaleString()}
                  </div>
                </Button>
              ))}
            </div>

            <div className="mt-8 p-6 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">📖 Nasıl Oynanır?</h3>
              <ul className="text-white/80 space-y-2">
                <li>✨ Yan yana 3 veya daha fazla aynı candy'yi eşleştir</li>
                <li>🔄 Candy'leri yer değiştirmek için tıkla</li>
                <li>🎯 Hedef skora ulaşmak için hamle limitin içinde kal</li>
                <li>⚡ Zincirleme eşleşmelerle combo yap ve daha fazla puan kazan</li>
                <li>🌟 3 yıldız için hedefin %150'sine ulaş!</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const levelConfig = LEVELS[currentLevel - 1];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#35105A] to-[#5B0EC8] p-8">
        <div className="container max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-white">
              Seviye {currentLevel}
            </h1>
            <Button
              onClick={handleBackToMenu}
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Home className="w-4 h-4 mr-2" />
              Ana Menü
            </Button>
          </div>

          <GameBoard
            levelConfig={levelConfig}
            onVictory={handleVictory}
            onGameOver={handleGameOver}
          />
        </div>
      </div>
    );
  }

  if (gameState === 'victory' && finalStats) {
    const stars = calculateStars(finalStats.score, finalStats.targetScore);
    const nextLevel = currentLevel < LEVELS.length ? currentLevel + 1 : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#35105A] to-[#5B0EC8] p-8 flex items-center justify-center">
        <Card className="p-12 bg-white/10 backdrop-blur-sm border-white/20 max-w-lg w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-5xl font-bold text-white mb-4">Tebrikler!</h2>
            <p className="text-white/80 text-xl mb-8">
              Seviye {currentLevel} tamamlandı!
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <Star
                  key={i}
                  className={`w-16 h-16 ${
                    i <= stars
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-white/70 text-sm">Skor</div>
                <div className="text-white text-3xl font-bold">
                  {finalStats.score.toLocaleString()}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-white/70 text-sm">Hamle</div>
                <div className="text-white text-3xl font-bold">
                  {finalStats.moves} / {finalStats.maxMoves}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              {nextLevel && (
                <Button
                  onClick={() => handleStartGame(nextLevel)}
                  className="w-full bg-gradient-to-r from-[#FF5DA2] to-[#7C4DFF] hover:opacity-90 text-white font-bold"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Sonraki Seviye ({nextLevel})
                </Button>
              )}
              
              <Button
                onClick={handleRetry}
                variant="outline"
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Tekrar Oyna
              </Button>
              
              <Button
                onClick={handleBackToMenu}
                variant="outline"
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Home className="w-4 h-4 mr-2" />
                Ana Menü
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'gameover' && finalStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#35105A] to-[#5B0EC8] p-8 flex items-center justify-center">
        <Card className="p-12 bg-white/10 backdrop-blur-sm border-white/20 max-w-lg w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-5xl font-bold text-white mb-4">Oyun Bitti</h2>
            <p className="text-white/80 text-xl mb-8">
              Hedefe ulaşamadın
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-white/70 text-sm">Skor</div>
                <div className="text-white text-3xl font-bold">
                  {finalStats.score.toLocaleString()}
                </div>
                <div className="text-white/50 text-xs mt-1">
                  Hedef: {finalStats.targetScore.toLocaleString()}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-white/70 text-sm">Hamle</div>
                <div className="text-white text-3xl font-bold">
                  {finalStats.moves} / {finalStats.maxMoves}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleRetry}
                className="w-full bg-gradient-to-r from-[#FF5DA2] to-[#7C4DFF] hover:opacity-90 text-white font-bold"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Tekrar Dene
              </Button>
              
              <Button
                onClick={handleBackToMenu}
                variant="outline"
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Home className="w-4 h-4 mr-2" />
                Ana Menü
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
