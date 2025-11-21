import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Package, Upload, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GiftItem } from '@/types/slotGame';

export default function AdminGiftManagement() {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftItem | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'electronics',
    stock: 10,
    image: '',
    featured: false,
  });

  const [uploading, setUploading] = useState(false);
  const uploadMutation = trpc.upload.uploadImage.useMutation();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen bir resim dosyası seçin!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalı!');
      return;
    }

    setUploading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix

        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64Data,
          contentType: file.type,
        });

        setFormData({ ...formData, image: result.url });
        toast.success('Görsel yüklendi!');
      };

      reader.onerror = () => {
        toast.error('Dosya okunamadı!');
        setUploading(false);
      };
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Görsel yüklenemedi!');
    } finally {
      setUploading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingGift) {
        // Güncelleme
        const giftRef = doc(db, 'gifts', editingGift.id);
        await updateDoc(giftRef, formData);
        toast.success('Hediye güncellendi!');
      } else {
        // Yeni ekleme
        await addDoc(collection(db, 'gifts'), formData);
        toast.success('Hediye eklendi!');
      }
      
      resetForm();
      await loadGifts();
    } catch (error) {
      console.error('Error saving gift:', error);
      toast.error('Hediye kaydedilemedi!');
    }
  };

  const handleDelete = async (giftId: string) => {
    if (!confirm('Bu hediyeyi silmek istediğinize emin misiniz?')) return;
    
    try {
      await deleteDoc(doc(db, 'gifts', giftId));
      toast.success('Hediye silindi!');
      await loadGifts();
    } catch (error) {
      console.error('Error deleting gift:', error);
      toast.error('Hediye silinemedi!');
    }
  };

  const handleEdit = (gift: GiftItem) => {
    setEditingGift(gift);
    setFormData({
      name: gift.name,
      description: gift.description,
      price: gift.price,
      category: gift.category,
      stock: gift.stock,
      image: gift.image || '',
      featured: gift.featured || false,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'electronics',
      stock: 10,
      image: '',
      featured: false,
    });
    setEditingGift(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-white text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Package className="w-8 h-8" />
          Hediye Yönetimi
        </h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Hediye Ekle
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingGift ? 'Hediye Düzenle' : 'Yeni Hediye'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm mb-2 block">Hediye Adı</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Fiyat (Coin)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Açıklama</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-white text-sm mb-2 block">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white"
                >
                  <option value="electronics">Elektronik</option>
                  <option value="fashion">Moda</option>
                  <option value="home">Ev & Yaşam</option>
                  <option value="gaming">Oyun</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Stok</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Öne Çıkan
                </label>
              </div>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Görsel</label>
              <div className="space-y-3">
                {/* File Upload */}
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="gift-image-upload"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById('gift-image-upload')?.click()}
                      disabled={uploading}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Yükleniyor...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Görsel Yükle
                        </>
                      )}
                    </Button>
                  </label>
                </div>
                {/* Manual URL Input */}
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="veya URL girin: https://example.com/image.jpg"
                />
                {/* Preview */}
                {formData.image && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-white/5">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-gift.png';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90"
              >
                {editingGift ? 'Güncelle' : 'Ekle'}
              </Button>
              <Button
                type="button"
                onClick={resetForm}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                İptal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Gifts Table */}
      <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-white font-semibold">Hediye</th>
                <th className="text-left py-3 px-4 text-white font-semibold">Kategori</th>
                <th className="text-right py-3 px-4 text-white font-semibold">Fiyat</th>
                <th className="text-right py-3 px-4 text-white font-semibold">Stok</th>
                <th className="text-center py-3 px-4 text-white font-semibold">Durum</th>
                <th className="text-center py-3 px-4 text-white font-semibold">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {gifts.map((gift) => (
                <tr key={gift.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white font-semibold">{gift.name}</p>
                      <p className="text-white/50 text-sm">{gift.description}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/70 capitalize">{gift.category}</td>
                  <td className="py-3 px-4 text-right text-yellow-400 font-bold">
                    {gift.price.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-white">{gift.stock}</td>
                  <td className="py-3 px-4 text-center">
                    {gift.featured && (
                      <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                        ⭐ Öne Çıkan
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        onClick={() => handleEdit(gift)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(gift.id)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {gifts.length === 0 && (
            <div className="text-center py-8 text-white/50">
              Henüz hediye eklenmemiş.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
