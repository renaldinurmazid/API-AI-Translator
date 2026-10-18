# Product Requirements Document (PRD)

## Floating AI Translator

**Versi:** 1.0\
**Status:** Draft untuk implementasi MVP\
**Tanggal:** 18 Oktober 2026\
**Platform awal:** Android\
**Nama produk:** Floating AI Translator (nama kerja)

------------------------------------------------------------------------

## 1. Ringkasan Produk

Floating AI Translator adalah aplikasi Android yang membantu pengguna
memahami pesan suara atau audio dalam bahasa asing tanpa harus
menerjemahkan secara manual. Aplikasi menyediakan pengalaman
penerjemahan melalui antarmuka yang mudah diakses, termasuk floating
bubble yang dapat dibuka di atas aplikasi lain pada Android.

Untuk MVP, pengguna dapat mengimpor atau membagikan file audio/voice
note ke aplikasi, mendapatkan transkrip dan terjemahan, lalu meminta AI
membuat beberapa saran balasan dalam bahasa lawan bicara. Pengguna dapat
memilih gaya balasan, menyalin teks, dan mengirimkannya sendiri melalui
aplikasi komunikasi pilihan.

**Prinsip utama:** terjemahan harus mudah dipahami, saran balasan harus
bisa diedit atau dipilih pengguna, dan aplikasi tidak boleh mengirim
pesan secara otomatis.

### 1.1 Masalah yang ingin diselesaikan

-   Pengguna kesulitan memahami voice note atau audio berbahasa asing.
-   Pengguna harus berpindah aplikasi dan menyalin teks secara manual
    untuk menerjemahkannya.
-   Setelah memahami pesan, pengguna sering kesulitan menyusun balasan
    dalam bahasa lawan bicara.
-   Pengguna membutuhkan alur yang cepat, sederhana, dan bisa digunakan
    sambil tetap beraktivitas di aplikasi lain.

### 1.2 Solusi

Aplikasi menyediakan satu alur terintegrasi:

1.  Pengguna memilih atau membagikan audio.
2.  Sistem mentranskripsikan ucapan menjadi teks.
3.  Sistem mendeteksi bahasa sumber jika memungkinkan dan menerjemahkan
    ke bahasa tujuan.
4.  Pengguna melihat teks asli dan terjemahan.
5.  AI menghasilkan hingga tiga alternatif balasan yang relevan.
6.  Pengguna memilih gaya balasan, menyalin atau mengedit teks, lalu
    mengirimkannya secara manual.

------------------------------------------------------------------------

## 2. Tujuan dan Indikator Keberhasilan

### 2.1 Tujuan MVP

-   Memvalidasi bahwa pengguna membutuhkan terjemahan audio yang
    disertai saran balasan.
-   Menyediakan alur voice note-to-translation-to-reply yang bisa
    digunakan dari awal hingga akhir.
-   Menguji pengalaman floating bubble di Android tanpa menjanjikan
    akses universal ke audio aplikasi lain atau panggilan telepon.
-   Mengontrol biaya AI dan menjaga data audio pengguna.

### 2.2 Metrik keberhasilan awal

Target berikut adalah sasaran validasi awal, bukan hasil yang sudah
terbukti:

-   ≥ 80% sesi pemrosesan audio yang valid berhasil menghasilkan
    transkrip dan terjemahan.
-   ≥ 60% sesi terjemahan yang berhasil membuka atau menghasilkan saran
    balasan.
-   ≥ 30% sesi saran balasan menghasilkan setidaknya satu tindakan
    salin.
-   Waktu pemrosesan audio 1 menit ditargetkan selesai dalam ≤ 30 detik
    pada kondisi jaringan yang baik; hasil aktual bergantung pada
    provider, panjang audio, dan antrean layanan.
-   Crash-free sessions ≥ 99% selama pengujian beta.
-   Pengguna dapat menemukan fungsi impor audio dan memulai terjemahan
    tanpa panduan eksternal.

Metrik harus dilengkapi dengan pengukuran latensi, tingkat kegagalan
provider, biaya per menit audio, dan umpan balik kualitas terjemahan.

------------------------------------------------------------------------

## 3. Target Pengguna dan Skenario

### 3.1 Target pengguna

-   Pengguna yang menerima voice note dalam bahasa asing.
-   Pelajar bahasa yang ingin memahami pesan informal.
-   Pengguna yang berkomunikasi dengan teman, pelanggan, rekan kerja,
    atau komunitas lintas bahasa.
-   Pengguna yang ingin menyusun balasan dalam bahasa asing tanpa harus
    menulis dari nol.

### 3.2 Contoh skenario

**Skenario A --- Memahami voice note** 1. Pengguna menerima voice note
berbahasa Inggris. 2. Pengguna membagikan audio ke Floating AI
Translator. 3. Aplikasi menampilkan transkrip Inggris dan terjemahan
Indonesia. 4. Pengguna memutar audio kembali jika diperlukan.

**Skenario B --- Menyusun balasan** 1. Setelah terjemahan tampil,
pengguna menekan "Buat saran balasan". 2. AI memberikan hingga tiga
pilihan, misalnya: menerima, meminta waktu untuk memastikan, dan menolak
dengan sopan. 3. Pengguna memilih gaya: Santai, Sopan, atau Profesional.
4. Pengguna menyalin balasan dalam bahasa sumber/lawan bicara. 5.
Pengguna berpindah kembali ke aplikasi chat dan mengirim pesan secara
manual.

**Skenario C --- Menggunakan floating bubble** 1. Pengguna memberi izin
"Display over other apps". 2. Floating bubble muncul saat layanan
diaktifkan. 3. Pengguna mengetuk bubble untuk membuka panel ringkas. 4.
Panel menyediakan akses ke impor audio, riwayat, dan pengaturan. 5.
Pengguna dapat menutup bubble atau menghentikan layanan kapan saja.

------------------------------------------------------------------------

## 4. Ruang Lingkup Produk

### 4.1 Termasuk dalam MVP

1.  Onboarding dan penjelasan izin.
2.  Pemilihan bahasa tujuan.
3.  Impor audio dari penyimpanan perangkat.
4.  Penerimaan audio melalui Android Sharesheet/intent jika format dan
    sumber mendukung.
5.  Validasi format, ukuran, dan durasi audio.
6.  Speech-to-text melalui layanan API.
7.  Deteksi bahasa sumber otomatis jika didukung provider, dengan opsi
    pemilihan manual.
8.  Terjemahan transkrip.
9.  Tampilan teks asli dan hasil terjemahan.
10. Pembuatan hingga tiga saran balasan AI.
11. Pilihan gaya balasan: Santai, Sopan, Profesional.
12. Salin teks transkrip, terjemahan, atau saran balasan.
13. Text-to-speech untuk membacakan teks jika bahasa dan perangkat
    mendukung.
14. Riwayat pemrosesan dengan opsi menghapus item.
15. Floating bubble dan panel overlay untuk akses cepat.
16. Status pemrosesan, penanganan error, retry, dan batas pemakaian
    dasar.
17. Penjelasan privasi serta kontrol penghapusan data.

### 4.2 Tidak termasuk dalam MVP

-   Penerjemahan panggilan telepon seluler secara universal dan
    real-time.
-   Mengakses audio internal dari semua aplikasi lain tanpa batasan.
-   Mengirim balasan otomatis ke WhatsApp, Telegram, SMS, atau aplikasi
    lain.
-   Membaca semua notifikasi atau pesan pengguna secara otomatis.
-   Kloning suara atau meniru suara orang lain.
-   Pelatihan model AI sendiri.
-   Sinkronisasi riwayat lintas perangkat.
-   Kolaborasi multi-pengguna atau fitur tim.
-   Paket berlangganan dan sistem pembayaran penuh, kecuali diperlukan
    untuk eksperimen bisnis berikutnya.
-   Jaminan bahwa semua bahasa, dialek, format file, atau kondisi audio
    akan dikenali dengan sempurna.

### 4.3 Tahap berikutnya

-   Mode live translation dengan audio streaming.
-   Dukungan mode percakapan dua arah.
-   Integrasi yang diizinkan dengan layanan komunikasi tertentu.
-   Pemrosesan lokal/offline untuk model dan bahasa yang memungkinkan.
-   Paket kuota atau berlangganan.
-   Favorit, kamus pribadi, dan penyesuaian gaya balasan.

------------------------------------------------------------------------

## 5. Alur Pengguna dan Navigasi

### 5.1 Navigasi utama

-   **Beranda:** pilih audio, buka hasil terbaru, mulai terjemahan.
-   **Hasil terjemahan:** transkrip, terjemahan, pemutar audio, saran
    balasan.
-   **Riwayat:** daftar pemrosesan sebelumnya.
-   **Pengaturan:** bahasa tujuan, bahasa sumber default, preferensi
    suara, privasi, izin overlay, penghapusan data, dan informasi
    aplikasi.

### 5.2 Alur pertama kali

1.  Pengguna membuka aplikasi.
2.  Aplikasi menjelaskan fungsi utama dan batasan audio.
3.  Pengguna memilih bahasa tujuan (default awal dapat berupa Bahasa
    Indonesia, tetapi harus dapat diubah).
4.  Aplikasi meminta izin mikrofon hanya saat fitur yang memerlukannya
    benar-benar digunakan.
5.  Aplikasi menjelaskan izin overlay dan meminta pengguna
    mengaktifkannya secara eksplisit jika ingin menggunakan floating
    bubble.
6.  Pengguna dapat melewati aktivasi bubble dan tetap memakai fitur
    impor audio.

### 5.3 Alur impor audio

1.  Pengguna menekan "Pilih audio" atau membagikan file dari aplikasi
    lain.
2.  Aplikasi memvalidasi tipe file, ukuran, dan durasi.
3.  Pengguna mengonfirmasi bahasa sumber atau memilih deteksi otomatis.
4.  Aplikasi mengunggah audio dengan koneksi aman ke backend.
5.  Backend memproses audio melalui STT.
6.  Backend menerjemahkan transkrip ke bahasa tujuan.
7.  Hasil ditampilkan; pengguna dapat meminta saran balasan.
8.  Hasil disimpan sesuai preferensi riwayat dan kebijakan retensi.

### 5.4 Alur saran balasan

1.  Pengguna membuka bagian "Saran balasan".
2.  Aplikasi menyediakan gaya Santai, Sopan, dan Profesional.
3.  Backend mengirim teks asli, bahasa sumber, bahasa tujuan, konteks
    yang relevan, dan instruksi gaya ke LLM.
4.  AI menghasilkan hingga tiga alternatif yang berbeda secara tujuan,
    bukan sekadar variasi kata.
5.  Setiap alternatif ditampilkan bersama terjemahan penjelas dalam
    bahasa pengguna bila berguna.
6.  Pengguna dapat menyalin atau mengedit teks.
7.  Aplikasi tidak mengirim pesan secara otomatis.

Jika pesan sumber tidak cukup jelas untuk menentukan niat, saran harus
mencakup opsi meminta klarifikasi dan tidak boleh mengasumsikan fakta
seperti ketersediaan, persetujuan, harga, atau janji pengguna.

------------------------------------------------------------------------

## 6. Persyaratan Fungsional

Prioritas: **P0** = wajib untuk MVP, **P1** = penting tetapi dapat
menyusul, **P2** = pasca-MVP.

  ------------------------------------------------------------------------------
  ID                Fitur               Prioritas         Kriteria penerimaan
  ----------------- ------------------- ----------------- ----------------------
  FR-01             Pilih/impor audio   P0                Pengguna dapat memilih
                                                          file audio yang
                                                          didukung dan melihat
                                                          nama file sebelum
                                                          memproses.

  FR-02             Berbagi audio ke    P0                Aplikasi dapat
                    aplikasi                              menerima URI file
                                                          melalui Android
                                                          Sharesheet/intent jika
                                                          sumber menyediakan
                                                          akses yang sah.

  FR-03             Validasi file       P0                File tidak didukung,
                                                          kosong, terlalu besar,
                                                          atau terlalu panjang
                                                          ditolak dengan pesan
                                                          yang jelas.

  FR-04             Transkripsi audio   P0                Audio yang valid
                                                          menghasilkan teks atau
                                                          status error yang
                                                          dapat dipahami.

  FR-05             Deteksi/pemilihan   P0                Bahasa dapat dideteksi
                    bahasa sumber                         bila didukung;
                                                          pengguna dapat memilih
                                                          bahasa secara manual
                                                          jika hasil deteksi
                                                          salah.

  FR-06             Terjemahan teks     P0                Transkrip
                                                          diterjemahkan ke
                                                          bahasa tujuan yang
                                                          dipilih.

  FR-07             Tampilan bilingual  P0                Teks asli dan
                                                          terjemahan terlihat
                                                          terpisah dan mudah
                                                          dibandingkan.

  FR-08             Saran balasan AI    P0                Pengguna dapat
                                                          menghasilkan hingga
                                                          tiga saran yang
                                                          relevan berdasarkan
                                                          pesan sumber.

  FR-09             Gaya balasan        P0                Pengguna dapat memilih
                                                          Santai, Sopan, atau
                                                          Profesional sebelum
                                                          menghasilkan saran.

  FR-10             Salin teks          P0                Pengguna dapat
                                                          menyalin transkrip,
                                                          terjemahan, atau satu
                                                          saran balasan.

  FR-11             Edit saran          P1                Pengguna dapat
                                                          mengubah teks saran
                                                          sebelum menyalinnya.

  FR-12             Text-to-speech      P1                Pengguna dapat meminta
                                                          perangkat/layanan
                                                          membaca terjemahan
                                                          bila suara bahasa
                                                          tersebut tersedia.

  FR-13             Floating bubble     P0                Bubble dapat
                                                          diaktifkan/dimatikan
                                                          dengan izin Android
                                                          yang sesuai dan tidak
                                                          memblokir penggunaan
                                                          aplikasi lain.

  FR-14             Panel overlay       P0                Mengetuk bubble
                                                          membuka panel ringkas
                                                          dengan akses ke fungsi
                                                          utama.

  FR-15             Riwayat             P1                Pengguna dapat melihat
                                                          hasil sebelumnya dan
                                                          menghapus item.

  FR-16             Error dan retry     P0                Gangguan
                                                          jaringan/provider
                                                          menampilkan pesan dan
                                                          opsi mencoba lagi.

  FR-17             Penghapusan data    P0                Pengguna dapat
                                                          menghapus hasil
                                                          tersimpan; kebijakan
                                                          penghapusan data
                                                          backend dijelaskan.

  FR-18             Kontrol biaya/kuota P0                Backend membatasi
                                                          ukuran, durasi,
                                                          frekuensi permintaan,
                                                          dan penggunaan per
                                                          akun/perangkat sesuai
                                                          kebijakan produk.

  FR-19             Status pemrosesan   P0                UI menampilkan status
                                                          mengunggah,
                                                          mentranskripsi,
                                                          menerjemahkan, membuat
                                                          saran, selesai, atau
                                                          gagal.

  FR-20             Live call           P2                Tidak diklaim sebagai
                    translation                           kemampuan MVP.
  ------------------------------------------------------------------------------

------------------------------------------------------------------------

## 7. Persyaratan Nonfungsional

### 7.1 Kinerja

-   UI tetap responsif saat audio diunggah dan diproses.
-   Pemrosesan berjalan secara asynchronous dan dapat dibatalkan bila
    memungkinkan.
-   Target awal pemrosesan audio 1 menit adalah ≤ 30 detik pada jaringan
    dan provider yang memadai; ini perlu divalidasi melalui pengujian.
-   Saran balasan ditampilkan segera setelah respons LLM diterima; UI
    harus menyediakan loading state.
-   Batas durasi dan ukuran file harus dapat diatur melalui konfigurasi
    backend.

### 7.2 Keandalan

-   Error dari provider eksternal dipetakan menjadi pesan yang mudah
    dimengerti.
-   Retry tidak boleh menyebabkan pemrosesan atau tagihan ganda tanpa
    disengaja.
-   Permintaan memiliki ID untuk pelacakan dan idempotensi bila relevan.
-   Kegagalan satu tahap tidak boleh membuat UI terus menampilkan
    loading tanpa akhir.

### 7.3 Keamanan dan privasi

-   Semua komunikasi client-server menggunakan HTTPS/TLS.
-   API key provider hanya disimpan di backend, tidak di aplikasi
    Android.
-   Audio tidak disimpan permanen kecuali benar-benar diperlukan dan
    dijelaskan kepada pengguna.
-   Terapkan kebijakan retensi audio dan transkrip yang eksplisit;
    default yang disarankan adalah menghapus file audio sementara
    setelah pemrosesan selesai atau setelah periode singkat yang
    ditetapkan.
-   Riwayat lokal dapat dihapus oleh pengguna.
-   Jangan merekam audio latar belakang tanpa tindakan dan izin yang
    jelas.
-   Indikator harus menjelaskan saat mikrofon atau layanan terkait
    aktif.
-   Izin overlay, mikrofon, dan notifikasi dijelaskan berdasarkan fungsi
    yang membutuhkannya.
-   Jangan mengumpulkan isi audio untuk analitik produk secara default.
-   Log tidak boleh menyimpan audio mentah, token akses, API key, atau
    isi percakapan lengkap tanpa kebutuhan yang sah.
-   Sediakan kebijakan privasi dan mekanisme kontak untuk permintaan
    penghapusan data.
-   Evaluasi persyaratan Google Play terkait foreground service, izin,
    pengungkapan penggunaan data, dan deklarasi aplikasi sebelum
    publikasi.

### 7.4 Kompatibilitas

-   MVP menargetkan Android terlebih dahulu.
-   Versi minimum Android ditetapkan setelah pengujian library,
    foreground service, dan overlay; target awal yang masuk akal adalah
    Android 10/API 29 atau lebih tinggi, dengan verifikasi khusus
    terhadap perangkat yang akan didukung.
-   Perilaku overlay dan manajemen baterai dapat berbeda antar-vendor.
-   iOS tidak termasuk dalam MVP karena pembatasan sistem terhadap
    overlay lintas aplikasi.

### 7.5 Aksesibilitas dan kegunaan

-   Tombol utama memiliki label yang jelas.
-   Kontras teks memadai.
-   Pengguna dapat mengubah bahasa tujuan tanpa mengulang onboarding.
-   Bubble tidak menutupi kontrol penting dan dapat dipindahkan atau
    ditutup.
-   Hasil terjemahan dapat disalin tanpa harus memilih teks secara
    manual.

------------------------------------------------------------------------

## 8. Arsitektur Teknis

### 8.1 Komponen

**Android client** - Kotlin - Jetpack Compose untuk UI utama - Android
Service/foreground service sesuai kebutuhan implementasi dan kebijakan
platform - `SYSTEM_ALERT_WINDOW` untuk overlay setelah pengguna memberi
izin - Android Sharesheet dan intent untuk menerima file audio - Media
player dan Android TextTo-Speech jika sesuai - Penyimpanan lokal untuk
preferensi dan riwayat yang dipilih pengguna

**Backend** - NestJS/Node.js atau FastAPI/Python - REST API untuk
autentikasi, unggah audio, status pekerjaan, hasil terjemahan, dan saran
balasan - Queue/background worker untuk pekerjaan audio yang lama bila
diperlukan - Database PostgreSQL untuk akun, preferensi, metadata
pekerjaan, dan riwayat yang diizinkan - Penyimpanan objek sementara
hanya bila dibutuhkan, dengan URL berumur pendek dan kebijakan
penghapusan - Integrasi provider STT, translation, dan LLM melalui
adapter agar provider dapat diganti

**Provider AI** - Speech-to-text: provider yang mendukung bahasa target
dan kebutuhan audio - Translation: API penerjemahan atau LLM sesuai
kualitas, harga, dan latensi - Reply generation: LLM yang menerima
instruksi terstruktur dan menghasilkan JSON tervalidasi - TTS: Android
TTS atau provider cloud bila diperlukan

### 8.2 Diagram alur data

``` text
Android App
   |
   | HTTPS: metadata + upload audio
   v
Backend API
   |
   +--> Validasi file, auth, kuota
   |
   +--> Speech-to-Text Provider
   |       |
   |       v
   |    Transkrip + bahasa sumber
   |
   +--> Translation Provider
   |       |
   |       v
   |    Terjemahan
   |
   +--> LLM Reply Generation (atas permintaan pengguna)
   |       |
   |       v
   |    Maksimal 3 saran balasan
   |
   v
Hasil terstruktur
   |
   v
Android UI / Floating Panel
```

### 8.3 Prinsip desain backend

-   Provider AI diakses melalui interface/adaptor internal, bukan
    langsung dari aplikasi.
-   Validasi ukuran, MIME type, durasi, bahasa, dan kuota dilakukan di
    backend.
-   Hasil setiap tahap disimpan seperlunya untuk menghindari pengulangan
    pemrosesan.
-   Gunakan timeout, retry terbatas, dan pencatatan error yang tidak
    membocorkan isi percakapan.
-   Sediakan konfigurasi untuk memilih provider, model, batas audio, dan
    batas token.
-   Pisahkan proses transkripsi, penerjemahan, dan pembuatan saran agar
    pengguna dapat meminta saran balasan tanpa mengulang STT.

------------------------------------------------------------------------

## 9. Desain API Awal

Contoh endpoint REST. Format final perlu disesuaikan dengan implementasi
dan provider yang dipilih.

### 9.1 Membuat pekerjaan terjemahan

`POST /api/v1/translations`

Request: `multipart/form-data`

-   `audio`: file audio
-   `source_language`: opsional, kode bahasa
-   `target_language`: wajib, kode bahasa
-   `generate_reply_suggestions`: boolean, default `false`

Respons contoh:

``` json
{
  "job_id": "tr_123",
  "status": "queued"
}
```

### 9.2 Memeriksa status dan hasil

`GET /api/v1/translations/{job_id}`

Respons selesai contoh:

``` json
{
  "job_id": "tr_123",
  "status": "completed",
  "source_language": "en",
  "target_language": "id",
  "transcript": "Could you send me the document before tomorrow morning?",
  "translation": "Bisakah kamu mengirimkan dokumennya sebelum besok pagi?",
  "duration_seconds": 18,
  "created_at": "2026-10-18T08:00:00Z"
}
```

### 9.3 Membuat saran balasan

`POST /api/v1/translations/{job_id}/reply-suggestions`

Request:

``` json
{
  "tone": "casual",
  "count": 3,
  "reply_language": "en",
  "include_localized_explanation": true
}
```

Respons contoh:

``` json
{
  "suggestions": [
    {
      "id": "reply_1",
      "intent": "accept",
      "text": "Sure, I'll send it before tomorrow morning.",
      "localized_text": "Tentu, aku akan mengirimkannya sebelum besok pagi."
    },
    {
      "id": "reply_2",
      "intent": "clarify",
      "text": "Sure. Is there a specific format you'd prefer?",
      "localized_text": "Tentu. Apakah ada format tertentu yang kamu inginkan?"
    },
    {
      "id": "reply_3",
      "intent": "ask_for_time",
      "text": "I'll check my schedule and confirm shortly.",
      "localized_text": "Aku akan memeriksa jadwalku dan segera mengonfirmasi."
    }
  ]
}
```

### 9.4 Endpoint pendukung

-   `GET /api/v1/preferences`
-   `PATCH /api/v1/preferences`
-   `GET /api/v1/history`
-   `DELETE /api/v1/history/{id}`
-   `DELETE /api/v1/user-data` untuk penghapusan data sesuai cakupan
    akun dan kebijakan
-   `GET /api/v1/health` untuk pemeriksaan kesehatan layanan internal

Endpoint autentikasi, kuota, dan pengelolaan akun harus ditambahkan jika
aplikasi menggunakan akun pengguna.

------------------------------------------------------------------------

## 10. Persyaratan AI dan Prompt

### 10.1 Transkripsi dan terjemahan

-   Deteksi bahasa sumber harus dapat dikoreksi pengguna.
-   Teks hasil transkripsi tidak boleh diam-diam diubah maknanya.
-   Tampilkan error atau penanda ketidakpastian jika audio tidak jelas,
    terlalu bising, atau berisi ucapan yang tidak dapat dikenali.
-   Pertahankan nama, angka, tanggal, nominal, dan istilah penting
    sejauh dikenali.
-   Jangan menerjemahkan isi yang tidak berhasil ditranskripsikan
    seolah-olah pasti benar.

### 10.2 Saran balasan

Saran balasan harus mempertimbangkan: - Pesan asli dan transkrip yang
sudah tersedia. - Bahasa lawan bicara. - Bahasa pengguna untuk
penjelasan. - Gaya: `casual`, `polite`, atau `professional`. - Maksimal
tiga opsi dengan maksud yang berbeda. - Konteks hanya dari data yang
tersedia; AI tidak boleh mengarang fakta tentang pengguna. - Bila maksud
pesan ambigu, sertakan opsi klarifikasi. - Tidak boleh mengirim pesan
secara otomatis.

### 10.3 Contoh instruksi sistem untuk LLM

``` text
You generate reply suggestions for a language translation assistant.

Use only the supplied source message and context. Do not invent personal facts,
availability, promises, agreement, prices, dates, or commitments for the user.

Return up to three concise, distinct reply options in the requested reply language.
When appropriate, vary the intent across accepting, asking for clarification,
requesting time, or politely declining. Do not force all intents if they do not
fit the source message.

Match the requested tone. If the source message is ambiguous, include a safe
clarifying response. Do not send messages or claim that a message was sent.

Return valid JSON with:
- suggestions: array
- each item: intent, text, localized_text
```

Output model harus divalidasi menggunakan schema di backend. Jika output
tidak valid, lakukan satu retry terbatas atau tampilkan error yang aman.

------------------------------------------------------------------------

## 11. Penanganan Error dan Edge Cases

  -----------------------------------------------------------------------
  Kondisi                             Perilaku yang diharapkan
  ----------------------------------- -----------------------------------
  Format file tidak didukung          Jelaskan format yang didukung dan
                                      jangan mengunggah file.

  File kosong/rusak                   Tampilkan error dan opsi memilih
                                      file lain.

  Audio terlalu panjang/besar         Tampilkan batas yang berlaku dan
                                      opsi memotong audio jika fitur
                                      tersedia.

  Bahasa tidak terdeteksi             Minta pengguna memilih bahasa
                                      sumber.

  Transkrip kosong/tidak jelas        Jelaskan bahwa audio belum dapat
                                      dipahami; jangan menghasilkan
                                      balasan seolah transkrip akurat.

  Provider timeout                    Tampilkan status gagal sementara
                                      dan tombol coba lagi.

  Kuota habis                         Jelaskan batas pemakaian dan kapan
                                      dapat digunakan kembali.

  Izin overlay ditolak                Fitur impor tetap tersedia;
                                      tampilkan instruksi mengaktifkan
                                      overlay secara opsional.

  Overlay dihentikan sistem           Pengguna dapat mengaktifkannya lagi
                                      dari aplikasi.

  LLM mengembalikan JSON tidak valid  Validasi, retry terbatas, lalu
                                      tampilkan error jika tetap gagal.

  Tidak ada jawaban yang cocok        Pengguna dapat meminta alternatif
                                      atau mengedit saran.

  Penghapusan riwayat                 Hapus data sesuai kebijakan dan
                                      jelaskan jika ada masa retensi
                                      backend.

  Offline                             Beri tahu pengguna bahwa pemrosesan
                                      cloud memerlukan koneksi internet.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 12. Privasi, Persetujuan, dan Batasan Platform

-   Pengguna harus memulai sendiri pemilihan atau pembagian audio untuk
    alur MVP.
-   Jangan mengklaim bahwa aplikasi dapat menangkap seluruh audio dari
    aplikasi lain atau panggilan telepon.
-   Floating bubble hanya merupakan antarmuka overlay; bubble itu
    sendiri tidak memberi hak akses ke audio aplikasi lain.
-   `MediaProjection`/Audio Playback Capture memiliki batasan Android
    dan bergantung pada aplikasi sumber. Fitur ini bukan prasyarat MVP.
-   Untuk fitur mikrofon, minta izin ketika pengguna mengaktifkan fungsi
    terkait dan jelaskan tujuan pemakaian.
-   Untuk fitur overlay, arahkan pengguna ke pengaturan Android dan
    sediakan tombol untuk menonaktifkan bubble.
-   Audio dan transkrip dapat memuat data pribadi pihak lain. Hindari
    penyimpanan yang tidak diperlukan dan sediakan kontrol penghapusan.
-   Jika audio dikirim ke provider pihak ketiga, kebijakan privasi harus
    menjelaskan pemrosesan dan retensi sesuai ketentuan provider.
-   Evaluasi aturan hukum, kebijakan toko aplikasi, dan persetujuan yang
    diperlukan sebelum menambahkan perekaman percakapan langsung.

------------------------------------------------------------------------

## 13. Strategi Pengujian

### 13.1 Unit test

-   Validasi MIME type, ukuran, dan durasi.
-   Pemetaan status pekerjaan.
-   Validasi bahasa dan tone.
-   Validasi schema respons AI.
-   Penanganan timeout, retry, dan kuota.

### 13.2 Integration test

-   Upload audio → STT → terjemahan → hasil.
-   Terjemahan selesai → saran balasan tanpa mengulang STT.
-   Salin hasil dari panel utama dan floating panel.
-   Penghapusan riwayat lokal dan server.
-   Kegagalan provider dan pemulihan UI.

### 13.3 Pengujian perangkat

-   Perangkat Android dengan versi minimum dan versi terbaru yang
    didukung.
-   Perbedaan perilaku overlay pada beberapa vendor.
-   Orientasi layar dan ukuran layar berbeda.
-   Aplikasi masuk background dan kembali foreground.
-   Izin overlay diberikan/ditolak.
-   Jaringan lambat, terputus, dan kembali tersambung.
-   File audio dengan aksen, noise, durasi, dan format berbeda.

### 13.4 Kriteria rilis beta

-   Semua fungsi P0 lolos acceptance test.
-   Tidak ada API key provider di APK.
-   Pengguna dapat menghapus riwayat dan memahami kebijakan audio.
-   Error utama memiliki pesan yang jelas.
-   Floating bubble dapat ditutup dan tidak menghalangi penggunaan
    aplikasi lain.
-   Penggunaan API dibatasi agar kegagalan loop tidak menimbulkan biaya
    tak terkendali.

------------------------------------------------------------------------

## 14. Rencana Implementasi

Estimasi awal untuk tim kecil; durasi aktual bergantung pada pengalaman
tim dan keputusan desain.

  -----------------------------------------------------------------------
  Tahap                   Pekerjaan               Estimasi
  ----------------------- ----------------------- -----------------------
  1\. Discovery           Memilih provider,       2--3 hari
                          bahasa, batas file, dan 
                          uji kualitas audio      

  2\. UX/UI               Wireframe onboarding,   3--5 hari
                          impor audio, hasil,     
                          reply suggestions,      
                          floating panel          

  3\. Backend dasar       API, konfigurasi        4--7 hari
                          provider, upload aman,  
                          validasi, status        
                          pekerjaan               

  4\. Pipeline AI         STT, terjemahan, saran  3--6 hari
                          balasan, validasi       
                          output                  

  5\. Android app         Navigasi, impor/share   5--8 hari
                          audio, hasil, salin,    
                          pengaturan              

  6\. Floating overlay    Izin overlay, bubble,   3--6 hari
                          panel, lifecycle dan    
                          pengujian perangkat     

  7\. QA dan beta         Pengujian integrasi,    4--7 hari
                          error, privasi, biaya,  
                          perbaikan               
  -----------------------------------------------------------------------

Estimasi kasar total: **24--42 hari kerja** untuk implementasi yang
mencakup backend, Android, AI, dan QA oleh tim kecil. Estimasi ini tidak
mencakup jaminan penerjemahan panggilan real-time.

### Urutan implementasi yang disarankan

1.  Buat prototipe upload audio → transkrip → terjemahan.
2.  Tambahkan saran balasan AI dan salin teks.
3.  Bangun UI Android untuk alur utama.
4.  Tambahkan berbagi audio melalui Android Sharesheet.
5.  Tambahkan floating bubble dan panel overlay.
6.  Tambahkan riwayat, kontrol privasi, kuota, dan penanganan error.
7.  Uji beta dengan audio nyata yang digunakan secara sah dan mendapat
    persetujuan bila diperlukan.
8.  Evaluasi kebutuhan live translation berdasarkan umpan balik
    pengguna.

------------------------------------------------------------------------

## 15. Risiko dan Mitigasi

  -----------------------------------------------------------------------
  Risiko                  Dampak                  Mitigasi
  ----------------------- ----------------------- -----------------------
  Kualitas transkrip      Terjemahan dan saran    Pilih provider
  buruk                   balasan salah           berdasarkan bahasa,
                                                  tampilkan transkrip
                                                  yang bisa diperiksa,
                                                  sediakan koreksi
                                                  manual.

  Latensi tinggi          Pengalaman terasa       Proses asynchronous,
                          lambat                  pilih provider sesuai
                                                  target, ukur latensi
                                                  per tahap.

  Biaya API tinggi        Biaya operasional       Batas durasi, kuota,
                          membengkak              monitoring biaya, cache
                                                  hasil yang sesuai,
                                                  jangan memproses ulang
                                                  tanpa alasan.

  Saran balasan mengarang Pengguna dapat mengirim Prompt ketat, opsi
  fakta                   komitmen yang tidak     klarifikasi, pengguna
                          diinginkan              selalu meninjau dan
                                                  mengirim sendiri.

  Overlay ditolak atau    Fitur bubble tidak      Jadikan overlay
  dihentikan OS           tersedia                opsional; semua fungsi
                                                  inti tetap bisa
                                                  digunakan di aplikasi
                                                  utama.

  Harapan live call       Pengguna mengira semua  Jelaskan batasan sejak
  terlalu tinggi          panggilan bisa          onboarding dan jangan
                          diterjemahkan           memasarkan fitur yang
                                                  belum tersedia.

  Audio sensitif          Risiko privasi          Minimalkan retensi,
                                                  amankan transfer,
                                                  batasi log, sediakan
                                                  penghapusan dan
                                                  kebijakan yang jelas.

  Ketergantungan provider Perubahan harga atau    Gunakan lapisan adapter
                          layanan                 dan evaluasi provider
                                                  alternatif.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 16. Keputusan Produk yang Masih Perlu Dikonfirmasi

Sebelum implementasi, putuskan hal-hal berikut:

1.  Provider STT dan translation berdasarkan bahasa yang paling penting,
    kualitas, harga, dan latensi.
2.  Apakah akun wajib atau MVP dapat dimulai tanpa akun dengan kuota
    lokal/server terbatas.
3.  Batas durasi dan ukuran audio.
4.  Bahasa yang didukung saat peluncuran.
5.  Apakah riwayat disimpan lokal saja atau juga di backend.
6.  Apakah saran balasan selalu otomatis muncul atau hanya dibuat ketika
    pengguna menekan tombol.
7.  Versi minimum Android setelah pengujian teknis.
8.  Kebijakan retensi audio dan transkrip.
9.  Model biaya/kuota untuk mencegah penyalahgunaan.
10. Metrik dan kelompok pengguna untuk uji beta.

**Rekomendasi default:** mulai dengan Bahasa Inggris ↔ Bahasa Indonesia,
impor/share audio, saran balasan yang dipicu tombol, riwayat opsional,
dan pemrosesan melalui backend. Floating bubble menjadi akses cepat,
bukan syarat untuk memakai fitur utama.

------------------------------------------------------------------------

## 17. Definisi Selesai (Definition of Done)

MVP dianggap siap diuji beta ketika:

-   Pengguna dapat mengimpor atau membagikan audio yang didukung.
-   Audio berhasil ditranskripsikan dan diterjemahkan.
-   Bahasa sumber dan tujuan ditampilkan dengan jelas.
-   Pengguna dapat meminta hingga tiga saran balasan dalam gaya yang
    dipilih.
-   Pengguna dapat menyalin dan, bila fitur edit tersedia, mengubah
    saran sebelum mengirimkannya sendiri.
-   Floating bubble dapat diaktifkan, digunakan, dipindahkan, dan
    dinonaktifkan dengan benar pada perangkat yang didukung.
-   Error provider, jaringan, format file, dan kuota ditangani.
-   Pengguna dapat menghapus riwayat sesuai kebijakan retensi.
-   API key tidak tertanam di aplikasi.
-   Kebijakan privasi dan penjelasan izin tersedia.
-   Pengujian acceptance P0 telah lulus.

------------------------------------------------------------------------

## 18. Ringkasan

Floating AI Translator adalah asisten penerjemah Android yang
menggabungkan **transkripsi audio, terjemahan, floating bubble, dan
saran balasan AI**. MVP berfokus pada voice note/file audio melalui
impor atau share, sehingga produk dapat divalidasi tanpa bergantung pada
kemampuan menangkap audio panggilan yang dibatasi sistem operasi.

Saran balasan merupakan fitur inti: pengguna menerima hingga tiga opsi
dalam bahasa lawan bicara, dapat memilih gaya Santai/Sopan/Profesional,
lalu menyalin dan mengirim sendiri. Penerjemahan panggilan secara
real-time ditempatkan sebagai fase lanjutan setelah alur inti, biaya,
kualitas AI, serta batasan platform tervalidasi.
