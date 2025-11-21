import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Mail, Phone, MapPin, Save } from 'lucide-react';
import { toast } from 'sonner';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BACKGROUND_IMAGE } from '@/types/slotGame';

export default function Profile() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
      });

      toast.success('Profil güncellendi! ✅');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profil güncellenemedi!');
    } finally {
      setLoading(false);
    }
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
      <div className="container max-w-2xl mx-auto">
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
              <User className="w-16 h-16" />
              Profilim
            </h1>
            <p className="text-white/80 text-xl">
              Kişisel bilgilerinizi güncelleyin
            </p>
          </div>
        </div>

        {/* Profil Formu */}
        <Card className="p-8 bg-white/10 backdrop-blur-sm border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (readonly) */}
            <div>
              <Label className="text-white flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                type="email"
                value={userData?.email || ''}
                disabled
                className="bg-white/5 border-white/20 text-white/50"
              />
              <p className="text-white/50 text-sm mt-1">Email değiştirilemez</p>
            </div>

            {/* Kullanıcı Adı (readonly) */}
            <div>
              <Label className="text-white flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                Kullanıcı Adı
              </Label>
              <Input
                type="text"
                value={userData?.username || ''}
                disabled
                className="bg-white/5 border-white/20 text-white/50"
              />
            </div>

            {/* Ad */}
            <div>
              <Label className="text-white mb-2">Ad</Label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Adınız"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
              />
            </div>

            {/* Soyad */}
            <div>
              <Label className="text-white mb-2">Soyad</Label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Soyadınız"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
              />
            </div>

            {/* Telefon */}
            <div>
              <Label className="text-white flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4" />
                Telefon
              </Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+90 5XX XXX XX XX"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
              />
            </div>

            {/* Adres */}
            <div>
              <Label className="text-white flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" />
                Adres
              </Label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Adresiniz"
                rows={3}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Kaydet Butonu */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
