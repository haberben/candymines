import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface ProfileCompleteModalProps {
  userId: string;
  currentData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
  };
  onClose: () => void;
  onComplete: () => void;
}

export default function ProfileCompleteModal({ userId, currentData, onClose, onComplete }: ProfileCompleteModalProps) {
  const [firstName, setFirstName] = useState(currentData.firstName || '');
  const [lastName, setLastName] = useState(currentData.lastName || '');
  const [phone, setPhone] = useState(currentData.phone || '');
  const [address, setAddress] = useState(currentData.address || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !address.trim()) {
      toast.error('Lütfen tüm alanları doldurun!');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      toast.success('Profil bilgileriniz kaydedildi!');
      onComplete();
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profil güncellenemedi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 bg-white/10 backdrop-blur-sm border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-8 h-8 text-yellow-400" />
          <h3 className="text-2xl font-bold text-white">Profil Bilgilerinizi Tamamlayın</h3>
        </div>

        <p className="text-white/70 mb-6">
          Hediye satın alabilmek için lütfen kargo bilgilerinizi doldurun.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-white text-sm mb-2 block">Ad</label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Adınız"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Soyad</label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Soyadınız"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Telefon</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0555 123 45 67"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Adres</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Tam adresiniz (mahalle, sokak, bina no, daire no, şehir)"
              rows={4}
              className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet ve Devam Et'}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            İptal
          </Button>
        </div>
      </Card>
    </div>
  );
}
