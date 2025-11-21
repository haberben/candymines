#!/usr/bin/env python3
"""
2x4 Grid kompozisyonu oluşturucu
8 ikonu 2x4 grid'de birleştirip etiketlerle birlikte tek bir PNG dosyası oluşturur
"""

from PIL import Image, ImageDraw, ImageFont
import os
import sys

# İkon yapılandırması
ICONS = [
    {'name': 'play', 'label': 'Play', 'color': '#FF5DA2'},
    {'name': 'shop', 'label': 'Shop', 'color': '#FFB347'},
    {'name': 'wallet', 'label': 'Wallet', 'color': '#39E0C1'},
    {'name': 'quests', 'label': 'Quests', 'color': '#7C4DFF'},
    {'name': 'profile', 'label': 'Profile', 'color': '#FF5DA2'},
    {'name': 'settings', 'label': 'Settings', 'color': '#FFB347'},
    {'name': 'cash_out', 'label': 'Cash Out', 'color': '#39E0C1'},
    {'name': 'sound', 'label': 'Sound', 'color': '#7C4DFF'},
]

# Grid ayarları
ICON_SIZE = 2048
GRID_COLS = 4
GRID_ROWS = 2
PADDING = 100
LABEL_HEIGHT = 120
LABEL_FONT_SIZE = 72

# Toplam boyutlar
CELL_WIDTH = ICON_SIZE
CELL_HEIGHT = ICON_SIZE + LABEL_HEIGHT
GRID_WIDTH = (CELL_WIDTH * GRID_COLS) + (PADDING * (GRID_COLS + 1))
GRID_HEIGHT = (CELL_HEIGHT * GRID_ROWS) + (PADDING * (GRID_ROWS + 1))

def hex_to_rgb(hex_color):
    """Hex rengi RGB tuple'a çevir"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_grid_composition(input_dir, output_path):
    """2x4 grid kompozisyonu oluştur"""
    
    # Gradient arka plan oluştur
    background = Image.new('RGB', (GRID_WIDTH, GRID_HEIGHT), color='#35105A')
    draw = ImageDraw.Draw(background)
    
    # Gradient efekti (basit)
    for y in range(GRID_HEIGHT):
        ratio = y / GRID_HEIGHT
        r1, g1, b1 = hex_to_rgb('#35105A')
        r2, g2, b2 = hex_to_rgb('#5B0EC8')
        r = int(r1 + (r2 - r1) * ratio)
        g = int(g1 + (g2 - g1) * ratio)
        b = int(b1 + (b2 - b1) * ratio)
        draw.rectangle([(0, y), (GRID_WIDTH, y + 1)], fill=(r, g, b))
    
    # Font yükle (sistem fontlarını dene)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", LABEL_FONT_SIZE)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", LABEL_FONT_SIZE)
        except:
            font = ImageFont.load_default()
    
    # Her ikonu yerleştir
    for idx, icon_config in enumerate(ICONS):
        row = idx // GRID_COLS
        col = idx % GRID_COLS
        
        # İkon dosyası yolu
        icon_path = os.path.join(input_dir, f"icon_{icon_config['name']}_2048.png")
        
        if not os.path.exists(icon_path):
            print(f"Uyarı: {icon_path} bulunamadı, atlanıyor...")
            continue
        
        # İkonu yükle
        icon_img = Image.open(icon_path).convert('RGBA')
        
        # İkon pozisyonu hesapla
        x = PADDING + (col * (CELL_WIDTH + PADDING))
        y = PADDING + (row * (CELL_HEIGHT + PADDING))
        
        # İkonu yapıştır (alpha channel ile)
        background.paste(icon_img, (x, y), icon_img)
        
        # Label pozisyonu
        label_y = y + ICON_SIZE + 20
        
        # Label metni
        label_text = icon_config['label']
        
        # Metin boyutunu hesapla
        bbox = draw.textbbox((0, 0), label_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Metni ortala
        text_x = x + (ICON_SIZE - text_width) // 2
        text_y = label_y
        
        # Gölge efekti (çoklu katman)
        shadow_offset = 4
        for offset in range(shadow_offset, 0, -1):
            alpha = int(255 * 0.3 * (1 - offset / shadow_offset))
            shadow_color = (0, 0, 0, alpha)
            # PIL'in textbbox RGBA desteklemediği için sadece RGB kullanıyoruz
            draw.text((text_x + offset, text_y + offset), label_text, 
                     fill=(0, 0, 0), font=font)
        
        # Ana metin (beyaz)
        draw.text((text_x, text_y), label_text, fill='#FFFFFF', font=font)
    
    # Kaydet
    background.save(output_path, 'PNG', quality=95)
    print(f"Grid kompozisyonu oluşturuldu: {output_path}")
    print(f"Boyut: {GRID_WIDTH}x{GRID_HEIGHT}px")

if __name__ == '__main__':
    # Varsayılan yollar
    input_dir = '/home/ubuntu/Downloads'
    output_path = '/home/ubuntu/Downloads/candy_icons_grid_4096x2048.png'
    
    if len(sys.argv) > 1:
        input_dir = sys.argv[1]
    if len(sys.argv) > 2:
        output_path = sys.argv[2]
    
    print(f"İkon klasörü: {input_dir}")
    print(f"Çıktı dosyası: {output_path}")
    print(f"Grid boyutu: {GRID_COLS}x{GRID_ROWS}")
    print()
    
    create_grid_composition(input_dir, output_path)
