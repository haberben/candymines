import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GIFT_CATEGORIES, GiftItem, COIN_IMAGE } from '@/types/slotGame';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ShoppingCart, Star, Package, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserBalance } from '@/lib/firestoreSync';
import ProfileCompleteModal from '@/components/ProfileCompleteModal';

export default function GiftMarket() {
  const { user, userData } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [balance, setBalance] = useState(userData?.balance || 0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time bakiye listener
  useEffect(() => {
    if (userData) {
      setBalance(userData.balance);
    }
  }, [userData?.balance]);

  // Hediyeleri yükle
  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    try {
      const giftsSnapshot = await getDocs(collection(db, 'gifts'));
      const giftsData = giftsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as GiftItem[];
      setGifts(giftsData);
    } catch (error) {
      console.error('Error loading gifts:', error);
      toast.error('Hediyeler yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const filteredGifts = selectedCategory === 'all'
    ? gifts
    : gifts.filter(gift => gift.category === selectedCategory);

  const handlePurchase = async (gift: GiftItem) => {
    if (!user || !userData) {
      toast.error('Lütfen giriş yapın!');
      return;
    }

    // Profil bilgisi kontrolü
    if (!userData.firstName || !userData.lastName || !userData.phone || !userData.address) {
      toast.error('Profil bilgilerinizi tamamlayın!', {
        description: 'Hediye satın alabilmek için kargo bilgilerinizi doldurmalısınız.',
      });
      setShowProfileModal(true);
      return;
    }

    if (balance < gift.price) {
      toast.error('Yetersiz bakiye!', {
        description: `Bu hediye için ${gift.price.toLocaleString()} coin gerekli.`,
      });
      return;
    }

    try {
      // Bakiyeden düş
      await updateUserBalance(user.uid, -gift.price);

      // Hediye siparişini kaydet
      await addDoc(collection(db, 'giftOrders'), {
        userId: user.uid,
        userEmail: userData.email,
        userName: userData.firstName || '',
        userSurname: userData.lastName || '',
        userPhone: userData.phone || '',
        userAddress: userData.address || '',
        giftId: gift.id,
        giftName: gift.name,
        giftPrice: gift.price,
        giftCategory: gift.category,
        status: 'pending', // pending, shipped, delivered
        trackingNumber: '',
        trackingLink: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Hediye satın alındı! 🎉', {
        description: `${gift.name} siparişiniz alındı. Profil sayfanızdan takip edebilirsiniz.`,
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Satın alma başarısız!');
    }
  };

  return (
    <div 
      className="min-h-screen p-8"
      style={{
        backgroundImage: 'url(/images/arkaplan.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="container max-w-7xl mx-auto">
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
              <ShoppingCart className="w-16 h-16" />
              Hediye Market
            </h1>
            <p className="text-white/80 text-xl">
              Kazandığın coinlerle harika hediyeler kazan!
            </p>
          </div>
        </div>

        {/* Bakiye */}
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <div className="flex items-center justify-center gap-3">
            <img src={COIN_IMAGE} alt="Coin" className="w-12 h-12" />
            <div>
              <p className="text-white/70 text-sm">Mevcut Bakiye</p>
              <p className="text-4xl font-bold text-yellow-400">{balance.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-white text-2xl">Hediyeler yüklen iyor...</p>
          </div>
        )}

        {/* Kategoriler */}
        {!loading && (
        <>
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {GIFT_CATEGORIES.map(category => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              className={selectedCategory === category.id 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Hediye Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGifts.map(gift => (
            <Card 
              key={gift.id}
              className={`overflow-hidden bg-white/10 backdrop-blur-sm border-2 transition-all hover:scale-105 ${
                gift.featured 
                  ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
                  : 'border-white/20'
              }`}
            >
              {gift.featured && (
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-center py-1 font-bold text-sm flex items-center justify-center gap-1">
                  <Star className="w-4 h-4" />
                  ÖNE ÇIKAN
                </div>
              )}

              <div className="p-6">
                {/* Hediye Görseli */}
                <div className="w-full h-48 bg-white/5 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  <img 
                    src={gift.image} 
                    alt={gift.name}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      // Görsel yüklenemezse placeholder göster
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('bg-white/10');
                    }}
                  />
                </div>

                {/* Hediye Bilgisi */}
                <h3 className="text-xl font-bold text-white mb-2">{gift.name}</h3>
                <p className="text-white/70 text-sm mb-4">{gift.description}</p>

                {/* Fiyat ve Stok */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <img src={COIN_IMAGE} alt="Coin" className="w-6 h-6" />
                    <span className="text-2xl font-bold text-yellow-400">
                      {gift.price.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-white/50 text-sm">
                    Stok: {gift.stock}
                  </span>
                </div>

                {/* Satın Al Butonu */}
                <Button
                  onClick={() => handlePurchase(gift)}
                  disabled={balance < gift.price || gift.stock === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
                >
                  {gift.stock === 0 ? 'Stokta Yok' : 'Satın Al'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredGifts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/50 text-xl">Bu kategoride henüz hediye yok.</p>
          </div>
        )}
        </>
        )}
      </div>

      {/* Profile Complete Modal */}
      {showProfileModal && user && userData && (
        <ProfileCompleteModal
          userId={user.uid}
          currentData={{
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            address: userData.address,
          }}
          onClose={() => setShowProfileModal(false)}
          onComplete={() => {
            setShowProfileModal(false);
            toast.success('Profil bilgileriniz kaydedildi! Artık hediye satın alabilirsiniz.');
          }}
        />
      )}
    </div>
  );
}
