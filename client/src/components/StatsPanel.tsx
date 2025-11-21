import { Card } from '@/components/ui/card';
import { GameStats } from '@/types/slotGame';
import { TrendingUp, Trophy, Target, Flame } from 'lucide-react';

interface StatsPanelProps {
  stats: GameStats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        İstatistikler
      </h3>
      
      <div className="space-y-3">
        {/* Toplam Oyun */}
        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm">Toplam Oyun</span>
          <span className="text-white font-bold">{stats.gamesPlayed}</span>
        </div>

        {/* Kazanma Oranı */}
        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm">Kazanma Oranı</span>
          <span className="text-green-400 font-bold">{stats.winRate.toFixed(1)}%</span>
        </div>

        {/* En Yüksek Kazanç */}
        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            En Yüksek Kazanç
          </span>
          <span className="text-yellow-400 font-bold">{stats.highestWin.toLocaleString()}</span>
        </div>

        {/* En Yüksek Çarpan */}
        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm flex items-center gap-1">
            <Target className="w-4 h-4" />
            En Yüksek Çarpan
          </span>
          <span className="text-purple-400 font-bold">x{stats.highestMultiplier.toFixed(1)}</span>
        </div>

        {/* Mevcut Streak */}
        <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
          <span className="text-white font-semibold flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Streak
          </span>
          <div className="flex flex-col items-end">
            <span className="text-orange-400 font-bold text-xl">{stats.currentStreak} 🔥</span>
            <span className="text-white/50 text-xs">En Uzun: {stats.longestStreak}</span>
          </div>
        </div>

        {/* Streak Bonus */}
        {stats.currentStreak >= 3 && (
          <div className="p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/50 text-center">
            <span className="text-yellow-300 text-sm font-bold">
              🎉 Streak Bonus: +{(stats.currentStreak * 5)}% Kazanç!
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
