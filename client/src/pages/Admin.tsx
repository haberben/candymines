import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BACKGROUND_IMAGE, COIN_IMAGE } from '@/types/slotGame';
import { Shield, Ban, Gift, Users, TrendingUp, Search, Package } from 'lucide-react';
import AdminGiftManagement from '@/components/AdminGiftManagement';
import AdminDashboard from '@/components/AdminDashboard';
import AdminGiftOrders from '@/components/AdminGiftOrders';
import { toast } from 'sonner';
import type { UserData } from '@/contexts/AuthContext';
import BackgroundParticles from '@/components/BackgroundParticles';

export default function Admin() {
  const { userData } = useAuth();
  const [, setLocation] = useLocation();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [coinAmount, setCoinAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'gifts' | 'orders'>('dashboard');

  useEffect(() => {
    if (!userData) {
      setLocation('/login');
      return;
    }

    if (userData.role !== 'admin') {
      toast.error('Admin yetkisi gerekli!');
      setLocation('/');
      return;
    }

    loadUsers();
  }, [userData, setLocation]);

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => doc.data() as UserData);
      setUsers(usersData.sort((a, b) => b.balance - a.balance));
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Kullanıcılar yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const giveCoin = async (userId: string, amount: number) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        balance: increment(amount),
      });
      
      toast.success(`${amount} coin verildi!`);
      await loadUsers();
      setCoinAmount('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Error giving coin:', error);
      toast.error('Coin verilemedi!');
    }
  };

  const toggleBan = async (userId: string, currentBanStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isBanned: !currentBanStatus,
      });
      
      toast.success(currentBanStatus ? 'Ban kaldırıldı!' : 'Kullanıcı banlandı!');
      await loadUsers();
    } catch (error) {
      console.error('Error toggling ban:', error);
      toast.error('İşlem başarısız!');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    totalGames: users.reduce((sum, u) => sum + u.stats.gamesPlayed, 0),
    bannedUsers: users.filter(u => u.isBanned).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Yükleniyor...</div>
      </div>
    );
  }

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

      <div className="container max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-5xl font-bold text-white flex items-center gap-3">
              <Shield className="w-12 h-12 text-yellow-400" />
              Admin Panel
            </h1>
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Oyuna Dön
            </Button>
          </div>
          <p className="text-white/70 text-center">Kullanıcı yönetimi ve istatistikler</p>
          
          {/* Tabs */}
          <div className="flex gap-3 justify-center mt-6">
            <Button
              onClick={() => setActiveTab('dashboard')}
              variant={activeTab === 'dashboard' ? 'default' : 'outline'}
              className={activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={() => setActiveTab('users')}
              variant={activeTab === 'users' ? 'default' : 'outline'}
              className={activeTab === 'users'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }
            >
              <Users className="w-5 h-5 mr-2" />
              Kullanıcılar
            </Button>
            <Button
              onClick={() => setActiveTab('gifts')}
              variant={activeTab === 'gifts' ? 'default' : 'outline'}
              className={activeTab === 'gifts'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }
            >
              <Gift className="w-5 h-5 mr-2" />
              Hediyeler
            </Button>
            <Button
              onClick={() => setActiveTab('orders')}
              variant={activeTab === 'orders' ? 'default' : 'outline'}
              className={activeTab === 'orders'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }
            >
              <Package className="w-5 h-5 mr-2" />
              Sipariş Talepleri
            </Button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && <AdminDashboard />}

        {/* Stats Cards - Sadece users tab'de göster */}
        {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Toplam Kullanıcı</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="w-10 h-10 text-blue-400" />
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Toplam Bakiye</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.totalBalance.toLocaleString()}</p>
              </div>
              <img src={COIN_IMAGE} alt="Coin" className="w-10 h-10" />
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Toplam Oyun</p>
                <p className="text-3xl font-bold text-white">{stats.totalGames.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-400" />
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Banlı Kullanıcı</p>
                <p className="text-3xl font-bold text-red-400">{stats.bannedUsers}</p>
              </div>
              <Ban className="w-10 h-10 text-red-400" />
            </div>
          </Card>
        </div>
        )}

        {/* Search - Sadece users tab'de göster */}
        {activeTab === 'users' && (
        <Card className="p-4 mb-6 bg-white/10 backdrop-blur-sm border-white/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kullanıcı ara (isim veya email)..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </Card>
        )}

        {/* Users Table - Sadece users tab'de göster */}
        {activeTab === 'users' && (
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-white font-semibold">Kullanıcı</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Email</th>
                  <th className="text-right py-3 px-4 text-white font-semibold">Bakiye</th>
                  <th className="text-right py-3 px-4 text-white font-semibold">Oyun</th>
                  <th className="text-right py-3 px-4 text-white font-semibold">En Yüksek</th>
                  <th className="text-center py-3 px-4 text-white font-semibold">Durum</th>
                  <th className="text-center py-3 px-4 text-white font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{user.username}</p>
                          {user.role === 'admin' && (
                            <span className="text-xs text-yellow-400">👑 Admin</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white/70">{user.email}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <img src={COIN_IMAGE} alt="Coin" className="w-5 h-5" />
                        <span className="text-yellow-400 font-bold">{user.balance.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-white">{user.stats.gamesPlayed}</td>
                    <td className="py-3 px-4 text-right text-green-400 font-semibold">
                      {user.stats.highestWin.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {user.isBanned ? (
                        <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
                          Banlı
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => setSelectedUser(user)}
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                        >
                          <Gift className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => toggleBan(user.uid, user.isBanned)}
                          size="sm"
                          variant="outline"
                          className={user.isBanned ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400'}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        )}

        {/* Gifts Tab */}
        {activeTab === 'gifts' && <AdminGiftManagement />}

        {/* Orders Tab */}
        {activeTab === 'orders' && <AdminGiftOrders />}
      </div>

      {/* Give Coin Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">Coin Ver</h3>
            <div className="mb-4">
              <p className="text-white/70 mb-2">Kullanıcı: <span className="text-white font-semibold">{selectedUser.username}</span></p>
              <p className="text-white/70">Mevcut Bakiye: <span className="text-yellow-400 font-bold">{selectedUser.balance.toLocaleString()}</span></p>
            </div>
            <Input
              type="number"
              value={coinAmount}
              onChange={(e) => setCoinAmount(e.target.value)}
              placeholder="Coin miktarı..."
              className="mb-4 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const amount = parseInt(coinAmount);
                  if (amount > 0) {
                    giveCoin(selectedUser.uid, amount);
                  }
                }}
                disabled={!coinAmount || parseInt(coinAmount) <= 0}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
              >
                <Gift className="w-4 h-4 mr-2" />
                Coin Ver
              </Button>
              <Button
                onClick={() => {
                  setSelectedUser(null);
                  setCoinAmount('');
                }}
                variant="outline"
                className="flex-1 bg-white/10 border-white/20 text-white"
              >
                İptal
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
