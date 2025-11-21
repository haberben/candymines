import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Package, Truck, CheckCircle, Clock, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface GiftOrder {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userSurname: string;
  userPhone: string;
  userAddress: string;
  giftName: string;
  giftPrice: number;
  status: 'pending' | 'shipped' | 'delivered';
  trackingNumber: string;
  trackingLink: string;
  createdAt: any;
}

export default function AdminGiftOrders() {
  const [orders, setOrders] = useState<GiftOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingLink, setTrackingLink] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // orderBy kaldırıldı - Firestore index gerektirir
      const ordersSnapshot = await getDocs(collection(db, 'giftOrders'));
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

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'shipped' | 'delivered') => {
    try {
      const orderRef = doc(db, 'giftOrders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
      });

      toast.success('Sipariş durumu güncellendi!');
      await loadOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Durum güncellenemedi!');
    }
  };

  const updateTrackingInfo = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'giftOrders', orderId);
      await updateDoc(orderRef, {
        trackingNumber,
        trackingLink,
        status: 'shipped',
      });

      toast.success('Kargo bilgileri kaydedildi!');
      setEditingOrder(null);
      setTrackingNumber('');
      setTrackingLink('');
      await loadOrders();
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast.error('Kargo bilgileri kaydedilemedi!');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-400" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <Package className="w-5 h-5 text-gray-400" />;
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

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-white text-xl">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <Card className="p-12 bg-white/10 backdrop-blur-sm border-white/20 text-center">
          <Package className="w-24 h-24 text-white/30 mx-auto mb-4" />
          <p className="text-white text-xl">Henüz hediye siparişi yok</p>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="text-xl font-bold text-white">{order.giftName}</h3>
                    <p className="text-white/70 text-sm">
                      {order.createdAt?.toDate().toLocaleDateString('tr-TR')} {order.createdAt?.toDate().toLocaleTimeString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold text-xl">{order.giftPrice.toLocaleString()} coin</p>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Kullanıcı Bilgileri</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/70">Ad Soyad</p>
                    <p className="text-white font-semibold">{order.userName} {order.userSurname}</p>
                  </div>
                  <div>
                    <p className="text-white/70">Email</p>
                    <p className="text-white font-semibold">{order.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-white/70">Telefon</p>
                    <p className="text-white font-semibold">{order.userPhone || 'Belirtilmemiş'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-white/70">Adres</p>
                    <p className="text-white font-semibold">{order.userAddress || 'Belirtilmemiş'}</p>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    onClick={() => updateOrderStatus(order.id, 'pending')}
                    size="sm"
                    variant={order.status === 'pending' ? 'default' : 'outline'}
                    className={order.status === 'pending' 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Beklemede
                  </Button>
                  <Button
                    onClick={() => updateOrderStatus(order.id, 'shipped')}
                    size="sm"
                    variant={order.status === 'shipped' ? 'default' : 'outline'}
                    className={order.status === 'shipped' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }
                  >
                    <Truck className="w-4 h-4 mr-1" />
                    Kargoya Verildi
                  </Button>
                  <Button
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    size="sm"
                    variant={order.status === 'delivered' ? 'default' : 'outline'}
                    className={order.status === 'delivered' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Teslim Edildi
                  </Button>
                </div>

                <Button
                  onClick={() => setEditingOrder(order.id)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Kargo Bilgileri
                </Button>
              </div>

              {/* Tracking Info Edit */}
              {editingOrder === order.id && (
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <h4 className="text-white font-semibold">Kargo Takip Bilgileri</h4>
                  <div className="space-y-2">
                    <Input
                      placeholder="Kargo Takip Numarası"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                    <Input
                      placeholder="Kargo Takip Linki (https://...)"
                      value={trackingLink}
                      onChange={(e) => setTrackingLink(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateTrackingInfo(order.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Kaydet
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingOrder(null);
                        setTrackingNumber('');
                        setTrackingLink('');
                      }}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      İptal
                    </Button>
                  </div>
                </div>
              )}

              {/* Current Tracking Info */}
              {order.trackingNumber && (
                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                  <p className="text-blue-400 font-semibold text-sm mb-1">Mevcut Kargo Bilgileri</p>
                  <p className="text-white text-sm">Takip No: {order.trackingNumber}</p>
                  {order.trackingLink && (
                    <a
                      href={order.trackingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      {order.trackingLink}
                    </a>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
