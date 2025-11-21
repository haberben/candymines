import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Copy, Users, Gift, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { generateReferralCode, saveReferralCode, getReferralStats } from '@/lib/referral';
import { BACKGROUND_IMAGE, COIN_IMAGE } from '@/types/slotGame';
import BackgroundParticles from '@/components/BackgroundParticles';
import { toast } from 'sonner';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Referral() {
  const { user, userData } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState({ totalReferrals: 0, totalEarned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && userData) {
      initializeReferral();
    }
  }, [user, userData]);

  const initializeReferral = async () => {
    if (!user || !userData) return;

    try {
      // Referral code varsa kullan, yoksa oluştur
      let code = userData.referralCode;
      if (!code) {
        code = generateReferralCode(userData.username, user.uid);
        
        // Firestore'a kaydet
        await updateDoc(doc(db, 'users', user.uid), {
          referralCode: code,
          referralStats: {
            totalReferrals: 0,
            totalEarned: 0,
          },
        });
        
        // Referral codes collection'a kaydet
        await saveReferralCode(code, user.uid);
      }

      setReferralCode(code);
      setReferralLink(`${window.location.origin}/register?ref=${code}`);

      // İstatistikleri yükle
      const referralStats = await getReferralStats(user.uid);
      setStats(referralStats);
    } catch (error) {
      console.error('Error initializing referral:', error);
      toast.error('Referral kodu oluşturulamadı!');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopyalandı! 📋');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-2xl">Yükleniyor...</p>
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

      <div className="container max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Oyuna Dön
          </Button>
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-2 flex items-center justify-center gap-4">
              <Users className="w-16 h-16 text-purple-400" />
              Arkadaşını Davet Et
            </h1>
            <p className="text-white/80 text-xl">Bonus coin kazan!</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Toplam Davet</p>
                <p className="text-3xl font-bold text-white">{stats.totalReferrals}</p>
              </div>
              <Users className="w-10 h-10 text-purple-400" />
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Kazanılan Coin</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.totalEarned.toLocaleString()}</p>
              </div>
              <img src={COIN_IMAGE} alt="Coin" className="w-10 h-10" />
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Davet Başına</p>
                <p className="text-3xl font-bold text-green-400">500</p>
              </div>
              <Gift className="w-10 h-10 text-green-400" />
            </div>
          </Card>
        </div>

        {/* Referral Code Card */}
        <Card className="p-8 bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Senin Davet Kodun</h2>
          <div className="flex gap-3 mb-6">
            <Input
              value={referralCode}
              readOnly
              className="bg-white/10 border-white/20 text-white text-2xl font-bold text-center"
            />
            <Button
              onClick={() => copyToClipboard(referralCode)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Copy className="w-5 h-5 mr-2" />
              Kopyala
            </Button>
          </div>

          <h3 className="text-xl font-bold text-white mb-3">Davet Linki</h3>
          <div className="flex gap-3">
            <Input
              value={referralLink}
              readOnly
              className="bg-white/10 border-white/20 text-white"
            />
            <Button
              onClick={() => copyToClipboard(referralLink)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Copy className="w-5 h-5 mr-2" />
              Kopyala
            </Button>
          </div>
        </Card>

        {/* How It Works */}
        <Card className="p-8 bg-white/10 backdrop-blur-sm border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            Nasıl Çalışır?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <p className="text-white font-bold mb-1">Arkadaşını Davet Et</p>
                <p className="text-white/70">Davet kodunu veya linkini arkadaşınla paylaş</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                2
              </div>
              <div>
                <p className="text-white font-bold mb-1">Arkadaşın Kayıt Olsun</p>
                <p className="text-white/70">Arkadaşın senin kodunla kayıt olsun ve 200 coin kazansın</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                3
              </div>
              <div>
                <p className="text-white font-bold mb-1">Sen de Kazan!</p>
                <p className="text-white/70">Arkadaşın kayıt olduğunda sen 500 coin kazanırsın!</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
