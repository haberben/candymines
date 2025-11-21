import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Crown, ArrowLeft } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BACKGROUND_IMAGE, COIN_IMAGE } from '@/types/slotGame';
import BackgroundParticles from '@/components/BackgroundParticles';
import type { UserData } from '@/contexts/AuthContext';

export default function Leaderboard() {
  const [topPlayers, setTopPlayers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'highestWin' | 'balance'>('highestWin');

  useEffect(() => {
    loadLeaderboard();
  }, [filter]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const field = filter === 'highestWin' ? 'stats.highestWin' : 'balance';
      const q = query(usersRef, orderBy(field, 'desc'), limit(10));
      
      const snapshot = await getDocs(q);
      const players = snapshot.docs.map(doc => doc.data() as UserData);
      setTopPlayers(players);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-8 h-8 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-7 h-7 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return <span className="text-2xl font-bold text-white/50">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border-yellow-500/50';
    if (rank === 2) return 'bg-gradient-to-r from-gray-600/30 to-gray-500/30 border-gray-400/50';
    if (rank === 3) return 'bg-gradient-to-r from-orange-600/30 to-orange-500/30 border-orange-400/50';
    return 'bg-white/5 border-white/10';
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{
        backgroundImage: `url(${BACKGROUND_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <BackgroundParticles />

      <div className="container max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Oyuna Dön
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-2 flex items-center justify-center gap-4">
              <Trophy className="w-16 h-16 text-yellow-400" />
              Liderlik Tablosu
            </h1>
            <p className="text-white/80 text-xl">En başarılı oyuncular</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 justify-center mb-8">
          <Button
            onClick={() => setFilter('highestWin')}
            variant={filter === 'highestWin' ? 'default' : 'outline'}
            className={filter === 'highestWin'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600'
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }
          >
            En Yüksek Kazanç
          </Button>
          <Button
            onClick={() => setFilter('balance')}
            variant={filter === 'balance' ? 'default' : 'outline'}
            className={filter === 'balance'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600'
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }
          >
            En Yüksek Bakiye
          </Button>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center text-white text-2xl py-12">Yükleniyor...</div>
        ) : (
          <div className="space-y-4">
            {topPlayers.map((player, index) => {
              const rank = index + 1;
              const value = filter === 'highestWin' ? player.stats.highestWin : player.balance;
              
              return (
                <Card
                  key={player.uid}
                  className={`p-6 backdrop-blur-sm border-2 ${getRankBg(rank)} transition-all hover:scale-105`}
                >
                  <div className="flex items-center gap-6">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-16 flex items-center justify-center">
                      {getRankIcon(rank)}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                          {player.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xl font-bold text-white">{player.username}</p>
                          <p className="text-white/50 text-sm">{player.stats.gamesPlayed} oyun</p>
                        </div>
                      </div>
                    </div>

                    {/* Value */}
                    <div className="flex items-center gap-2">
                      <img src={COIN_IMAGE} alt="Coin" className="w-8 h-8" />
                      <span className="text-3xl font-bold text-yellow-400">
                        {value.toLocaleString()}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <p className="text-white/70 text-sm">Kazanma Oranı</p>
                      <p className="text-green-400 font-bold">
                        {((player.stats.totalWins / player.stats.gamesPlayed) * 100 || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}

            {topPlayers.length === 0 && (
              <div className="text-center text-white/50 text-xl py-12">
                Henüz liderlik tablosunda kimse yok.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
