import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SlotCandyCell from '@/components/SlotCandyCell';
import {
  createSlotGrid,
  revealCell,
  calculateTotalMultiplier,
  calculateBaseWinTotal,
  calculateCurrentWin,
  getRevealedCount,
  calculateWinProbability,
} from '@/lib/slotLogic';
import {
  GameState,
  GamePhase,
  BET_AMOUNTS,
  DEFAULT_BALANCE,
  GRID_SIZES,
  GameHistory,
} from '@/types/slotGame';
import { TrendingUp, Bomb, Trophy, RotateCcw, Sparkles, Volume2, VolumeX, Music, Award, ShoppingBag, Shield, Users, Package } from 'lucide-react';
import { COIN_IMAGE, BACKGROUND_IMAGE } from '@/types/slotGame';
import { soundEffects } from '@/lib/soundEffects';
import { backgroundMusic } from '@/lib/backgroundMusic';
import ParticleEffect from '@/components/ParticleEffect';
import DailyBonusModal from '@/components/DailyBonusModal';
import LoginStreakModal from '@/components/LoginStreakModal';
import { checkAndUpdateLoginStreak } from '@/lib/loginStreak';
import BackgroundParticles from '@/components/BackgroundParticles';
import StatsPanel from '@/components/StatsPanel';
import AchievementsModal from '@/components/AchievementsModal';
import UserProfileButton from '@/components/UserProfileButton';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserBalance, updateUserStats, placeBet as firestorePlaceBet, cashout as firestoreCashout, gameLost as firestoreGameLost } from '@/lib/firestoreSync';
import { loadBalance, saveBalance, loadStats, saveStats, loadAchievements, saveAchievements, checkDailyBonus, claimDailyBonus, resetDailyBonus } from '@/lib/storage';
import { checkAchievements, updateStats } from '@/lib/achievements';
import { toast } from 'sonner';
import type { Achievement, GameStats } from '@/types/slotGame';
import gsap from 'gsap';

const CELL_SIZE = 90;
const CELL_GAP = 8;

export default function SlotGame() {
  const { user, userData } = useAuth();
  const [balance, setBalance] = useState(userData?.balance || loadBalance());
  const [stats, setStats] = useState<GameStats>(loadStats());
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements());
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showLoginStreak, setShowLoginStreak] = useState(false);
  const [loginStreakData, setLoginStreakData] = useState({ streakDay: 1, bonus: 1000, streakReset: false });
  const [selectedBet, setSelectedBet] = useState(BET_AMOUNTS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [showCoinBurst, setShowCoinBurst] = useState(false);
  const [coinBurstPos, setCoinBurstPos] = useState({ x: 0, y: 0 });
  const [showAchievements, setShowAchievements] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    phase: 'betting',
    balance: DEFAULT_BALANCE,
    currentBet: 0,
    grid: [],
    revealedCount: 0,
    totalMultiplier: 0,
    baseWinTotal: 0,
    currentWin: 0,
    mineCount: GRID_SIZES[0].mines,
    gridSize: GRID_SIZES[0].size,
  });
  const [history, setHistory] = useState<GameHistory[]>([]);

  // Login streak check
  useEffect(() => {
    if (user && userData) {
      checkLoginStreak();
    }
  }, [user]);

  const checkLoginStreak = async () => {
    if (!user) return;
    
    try {
      const result = await checkAndUpdateLoginStreak(user.uid);
      if (result.isNewDay) {
        setLoginStreakData({
          streakDay: result.currentStreak,
          bonus: result.streakBonus,
          streakReset: result.streakReset,
        });
        setShowLoginStreak(true);
      }
    } catch (error) {
      console.error('Login streak error:', error);
    }
  };

  // Firestore sync - bakiye userData'dan gelir
  useEffect(() => {
    if (userData?.balance !== undefined) {
      setBalance(userData.balance);
    }
  }, [userData?.balance]);

  // LocalStorage sync (fallback)
  useEffect(() => {
    if (!user) {
      saveBalance(balance);
    }
  }, [balance, user]);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  useEffect(() => {
    saveAchievements(achievements);
  }, [achievements]);

  // Müzik başlat/durdur
  useEffect(() => {
    if (musicEnabled) {
      backgroundMusic.start();
    } else {
      backgroundMusic.stop();
    }
  }, [musicEnabled]);

  // Daily bonus check
  useEffect(() => {
    resetDailyBonus();
    const { canClaim } = checkDailyBonus();
    if (canClaim) {
      setShowDailyBonus(true);
    }
  }, []);

  const startGame = async () => {
    if (balance < selectedBet) {
      toast.error('Yetersiz bakiye!');
      return;
    }

    const difficulty = GRID_SIZES[selectedDifficulty];
    const newGrid = createSlotGrid(difficulty.size, difficulty.mines);
    
    // Firestore'a bahis kaydet
    if (user && userData) {
      try {
        await firestorePlaceBet(user.uid, selectedBet);
        // Bakiye Firestore'dan otomatik sync olacak, local düşürme yok
      } catch (error) {
        console.error('Bet error:', error);
        toast.error('Bahis kaydedilemedi!');
        return;
      }
    } else {
      // Giriş yapmamış kullanıcılar için local storage
      setBalance(prev => prev - selectedBet);
    }
    setGameState({
      phase: 'playing',
      balance: balance - selectedBet,
      currentBet: selectedBet,
      grid: newGrid,
      revealedCount: 0,
      totalMultiplier: 0,
      baseWinTotal: 0,
      currentWin: 0,
      mineCount: difficulty.mines,
      gridSize: difficulty.size,
    });
  };

  const handleCellClick = async (row: number, col: number) => {
    if (gameState.phase !== 'playing') return;
    soundEffects.click();

    const { newGrid, isMine, baseWin, multiplier } = revealCell(gameState.grid, row, col);
    
    if (isMine) {
      soundEffects.bomb();
      // Mayına bastı - oyun bitti
      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        phase: 'busted',
      }));
      
      // Firestore'a kayıp kaydet
      if (user && userData) {
        try {
          await firestoreGameLost(user.uid);
        } catch (error) {
          console.error('Game lost sync error:', error);
        }
      }
      
      // İstatistikleri güncelle
      const newStats = updateStats(gameState.currentBet, 0, gameState.totalMultiplier, 'bust');
      setStats(newStats);
      
      setHistory(prev => [
        {
          bet: gameState.currentBet,
          win: 0,
          multiplier: gameState.totalMultiplier,
          result: 'bust',
          timestamp: Date.now(),
        },
        ...prev.slice(0, 9),
      ]);
    } else {
      soundEffects.reveal();
      // Kazanç - çarpanı hesapla
      const newMultiplier = calculateTotalMultiplier(newGrid);
      const newBaseWinTotal = calculateBaseWinTotal(newGrid);
      const newWin = calculateCurrentWin(newBaseWinTotal, newMultiplier);
      const revealed = getRevealedCount(newGrid);
      
      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        revealedCount: revealed,
        totalMultiplier: newMultiplier,
        baseWinTotal: newBaseWinTotal,
        currentWin: newWin,
      }));
    }
  };

  const cashout = async () => {
    if (gameState.phase !== 'playing' || gameState.currentWin === 0) return;
    
    // Streak bonus hesapla
    const streakBonus = stats.currentStreak >= 3 ? stats.currentStreak * 0.05 : 0;
    const bonusMultiplier = 1 + streakBonus;
    const finalWin = Math.floor(gameState.currentWin * bonusMultiplier);
    
    soundEffects.cashout();
    
    // Show coin burst animation
    const cashoutBtn = document.getElementById('cashout-btn');
    if (cashoutBtn) {
      const rect = cashoutBtn.getBoundingClientRect();
      setCoinBurstPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setShowCoinBurst(true);
      setTimeout(() => setShowCoinBurst(false), 2000);
    }

    const winAmount = finalWin;
    
    // Firestore'a kazanç kaydet
    if (user && userData) {
      try {
        await firestoreCashout(user.uid, winAmount, gameState.totalMultiplier);
        // Bakiye Firestore'dan otomatik sync olacak
        
        // En yüksek kazanç/çarpan kontrolü
        if (winAmount > userData.stats.highestWin) {
          await updateUserStats(user.uid, { highestWin: winAmount });
        }
        if (gameState.totalMultiplier > userData.stats.highestMultiplier) {
          await updateUserStats(user.uid, { highestMultiplier: gameState.totalMultiplier });
        }
      } catch (error) {
        console.error('Cashout sync error:', error);
        toast.error('Kazanç kaydedilemedi!');
      }
    } else {
      // Giriş yapmamış kullanıcılar için local storage
      setBalance(prev => prev + winAmount);
      saveBalance(balance + winAmount);
    }
    
    // Streak bonus bildirimi
    if (streakBonus > 0) {
      toast.success(`Cashout! 💰 +${(streakBonus * 100).toFixed(0)}% Streak Bonus!`, {
        description: `${gameState.currentWin.toLocaleString()} → ${finalWin.toLocaleString()} coin`,
      });
    }
    
    // İstatistikleri güncelle
    const newStats = updateStats(gameState.currentBet, winAmount, gameState.totalMultiplier, 'win');
    setStats(newStats);
    
    // Başarıları kontrol et
    const newAchievements = checkAchievements(gameState.grid, winAmount, gameState.totalMultiplier, newStats);
    newAchievements.forEach(achievement => {
      toast.success(`🎉 Başarı Kazanıldı: ${achievement.title}`, {
        description: achievement.description,
      });
    });
    setAchievements(loadAchievements());
    
    // Animasyon
    gsap.fromTo(
      '.cashout-animation',
      { scale: 1, opacity: 1 },
      { scale: 2, opacity: 0, duration: 1 }
    );
    
    setGameState(prev => ({
      ...prev,
      phase: 'cashedout',
    }));
    
    setHistory(prev => [
      {
        bet: gameState.currentBet,
        win: winAmount,
        multiplier: gameState.totalMultiplier,
        result: 'win',
        timestamp: Date.now(),
      },
      ...prev.slice(0, 9),
    ]);
  };

  const resetGame = () => {
    setGameState({
      phase: 'betting',
      balance,
      currentBet: 0,
      grid: [],
      revealedCount: 0,
      totalMultiplier: 0,
      baseWinTotal: 0,
      currentWin: 0,
      mineCount: GRID_SIZES[selectedDifficulty].mines,
      gridSize: GRID_SIZES[selectedDifficulty].size,
    });
  };

  const gridWidth = gameState.gridSize * (CELL_SIZE + CELL_GAP) - CELL_GAP;
  const gridHeight = gameState.gridSize * (CELL_SIZE + CELL_GAP) - CELL_GAP;
  const winProbability = gameState.phase === 'playing' 
    ? calculateWinProbability(gameState.gridSize, gameState.mineCount, gameState.revealedCount)
    : 0;

  return (
    <div 
      className="min-h-screen p-8 relative"
      style={{
        backgroundImage: `url(${BACKGROUND_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Arka plan parçacıkları */}
      <BackgroundParticles />
      
      <div className="container max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <h1 className="text-6xl font-bold text-white text-center flex-1">
              🍬 Candy Mines
            </h1>
            <div className="flex-1 flex justify-end">
              <UserProfileButton />
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="flex gap-2">
              {userData?.role === 'admin' && (
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="p-3 rounded-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 transition-colors"
                  title="Admin Panel"
                >
                  <Shield className="w-6 h-6 text-white" />
                </button>
              )}
              <button
                onClick={() => window.location.href = '/market'}
                className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-colors"
                title="Hediye Market"
              >
                <ShoppingBag className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => window.location.href = '/my-gifts'}
                className="p-3 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 transition-colors"
                title="Kazandığım Hediyeler"
              >
                <Package className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => setShowAchievements(true)}
                className="p-3 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 transition-colors"
                title="Başarılar"
              >
                <Award className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => window.location.href = '/leaderboard'}
                className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-colors"
                title="Liderlik Tablosu"
              >
                <Trophy className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => window.location.href = '/referral'}
                className="p-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-colors"
                title="Arkadaşını Davet Et"
              >
                <Users className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => setMusicEnabled(!musicEnabled)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Arka plan müziği"
              >
                <Music className={`w-6 h-6 ${musicEnabled ? 'text-yellow-400' : 'text-white/50'}`} />
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Ses efektleri"
              >
                {soundEnabled ? (
                  <Volume2 className="w-6 h-6 text-white" />
                ) : (
                  <VolumeX className="w-6 h-6 text-white/50" />
                )}
              </button>
            </div>
          </div>
          <p className="text-white/80 text-xl">
            Candy'leri aç, mayınlardan kaçın, kazancını al!
          </p>
        </div>

        <div className="grid lg:grid-cols-[350px_1fr_350px] gap-6">
          {/* Left Panel - Stats & Controls */}
          <div className="space-y-4">
            {/* İstatistik Paneli */}
            <StatsPanel stats={stats} />
            {/* Balance */}
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={COIN_IMAGE} alt="coin" className="w-10 h-10" />
                  <div>
                    <div className="text-white/70 text-sm">Bakiye</div>
                    <div className="text-white text-3xl font-bold">
                      {balance.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Betting Panel */}
            {gameState.phase === 'betting' && (
              <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
                <h3 className="text-white text-xl font-bold mb-4">Bahis Ayarları</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-white/80 text-sm mb-2 block">Bahis Miktarı</label>
                    <div className="grid grid-cols-3 gap-2">
                      {BET_AMOUNTS.map(amount => (
                        <Button
                          key={amount}
                          onClick={() => setSelectedBet(amount)}
                          variant={selectedBet === amount ? 'default' : 'outline'}
                          className={
                            selectedBet === amount
                              ? 'bg-gradient-to-r from-[#FF5DA2] to-[#7C4DFF] text-white'
                              : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                          }
                        >
                          {amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-white/80 text-sm mb-2 block">Zorluk</label>
                    <div className="grid grid-cols-3 gap-2">
                      {GRID_SIZES.map((diff, idx) => (
                        <Button
                          key={idx}
                          onClick={() => setSelectedDifficulty(idx)}
                          variant={selectedDifficulty === idx ? 'default' : 'outline'}
                          className={
                            selectedDifficulty === idx
                              ? 'bg-gradient-to-r from-[#FF5DA2] to-[#7C4DFF] text-white'
                              : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                          }
                        >
                          <div className="text-xs">
                            <div>{diff.name}</div>
                            <div className="text-[10px] opacity-70">{diff.mines} mayın</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={startGame}
                    disabled={balance < selectedBet}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white font-bold"
                    size="lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Oyunu Başlat ({selectedBet} coin)
                  </Button>
                </div>
              </Card>
            )}



            {/* Game History */}
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <h3 className="text-white text-xl font-bold mb-4">Son Oyunlar</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-white/50 text-sm text-center py-4">Henüz oyun yok</p>
                ) : (
                  history.map((game, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        game.result === 'win'
                          ? 'bg-green-500/20 border border-green-500/30'
                          : 'bg-red-500/20 border border-red-500/30'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {game.result === 'win' ? (
                            <Trophy className="w-4 h-4 text-green-400" />
                          ) : (
                            <Bomb className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-white/80 text-sm">
                            Bahis: {game.bet}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${game.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                            {game.result === 'win' ? `+${game.win}` : '0'}
                          </div>
                          <div className="text-white/50 text-xs">
                            x{game.multiplier.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Center Panel - Game Grid */}
          <div>
            <Card className="p-8 bg-white/10 backdrop-blur-sm border-white/20">
              {gameState.phase === 'betting' ? (
                <div className="flex items-center justify-center" style={{ minHeight: gridHeight + 64 }}>
                  <div className="text-center">
                    <Sparkles className="w-24 h-24 text-white/30 mx-auto mb-6" />
                    <h3 className="text-white text-3xl font-bold mb-2">Oyuna Hazır!</h3>
                    <p className="text-white/70">Bahis ayarlarını yap ve başla</p>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="relative mx-auto p-4 rounded-2xl"
                    style={{
                      width: `${gridWidth}px`,
                      height: `${gridHeight}px`,
                    }}
                  >
                    {/* Neon border */}
                    <div className="absolute inset-0 rounded-2xl border-4 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.6),0_0_60px_rgba(236,72,153,0.4)] animate-pulse" />
                    {gameState.grid.map((row, rowIdx) =>
                      row.map((cell, colIdx) => {
                        const x = colIdx * (CELL_SIZE + CELL_GAP);
                        const y = rowIdx * (CELL_SIZE + CELL_GAP);
                        
                        return (
                          <div
                            key={cell.id}
                            style={{
                              position: 'absolute',
                              left: x,
                              top: y,
                            }}
                          >
                            <SlotCandyCell
                              cell={cell}
                              size={CELL_SIZE}
                              onClick={() => handleCellClick(rowIdx, colIdx)}
                              disabled={gameState.phase !== 'playing'}
                            />
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Game Over Overlay */}
                  {(gameState.phase === 'busted' || gameState.phase === 'cashedout') && (
                    <div className="mt-8 text-center">
                      {gameState.phase === 'busted' ? (
                        <>
                          <Bomb className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
                          <h3 className="text-white text-3xl font-bold mb-2">Mayına Bastın!</h3>
                          <p className="text-white/70 mb-6">Bahis kaybedildi</p>
                        </>
                      ) : (
                        <>
                          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
                          <h3 className="text-white text-3xl font-bold mb-2">Kazandın!</h3>
                          <p className="text-green-400 text-2xl font-bold mb-6">
                            +{gameState.currentWin.toLocaleString()} coin
                          </p>
                        </>
                      )}
                      
                      <Button
                        onClick={resetGame}
                        className="bg-gradient-to-r from-[#FF5DA2] to-[#7C4DFF] hover:opacity-90 text-white font-bold"
                        size="lg"
                      >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Yeni Oyun
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>

          {/* Right Panel - Win Info & Cashout */}
          <div className="space-y-4">
            {gameState.phase === 'playing' && (
              <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
                <h3 className="text-white text-xl font-bold mb-4">Kazanç Bilgileri</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Bahis:</span>
                    <span className="text-white font-bold">{gameState.currentBet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Açılan:</span>
                    <span className="text-white font-bold">{gameState.revealedCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Toplam Çarpan:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⭐</span>
                      <span className="text-yellow-400 text-xl font-bold">
                        {gameState.totalMultiplier > 0 ? `${gameState.totalMultiplier.toFixed(0)}x` : '0x'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Temel Kazanç:</span>
                    <span className="text-green-400 font-bold">
                      {gameState.baseWinTotal} coin
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Kazanma İhtimali:</span>
                    <span className="text-green-400 font-bold">
                      {winProbability.toFixed(1)}%
                    </span>
                  </div>
                  <div className="border-t border-white/20 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Mevcut Kazanç:</span>
                      <span className="text-green-400 text-2xl font-bold cashout-animation">
                        {gameState.currentWin.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  id="cashout-btn"
                  onClick={cashout}
                  disabled={gameState.currentWin === 0}
                  className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white font-bold"
                  size="lg"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Cashout ({gameState.currentWin.toLocaleString()})
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
      {/* Daily Bonus Modal */}
      {showDailyBonus && (
        <DailyBonusModal
          amount={100}
          onClaim={() => {
            const newBalance = claimDailyBonus();
            setBalance(newBalance);
            setShowDailyBonus(false);
            toast.success('Günlük bonus alındı! 🎉');
          }}
          onClose={() => setShowDailyBonus(false)}
        />
      )}

      {/* Achievements Modal */}
      <AchievementsModal
        open={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={achievements}
      />

      {/* Login Streak Modal */}
      <LoginStreakModal
        open={showLoginStreak}
        onClose={() => setShowLoginStreak(false)}
        streakDay={loginStreakData.streakDay}
        bonus={loginStreakData.bonus}
        streakReset={loginStreakData.streakReset}
      />

      {/* Coin Burst Effect */}
      {showCoinBurst && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <ParticleEffect
            x={coinBurstPos.x}
            y={coinBurstPos.y}
            type="coin"
          />
        </div>
      )}
    </div>
  );
}
