"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { upload } from '@vercel/blob/client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [aciklama, setAciklama] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [siparisKodu, setSiparisKodu] = useState("");
  const [modalAcik, setModalAcik] = useState(false); // Popup kontrolü

  const basvuruYap = async () => {
    if (!email || !file) {
      setMesaj("Hata: Lütfen e-posta girin ve bir dosya seçin.");
      return;
    }

    try {
      setYukleniyor(true);
      setMesaj("İşleminiz yapılıyor...");
      const randomCode = "AK-" + Math.floor(1000 + Math.random() * 9000);

      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      const { error } = await supabase
        .from('basvurular')
        .insert([{ 
          email: email, 
          dosya_url: newBlob.url,
          aciklama: aciklama 
        }]);

      if (error) throw error;

      await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          fileUrl: newBlob.url, 
          orderCode: randomCode,
          aciklama: aciklama 
        }),
      });

      setSiparisKodu(randomCode);
      setMesaj(`Başarılı! Talebiniz alındı. Sipariş Kodunuz: ${randomCode}`);
      setEmail("");
      setFile(null);
      setAciklama("");
    } catch (e: any) {
      setMesaj("Bir hata oluştu: " + e.message);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <main style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      justifyContent: 'center', minHeight: '100vh', 
      backgroundImage: "url('https://images.unsplash.com/photo-1541123630591-df23c2ed40c5?q=80&w=2070&auto=format&fit=crop')", 
      backgroundSize: 'cover', backgroundPosition: 'center', padding: '20px', position: 'relative', fontFamily: "'Inter', sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Roboto+Slab:wght@700&display=swap" rel="stylesheet" />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 252, 248, 0.75)', zIndex: 0 }}></div>

      {/* POPUP (MODAL) YAPISI */}
      {modalAcik && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 100, padding: '20px'
        }} onClick={() => setModalAcik(false)}>
          <div style={{
            backgroundColor: '#fff', padding: '30px', borderRadius: '24px',
            maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Roboto Slab', serif", color: '#3e2723' }}>Nasıl Çalışır? 🪵</h2>
            <div style={{ textAlign: 'left', marginTop: '20px', color: '#5d4037', lineHeight: '1.6' }}>
              <p><strong>1. Dosyanı Yükle:</strong> Çizimini (STL, DXF, PNG veya PDF) sisteme yükle.</p>
              <p><strong>2. Analiz Edelim:</strong> Uzman ekibimiz tasarımını incelesin.</p>
              <p><strong>3. Teklifin Hazır:</strong> 2-48 saat içinde e-posta adresine fiyat bilgisini gönderelim.</p>
            </div>
            <button 
              onClick={() => setModalAcik(false)}
              style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#3e2723', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >Kapat</button>
          </div>
        </div>
      )}

      <div style={{ zIndex: 1, textAlign: 'center', width: '100%', maxWidth: '500px' }}>
        
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '3rem', marginRight: '15px' }}>🪵</span>
          <h1 style={{ color: '#3e2723', fontSize: '3.5rem', margin: 0, fontFamily: "'Roboto Slab', serif" }}>AhşapKes</h1>
        </div>
        
        {/* TIKLANABİLİR SÜREÇ BUTONU */}
        <button 
          onClick={() => setModalAcik(true)}
          style={{ 
            backgroundColor: 'rgba(62, 39, 35, 0.1)', border: '1px solid #3e2723',
            padding: '8px 20px', borderRadius: '20px', color: '#3e2723',
            fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '30px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(62, 39, 35, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(62, 39, 35, 0.1)'}
        >
          Süreç Nasıl İşler? 🔍
        </button>

        <p style={{ color: '#5d4037', fontSize: '1.2rem', marginBottom: '5px', fontWeight: 'bold' }}>Teklif için datayı yükleyin.</p>
        <p style={{ color: '#8d6e63', fontSize: '0.95rem', marginBottom: '30px', fontStyle: 'italic' }}>2 ila 48 saat arasında dönüş yapılacaktır.</p>
        
        <div style={{ padding: '35px', borderRadius: '30px', backgroundColor: '#ffffff', boxShadow: '0 15px 35px rgba(62, 39, 35, 0.08)', border: '1px solid #efebe9', textAlign: 'left' }}>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#5d4037' }}>E-posta</label>
            <input type="email" placeholder="ornek@mail.com" value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px', border: '1px solid #d7ccc8', borderRadius: '12px', fontSize: '1rem', color: '#000', backgroundColor: '#fafafa' }} 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#5d4037' }}>Çizim Dosyası</label>
            <div style={{ position: 'relative', border: '2px dashed #d7ccc8', borderRadius: '12px', padding: '25px', textAlign: 'center', backgroundColor: '#fafafa' }}>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
              <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{file ? '📄' : '📤'}</div>
              <p style={{ color: '#5d4037', margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>{file ? `${file.name}` : "STL, DXF, PNG veya PDF yükleyin"}</p>
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#5d4037' }}>Notunuz (Opsiyonel)</label>
            <textarea placeholder="Malzeme türü, adet veya özel isteklerinizi yazın..." value={aciklama} onChange={(e) => setAciklama(e.target.value)}
              style={{ width: '100%', padding: '14px', border: '1px solid #d7ccc8', borderRadius: '12px', fontSize: '0.9rem', color: '#000', minHeight: '90px', backgroundColor: '#fafafa', resize: 'none', fontFamily: "'Inter', sans-serif" }} 
            />
          </div>

          <button onClick={basvuruYap} disabled={yukleniyor}
            style={{ width: '100%', backgroundColor: '#3e2723', color: '#fff', padding: '18px', border: 'none', borderRadius: '12px', cursor: yukleniyor ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
          >
            {yukleniyor ? "Gönderiliyor..." : "Teklif Al ve Gönder"}
          </button>

          {mesaj && (
            <div style={{ marginTop: '20px', padding: '15px', borderRadius: '12px', textAlign: 'center', backgroundColor: mesaj.includes("Hata") ? '#ffebee' : '#e8f5e9', color: mesaj.includes("Hata") ? '#c62828' : '#2e7d32', fontWeight: '600', border: '1px solid currentColor' }}>
              {mesaj}
            </div>
          )}
        </div>

        <p style={{ marginTop: '30px', fontSize: '0.85rem', color: '#8d6e63', letterSpacing: '1px', fontWeight: '600' }}>© 2026 AHŞAPKES ATÖLYESİ</p>
      </div>
    </main>
  );
}
