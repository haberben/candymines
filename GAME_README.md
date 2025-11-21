# 🍬 Candy Match 3D - Match-3 Oyunu

**Tam fonksiyonel Candy Crush tarzı 3D match-3 oyunu**

Three.js, GLSL shader'lar, GSAP animasyonları ve React ile geliştirilmiş, eksiksiz oyun mekaniği ve 10 seviyeli bir match-3 oyunu.

## 🎮 Oyun Özellikleri

### Temel Mekanikler
- **8x8 Oyun Tahtası**: Klasik match-3 grid sistemi
- **6 Farklı Candy Tipi**: Play, Shop, Wallet, Quests, Profile, Settings
- **Match-3 Sistemi**: Yatay veya dikey 3+ eşleşme
- **Swap Mekaniği**: Komşu candy'leri yer değiştir
- **Cascade Eşleşme**: Zincirleme eşleşmeler otomatik devam eder
- **Gravity Sistemi**: Eşleşen candy'ler kaybolur, üsttekiler düşer
- **Auto-Shuffle**: Hamle kalmadığında tahta otomatik karışır

### Oyun Modları
- **10 Seviye**: Giderek zorlaşan hedefler
- **Hamle Limiti**: Her seviye için sınırlı hamle hakkı
- **Hedef Skor**: Seviye geçmek için ulaşılması gereken skor
- **Yıldız Sistemi**: 1-3 yıldız (100%, 120%, 150% hedef)

### Skor Sistemi
- **3-Match**: 100 puan
- **4-Match**: 200 puan
- **5-Match**: 500 puan
- **Combo Multiplier**: Zincirleme eşleşmelerde x1.5 çarpan

### 3D Görsel Özellikler
- **GLSL Shader'lar**: Özel dither ve toon shading
- **Rim Lighting**: Parlak kenar aydınlatması
- **GSAP Animasyonlar**: 
  - Idle bob (yukarı-aşağı sallanma)
  - Yavaş rotasyon
  - Seçim büyütme efekti
  - Match patlatma animasyonu
- **Candy Renk Paleti**: Vibrant fuchsia, warm gold, cyan, purple

### UI/UX
- **Ana Menü**: Seviye seçimi ve nasıl oynanır
- **Oyun HUD**: Skor, hamle, seviye, combo göstergesi
- **İlerleme Çubuğu**: Hedefe ulaşma yüzdesi
- **Victory Screen**: Yıldız sistemi ve istatistikler
- **Game Over Screen**: Tekrar deneme seçeneği

## 🚀 Nasıl Oynanır?

### Temel Kurallar
1. **Candy Seç**: Bir candy'ye tıkla
2. **Komşu Seç**: Yan, üst, alt veya alttaki komşu candy'ye tıkla
3. **Eşleşme**: 3 veya daha fazla aynı candy yan yana gelirse patlar
4. **Skor Kazan**: Eşleşen candy'ler puan kazandırır
5. **Hedefe Ulaş**: Hamle limitin dolmadan hedef skora ulaş

### İpuçları
- 🎯 **4-5 Match**: Daha fazla candy eşleştir, daha fazla puan kazan
- ⚡ **Combo Yap**: Zincirleme eşleşmelerle combo çarpanı artır
- 🌟 **3 Yıldız**: Hedefin %150'sine ulaşmak için stratejik oyna
- 🔄 **Shuffle**: Hamle kalmadığında tahta otomatik karışır

## 📊 Seviye Detayları

| Seviye | Hedef Skor | Max Hamle | Candy Tipi |
|--------|-----------|-----------|------------|
| 1      | 1,000     | 30        | 4          |
| 2      | 2,000     | 28        | 5          |
| 3      | 3,500     | 26        | 5          |
| 4      | 5,000     | 25        | 6          |
| 5      | 7,000     | 24        | 6          |
| 6      | 10,000    | 22        | 6          |
| 7      | 15,000    | 20        | 6          |
| 8      | 20,000    | 20        | 6          |
| 9      | 30,000    | 18        | 6          |
| 10     | 50,000    | 15        | 6          |

## 🛠️ Teknik Detaylar

### Teknoloji Stack
- **React 19**: UI framework
- **Three.js**: 3D rendering
- **GLSL Shaders**: Custom fragment/vertex shaders
- **GSAP**: Animasyon motoru
- **TypeScript**: Type safety
- **Vitest**: Unit testing

### Oyun Algoritmaları

#### Match Detection
```typescript
// Yatay ve dikey eşleşmeleri bul
function findMatches(board: Cell[][]): Match[]
```

#### Gravity System
```typescript
// Boş hücreleri doldur, yeni candy'ler spawn et
function applyGravity(board: Cell[][], candyTypes: number): Cell[][]
```

#### Shuffle Algorithm
```typescript
// Fisher-Yates shuffle ile tahtayı karıştır
function shuffleBoard(board: Cell[][], candyTypes: number): Cell[][]
```

### Performans
- **60 FPS**: Smooth 3D rendering
- **Optimized Rendering**: Her candy için ayrı mini-scene
- **Efficient State Management**: React hooks ile optimize edilmiş state
- **No Memory Leaks**: Proper cleanup ve dispose

## 🧪 Test Coverage

```bash
pnpm vitest run
```

**17 Test Passed**:
- ✅ Board creation
- ✅ Match detection (horizontal/vertical)
- ✅ Adjacent cell validation
- ✅ Cell swapping
- ✅ Score calculation
- ✅ Combo multiplier

## 📁 Proje Yapısı

```
client/src/
├── components/
│   ├── Candy3D.tsx           # 3D candy render komponenti
│   └── GameBoard.tsx         # Ana oyun tahtası
├── pages/
│   └── Game.tsx              # Oyun sayfası (menü, oyun, sonuç)
├── lib/
│   ├── gameLogic.ts          # Oyun algoritmaları
│   └── gameLogic.test.ts     # Unit testler
├── types/
│   ├── game.ts               # Oyun type tanımları
│   └── icons.ts              # Icon/candy type tanımları
└── shaders/
    ├── vertex.glsl           # Vertex shader
    └── fragment.glsl         # Fragment shader (dither + toon)
```

## 🎯 Gelecek Özellikler

### Planlanan
- [ ] **Ses Efektleri**: Match, swap, combo sesleri
- [ ] **Arka Plan Müziği**: Seviye müziği
- [ ] **Power-ups**: Bomba, çizgi temizleyici
- [ ] **Hint Sistemi**: Eşleşme önerisi
- [ ] **Pause Menüsü**: Oyunu duraklat
- [ ] **LocalStorage**: İlerleme kaydetme
- [ ] **Particle Effects**: Match patlaması parçacıkları
- [ ] **Leaderboard**: Skor tablosu
- [ ] **Daily Challenge**: Günlük zorluklar

### Gelişmiş Özellikler
- [ ] **Special Candies**: 4-match → çizgi temizleyici, 5-match → bomba
- [ ] **Objectives**: Belirli candy'leri topla
- [ ] **Obstacles**: Taş, buz gibi engeller
- [ ] **Boosters**: Oyun içi yardımcılar
- [ ] **Multiplayer**: Online rekabet modu

## 🎨 Tasarım Felsefesi

Bu oyun, **Candy Crush** ve **Sweet Bonanza** estetiğinden esinlenerek tasarlanmıştır:

- **Parlak Renkler**: Vibrant candy renkleri
- **Lüks Hissi**: Rim lighting ve bloom efektleri
- **Smooth Animasyonlar**: GSAP ile akıcı geçişler
- **Toon Shading**: Stylized 3D görünüm
- **Dither Efekti**: Retro candy hissi

## 📄 Lisans

Bu proje özgün bir çalışmadır. Tüm 3D modeller, shader'lar ve oyun mekaniği sıfırdan geliştirilmiştir.

---

**Oyunu Başlat**: Ana sayfada seviye seç ve oynamaya başla! 🎮✨
