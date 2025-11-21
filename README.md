# Candy 3D Icons

**Parlak, lüks ve profesyonel 3D ikonlar - Candy Crush estetiği**

Three.js, GLSL shader'lar ve GSAP animasyonları kullanarak oluşturulmuş, Candy Crush ve Sweet Bonanza estetiğinden esinlenmiş 8 adet 3D ikon seti.

## 🎨 Özellikler

- **GLSL Shader'lar**: Özel fragment shader ile dither efekti ve toon shading
- **Rim Lighting**: Parlak kenar aydınlatması ile lüks görünüm
- **Toon Shading**: 3 seviyeli stylized gölgeleme
- **Bayer Dithering**: 4x4 Bayer matrisi ile bantlanmayı önleme
- **GSAP Animasyonlar**: Smooth idle bob ve rotasyon animasyonları
- **UnrealBloomPass**: Post-processing bloom efekti
- **Candy Renk Paleti**: Vibrant fuchsia, warm gold, cyan ve purple
- **Yüksek Çözünürlük**: 512px - 2048px arası PNG export

## 🎯 İkonlar

1. **Play** - Üçgen play button (Fuchsia)
2. **Shop** - Alışveriş çantası (Warm Gold)
3. **Wallet** - Cüzdan (Cyan)
4. **Quests** - Harita/görev (Purple)
5. **Profile** - Avatar/profil (Fuchsia)
6. **Settings** - Dişli (Warm Gold)
7. **Cash Out** - Para/nakit (Cyan)
8. **Sound** - Ses/hoparlör (Purple)

## 🚀 Kullanım

### Web Arayüzü

1. Projeyi başlatın:
```bash
pnpm install
pnpm dev
```

2. Tarayıcıda açın: `http://localhost:3000`

3. İkon seçin ve istediğiniz boyutta indirin:
   - **512px**: Küçük UI ikonları için
   - **1024px**: Orta boy kullanımlar için
   - **2048px**: Yüksek çözünürlüklü promo görselleri için

4. **Toplu Render**: Tüm ikonları tek seferde 2048px boyutunda indirmek için "Tüm İkonları Render Et" butonunu kullanın.

### Grid Kompozisyon

8 ikonu 2x4 grid düzeninde birleştirmek için:

```bash
# Önce tüm ikonları 2048px boyutunda indirin
# İndirilen dosyalar /home/ubuntu/Downloads klasöründe olacak

# Grid kompozisyonunu oluşturun
python3 create_grid.py
```

Çıktı: `candy_icons_grid_4096x2048.png` (8960x4496px)

## 🎨 Renk Paleti

```typescript
const CANDY_COLORS = {
  fuchsia: '#FF5DA2',    // Primary candy pink
  warmGold: '#FFB347',   // Altın parlaklığı
  cyan: '#39E0C1',       // Taze cyan
  purple: '#7C4DFF',     // Derin mor
  deepPurple: '#2B0B5E', // Arka plan
  rimGold: '#FFD84B',    // Rim highlight
  rimSoft: '#FFF1F6',    // Soft rim
}
```

## 🛠️ Teknik Detaylar

### Shader Sistemi

**Vertex Shader**: Basit position, normal ve UV pass-through

**Fragment Shader**:
- Bayer 4x4 ordered dithering
- 3-level toon ramp (0.33, 0.66, 1.0)
- Fresnel rim lighting
- Blinn-Phong specular highlights
- Luminance-based dithering

### Aydınlatma

- **Key Light**: DirectionalLight (warm white, 1.4 intensity)
- **Fill Light**: DirectionalLight (cool blue, 0.6 intensity)
- **Ambient**: AmbientLight (0.3 intensity)
- **Rim**: Shader-based Fresnel effect

### Post-Processing

```typescript
UnrealBloomPass({
  strength: 0.4,
  radius: 0.6,
  threshold: 0.85
})
```

### Animasyonlar

```typescript
// Idle bob
gsap.to(mesh.position, {
  y: 0.15,
  duration: 1.5,
  yoyo: true,
  repeat: -1,
  ease: 'sine.inOut'
});

// Slow rotation
gsap.to(mesh.rotation, {
  y: Math.PI * 2,
  duration: 20,
  repeat: -1,
  ease: 'none'
});
```

## 📦 Bağımlılıklar

```json
{
  "three": "^0.181.2",
  "gsap": "^3.13.0",
  "lil-gui": "^0.21.0",
  "@types/three": "^0.181.0"
}
```

## 📁 Proje Yapısı

```
candy-3d-icons/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── IconViewer.tsx      # Ana UI komponenti
│   │   ├── lib/
│   │   │   └── IconScene.ts        # Three.js sahne yöneticisi
│   │   ├── shaders/
│   │   │   ├── vertex.glsl         # Vertex shader
│   │   │   └── fragment.glsl       # Fragment shader (dither + toon)
│   │   ├── types/
│   │   │   └── icons.ts            # Tip tanımlamaları
│   │   └── App.tsx
│   └── public/
│       ├── textures/               # Texture dosyaları
│       └── exports/                # Export edilen ikonlar
├── create_grid.py                  # Grid kompozisyon scripti
└── README.md
```

## 🎓 Tasarım İlkeleri

1. **Silhouette Kuralı**: Her ikon 64px'te bile okunabilir
2. **Scale & Spacing**: İç boşluk %20
3. **Readability**: Uzaktan tanınabilir basit şekiller
4. **Lighting**: Key + Fill + Rim (3-point lighting)
5. **Material**: Stylized toon + glossy micro-speculars
6. **Animation**: Subtle idle movements

## 📄 Lisans

Bu proje "Sweet Bonanza" ve "Candy Crush" estetiğinden esinlenmiştir ancak özgün bir çalışmadır. Tüm modeller ve shader'lar sıfırdan oluşturulmuştur.

## 🔗 Teknolojiler

- [Three.js](https://threejs.org/) - 3D rendering
- [GSAP](https://greensock.com/gsap/) - Animasyonlar
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

**Manus AI** tarafından oluşturuldu 🎨✨
