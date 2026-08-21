# 🤖 NGL Auto Message Sender

Script otomasi Python untuk mengirim pesan ke anonymous messaging platform NGL secara otomatis.

## 📋 Requirement

- Python 3.7+
- Chrome/Chromium browser
- pip (Python package manager)

## 🚀 Instalasi

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

Atau install manual:
```bash
pip install selenium==4.15.2
pip install webdriver-manager==4.0.1
```

### 2. Verifikasi Chrome Installation
```bash
# Linux/Mac
which google-chrome

# Windows
where chrome.exe
```

## 💻 Cara Menggunakan

### 1. Edit Konfigurasi Script
Buka file `app.py` dan sesuaikan parameter di bagian `main()`:

```python
URL = "https://ngl.link/klz5143"  # Ganti dengan URL NGL Anda
PESAN = "Halo teman"              # Pesan yang ingin dikirim
JUMLAH = 1                         # Berapa kali mengirim
DELAY = 2                          # Delay antar pengiriman (detik)
```

### 2. Jalankan Script
```bash
python app.py
```

### 3. Tunggu Proses Selesai
Script akan:
- Membuka browser Chrome
- Navigate ke URL NGL
- Mengisi form pesan otomatis
- Mengklik tombol Send/Kirim
- Menutup browser

## 📝 Contoh Penggunaan

### Mengirim 1 pesan
```python
kirim_pesan_ngl(
    url="https://ngl.link/klz5143",
    pesan="Halo teman",
    jumlah=1,
    delay=2
)
```

### Mengirim 5 pesan dengan delay 3 detik
```python
kirim_pesan_ngl(
    url="https://ngl.link/klz5143",
    pesan="Halo teman",
    jumlah=5,
    delay=3
)
```

## ⚙️ Parameter Penjelasan

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|-----------|
| `url` | string | - | URL NGL yang dituju (required) |
| `pesan` | string | - | Pesan yang akan dikirim (required) |
| `jumlah` | int | 1 | Jumlah pengiriman berulang |
| `delay` | int | 2 | Delay antar pengiriman (detik) |

## 🔧 Troubleshooting

### Error: "chrome not found"
**Solusi:** Install Google Chrome atau Chromium browser
- Ubuntu/Debian: `sudo apt-get install google-chrome-stable`
- macOS: `brew install google-chrome`
- Windows: Download dari https://www.google.com/chrome/

### Error: "Element not found"
**Solusi:**
1. Pastikan URL NGL benar
2. Tunggu halaman fully loaded
3. Cek struktur HTML dengan inspect element

### Browser tidak menutup otomatis
**Solusi:** Script akan force close browser di akhir eksekusi

## 🎯 Tips & Trik

1. **Test dulu dengan jumlah=1** sebelum mengirim multiple
2. **Gunakan delay minimal 2 detik** untuk menghindari rate limiting
3. **Hapus headless mode** jika ingin melihat proses (uncomment di line yang sesuai)
4. **Monitor behavior** agar tidak dianggap spam

## ⚠️ Disclaimer

- Gunakan script ini sesuai dengan **Terms of Service** NGL
- Jangan gunakan untuk spam atau harassment
- Bertanggung jawab atas penggunaan script ini
- Author tidak bertanggung jawab atas penyalahgunaan

## 📞 Support

Jika ada error, check:
1. Python version: `python --version`
2. Chrome installed: `google-chrome --version`
3. Dependencies installed: `pip list | grep selenium`

## 📄 License

Free to use dan modify untuk keperluan personal.

---
**Happy Messaging! 🎉**
