import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrendingUp, Users, DollarSign, Trophy, Activity, Coins } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeToday: number;
  totalBalance: number;
  totalBets: number;
  totalWins: number;
  avgBet: number;
  avgWin: number;
  winRate: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeToday: 0,
    totalBalance: 0,
    totalBets: 0,
    totalWins: 0,
    avgBet: 0,
    avgWin: 0,
    winRate: 0,
  });
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Tüm kullanıcıları yükle
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      // İstatistikleri hesapla
      const totalUsers = users.length;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeToday = users.filter(user => {
        if (!user.lastLogin) return false;
        const lastLogin = user.lastLogin.toDate();
        return lastLogin >= today;
      }).length;

      let totalBalance = 0;
      let totalBets = 0;
      let totalWins = 0;
      let totalGamesPlayed = 0;

      users.forEach(user => {
        totalBalance += user.balance || 0;
        if (user.stats) {
          totalBets += (user.stats.gamesPlayed || 0) * 50; // Ortalama bahis 50
          totalWins += user.stats.totalWins || 0;
          totalGamesPlayed += user.stats.gamesPlayed || 0;
        }
      });

      const avgBet = totalGamesPlayed > 0 ? totalBets / totalGamesPlayed : 0;
      const avgWin = totalWins > 0 ? totalBalance / totalWins : 0;
      const winRate = totalGamesPlayed > 0 ? (totalWins / totalGamesPlayed) * 100 : 0;

      setStats({
        totalUsers,
        activeToday,
        totalBalance,
        totalBets,
        totalWins,
        avgBet,
        avgWin,
        winRate,
      });

      // En çok oynayan kullanıcılar
      const sortedByGames = [...users]
        .filter(u => u.stats?.gamesPlayed)
        .sort((a, b) => (b.stats?.gamesPlayed || 0) - (a.stats?.gamesPlayed || 0))
        .slice(0, 10);

      setTopPlayers(sortedByGames);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-white text-center">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Toplam Kullanıcı</p>
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <Users className="w-12 h-12 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Bugün Aktif</p>
              <p className="text-3xl font-bold text-white">{stats.activeToday}</p>
            </div>
            <Activity className="w-12 h-12 text-green-400" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Toplam Bakiye</p>
              <p className="text-3xl font-bold text-white">{stats.totalBalance.toLocaleString()}</p>
            </div>
            <Coins className="w-12 h-12 text-yellow-400" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Kazanma Oranı</p>
              <p className="text-3xl font-bold text-white">{stats.winRate.toFixed(1)}%</p>
            </div>
            <Trophy className="w-12 h-12 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Ekonomi Metrikleri */}
      <Card className="p-6 bg-white/5 border-white/10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-400" />
          Oyun Ekonomisi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm mb-1">Toplam Bahis</p>
            <p className="text-2xl font-bold text-white">{stats.totalBets.toLocaleString()} coin</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm mb-1">Ortalama Bahis</p>
            <p className="text-2xl font-bold text-white">{stats.avgBet.toFixed(0)} coin</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm mb-1">Ortalama Kazanç</p>
            <p className="text-2xl font-bold text-white">{stats.avgWin.toFixed(0)} coin</p>
          </div>
        </div>
      </Card>

      {/* En Çok Oynayan Kullanıcılar */}
      <Card className="p-6 bg-white/5 border-white/10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-400" />
          En Aktif Oyuncular
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/70 text-sm">#</th>
                <th className="text-left py-3 px-4 text-white/70 text-sm">Kullanıcı</th>
                <th className="text-left py-3 px-4 text-white/70 text-sm">Oyun Sayısı</th>
                <th className="text-left py-3 px-4 text-white/70 text-sm">Kazanma</th>
                <th className="text-left py-3 px-4 text-white/70 text-sm">Bakiye</th>
              </tr>
            </thead>
            <tbody>
              {topPlayers.map((player, index) => (
                <tr key={player.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white font-bold">{index + 1}</td>
                  <td className="py-3 px-4 text-white">{player.username || player.email}</td>
                  <td className="py-3 px-4 text-white">{player.stats?.gamesPlayed || 0}</td>
                  <td className="py-3 px-4 text-white">{player.stats?.totalWins || 0}</td>
                  <td className="py-3 px-4 text-yellow-400 font-bold">{(player.balance || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
