# Candy Mines - TODO

## Günlük Giriş Streak Bonus
- [x] Her gün giriş yapınca artan bonus (1000→2000→3000...)
- [x] Streak sayacı (kaç gün üst üste giriş)
- [x] Ara verilirse streak sıfırlanır
- [x] Streak bonus modal
- [x] Firestore'da loginStreak takibi

## Admin Dashboard
- [x] Oyuncu davranışları analizi
- [x] Oyun ekonomisi metrikleri
- [x] İstatistik kartları (toplam kullanıcı, aktif kullanıcı, bakiye, kazanma oranı)
- [x] En çok oynayan kullanıcılar
- [x] Ortalama bahis/kazanç istatistikleri
- [x] Toplam coin dağılımı

## Performans Optimizasyonu
- [x] Arka plan parçacık FPS throttling (30 FPS)
- [x] requestAnimationFrame optimizasyonu
- [x] Neon animasyonları kaldırıldı (intense-pulse, float, neon-pulse)
- [x] Canvas shadowBlur kaldırıldı
- [x] animate-bounce kaldırıldı
- [x] useMemo optimizasyonu

## Yayınlama Hazırlığı
- [ ] Firebase Security Rules deployment (firestore.rules dosyası Firebase Console'a yüklenecek)
- [ ] Final test (tüm özellikler test edilecek)
- [ ] Checkpoint kaydet
- [ ] Yayınla

## Acil Bug Düzeltmeleri
- [x] Mayın patladığında bakiye eksi değere düşüyor - increment kullanılarak düzeltildi

## Davet Kazanç Sistemi İyileştirmesi
- [x] Davet eden kişiye bonus artır (100 → 500 coin)
- [x] Davet edilen kişiye bonus artır (50 → 200 coin)

## Hediye Takip Sistemi
- [x] Firestore'da "giftOrders" collection oluştur
- [x] Kullanıcı profil sayfasına "Kazandığım Hediyeler" bölümü ekle (/my-gifts)
- [x] Hediye durumu: Beklemede, Kargoya Verildi, Teslim Edildi
- [x] Admin paneline "Sipariş Talepleri" sekmesi ekle
- [x] Admin hediye taleplerini görebilir (ad, soyad, telefon, adres, hediye)
- [x] Admin kargo numarası ve takip linki ekleyebilir
- [x] Kullanıcı kargo durumunu takip edebilir

## Acil Bug - Hediye Satın Alma
- [x] Hediye satın alındıktan sonra /my-gifts sayfasında görünmüyor - orderBy index hatası düzeltildi

## Profil Bilgisi Zorunluluğu
- [x] Hediye satın almadan önce profil bilgilerini kontrol et (ad, soyad, telefon, adres)
- [x] Eksik bilgi varsa ProfileCompleteModal göster

## Hediye Görselleri ve Admin Yönetimi
- [x] Hediye görselleri oluştur (5 adet profesyonel ürün görseli)
- [x] Admin panelinde hediye ekleme formu (zaten mevcut)
- [x] Admin hediye düzenleme ve silme (zaten mevcut)
- [x] Market sayfasını Firestore'dan dinamik hediye çekecek şekilde güncelle
- [x] Hediye kartlarında gerçek görselleri göster

## Acil Bug - Mobil Beyaz Ekran
- [x] Firebase Analytics try-catch ile sarıldı - mobil hata önlendi
- [x] Global error handler eklendi (main.tsx)
- [x] ErrorBoundary iyileştirildi - Türkçe mesajlar
- [x] Mobil meta tagları eklendi (PWA desteği)

## Acil Bug - Mobil 404 Hatası
- [x] _redirects dosyası eklendi (Netlify/Cloudflare Pages için)
- [x] vercel.json eklendi (Vercel için)
- [x] Tüm route'lar index.html'e yönlendiriliyor

## Acil Bug - Deployment 404 Hatası
- [x] Vite base path './' olarak ayarlandı - relative path kullanılıyor
- [x] Build output kontrol edildi - index.html ve _redirects mevcut

## S3 Dosya Depolama Entegrasyonu (Firebase Korunuyor)
- [x] Firebase bağımlılıklarını geri ekle (firebase, gsap, three)
- [x] S3 dosya depolama helper'ları ekle (server/storage.ts zaten mevcut)
- [x] tRPC upload router ekle (server/uploadRouter.ts)
- [x] Admin hediye ekleme - görsel upload özelliği
- [x] Hediye görselleri S3'te saklanacak
- [x] Firebase + S3 birlikte çalışıyor

## Acil Bug - Manus Deployment 404
- [ ] Build hatası kontrol et
- [ ] Production build test et
- [ ] Deployment sorunu çöz
