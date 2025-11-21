import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BACKGROUND_IMAGE } from '@/types/slotGame';
import BackgroundParticles from '@/components/BackgroundParticles';
import { toast } from 'sonner';

interface GiftOrder {
  id: string;
  giftName: string;
  giftPrice: number;
  status: 'pending' | 'shipped' | 'delivered';
  trackingNumber: string;
  trackingLink: string;
  createdAt: any;
  updatedAt: any;
}

export default function MyGifts() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<GiftOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      const ordersQuery = query(
        collection(db, 'giftOrders'),
        where('userId', '==', user.uid)
        // orderBy kaldırıldı - Firestore index gerektirir
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as GiftOrder[];

      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Siparişler yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-400" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-blue-400" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      default:
        return <Package className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'shipped':
        return 'Kargoya Verildi';
      case 'delivered':
        return 'Teslim Edildi';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'shipped':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
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

      <div className="container max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Ana Sayfa
          </Button>

          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-4">
              <Package className="w-12 h-12 text-purple-400" />
              Kazandığım Hediyeler
            </h1>
            <p className="text-white/80 text-xl">Hediye siparişlerinizi buradan takip edebilirsiniz</p>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="p-12 bg-white/10 backdrop-blur-sm border-white/20 text-center">
            <Package className="w-24 h-24 text-white/30 mx-auto mb-4" />
            <p className="text-white text-xl mb-2">Henüz hediye siparişiniz yok</p>
            <p className="text-white/70 mb-6">Market'ten hediye satın alarak buradan takip edebilirsiniz</p>
            <Button
              onClick={() => window.location.href = '/market'}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Market'e Git
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {getStatusIcon(order.status)}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{order.giftName}</h3>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <span className="text-white/70 text-sm">
                          {order.createdAt?.toDate().toLocaleDateString('tr-TR')}
                        </span>
                      </div>

                      {/* Tracking Info */}
                      {order.status === 'shipped' && order.trackingNumber && (
                        <div className="bg-white/5 rounded-lg p-4 mt-3">
                          <p className="text-white/70 text-sm mb-2">Kargo Takip Bilgileri</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="text-white font-bold">{order.trackingNumber}</p>
                              {order.trackingLink && (
                                <a
                                  href={order.trackingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mt-1"
                                >
                                  Kargo Takip <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {order.status === 'delivered' && (
                        <div className="bg-green-500/10 rounded-lg p-3 mt-3 border border-green-500/30">
                          <p className="text-green-400 font-semibold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Hediyeniz teslim edildi!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-white/70 text-sm">Fiyat</p>
                    <p className="text-yellow-400 font-bold text-xl">{order.giftPrice.toLocaleString()} coin</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
