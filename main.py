from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time

def kirim_pesan_ngl(url, pesan, jumlah=1, delay=2):
    """
    Fungsi untuk mengirim pesan otomatis ke NGL
    
    Parameters:
    - url: URL NGL (contoh: https://ngl.link/klz5143)
    - pesan: Pesan yang ingin dikirim (contoh: "Halo teman")
    - jumlah: Berapa kali pesan dikirim (default: 1)
    - delay: Delay antar pengiriman dalam detik (default: 2)
    """
    
    # Setup Chrome options
    chrome_options = Options()
    # Uncomment baris dibawah jika ingin menjalankan headless (tanpa GUI)
    # chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        for i in range(jumlah):
            print(f"[{i+1}/{jumlah}] Membuka halaman NGL...")
            driver.get(url)
            
            # Wait untuk halaman load
            time.sleep(2)
            
            # Cari input field untuk pesan
            print(f"[{i+1}/{jumlah}] Mencari kolom input pesan...")
            try:
                # Tunggu input field muncul
                input_field = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "textarea"))
                )
                
                # Klik pada input field
                input_field.click()
                time.sleep(0.5)
                
                # Ketik pesan
                print(f"[{i+1}/{jumlah}] Mengetik pesan: '{pesan}'")
                input_field.clear()
                input_field.send_keys(pesan)
                time.sleep(1)
                
                # Cari dan klik tombol Send/Kirim
                print(f"[{i+1}/{jumlah}] Mencari tombol Send...")
                send_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Send') or contains(text(), 'Kirim')]"))
                )
                
                print(f"[{i+1}/{jumlah}] Mengklik tombol Send...")
                send_button.click()
                time.sleep(1)
                
                print(f"[{i+1}/{jumlah}] ✓ Pesan berhasil dikirim!")
                
                # Delay sebelum pengiriman berikutnya (jika jumlah > 1)
                if i < jumlah - 1:
                    print(f"Menunggu {delay} detik sebelum pengiriman berikutnya...")
                    time.sleep(delay)
                    
            except Exception as e:
                print(f"[{i+1}/{jumlah}] ✗ Error: {str(e)}")
                print("Pastikan:")
                print("- URL NGL benar")
                print("- Halaman sudah fully loaded")
                print("- Chrome/Chromium terinstall")
                
    finally:
        print("\nMenutup browser...")
        driver.quit()
        print("Selesai!")

def main():
    """
    Main function - Sesuaikan parameter di sini
    """
    
    # ===== KONFIGURASI =====
    URL = "https://ngl.link/klz5143"  # Ganti dengan URL NGL Anda
    PESAN = "Halo teman"              # Pesan yang ingin dikirim
    JUMLAH = 1                         # Berapa kali mengirim (1-10)
    DELAY = 2                          # Delay antar pengiriman (detik)
    # ===== END KONFIGURASI =====
    
    print("=" * 50)
    print("🤖 NGL Auto Message Sender")
    print("=" * 50)
    print(f"URL: {URL}")
    print(f"Pesan: '{PESAN}'")
    print(f"Jumlah pengiriman: {JUMLAH}")
    print(f"Delay: {DELAY} detik")
    print("=" * 50)
    print()
    
    # Jalankan fungsi
    kirim_pesan_ngl(URL, PESAN, JUMLAH, DELAY)

if __name__ == "__main__":
    main()
