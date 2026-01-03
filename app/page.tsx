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
  const [aciklama, setAciklama] = useState(""); // Açıklama için yeni state
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [siparisKodu, setSiparisKodu] = useState("");

  const basvuruYap = async () => {
    if (!email || !file) {
      setMesaj("Hata: Lütfen e-posta girin ve bir dosya seçin.");
      return;
    }

    try {
      setYukleniyor(true);
      setMesaj("İşleminiz yapılıyor...");
      
      // 1. Rastgele Sipariş Kodu Üret (Örn: AK-4829)
      const randomCode = "AK-" + Math.floor(1000 + Math.random() * 9000);

      // 2. Vercel Blob'a yükle
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      // 3. Supabase'e kaydet (Açıklama sütunuyla beraber)
      const { error } = await supabase
        .from('basvurular')
        .insert([{ 
          email: email, 
          dosya_url: newBlob.url,
          aciklama: aciklama // Supabase'e eklenen sütun
        }]);

      if (error) throw error;

      // 4. Gmail Bildirimi Gönder
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
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', 
      backgroundColor: '#fdfaf6', padding: '20px'
    }}>
      <h1 style={{ color: '#3e2723', fontSize: '3.5rem', marginBottom: '10px' }}>AhşapKes</h1>
      <p style={{ color: '#5d4037', fontSize: '1.2rem', marginBottom: '5px', fontWeight: 'bold' }}>
        Teklif için datayı yükleyin.
      </p>
      <p style={{ color: '#8d6e63', fontSize: '1rem', marginBottom: '30px' }}>
        2 ila 48 saat arasında dönüş yapılacaktır.
      </p>
      
      <div style={{ 
        padding: '30px', border: '1px solid #d7ccc8', 
        borderRadius: '16px', backgroundColor: '#ffffff', width: '100%', maxWidth: '450px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
      }}>
        {/* E-posta */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#3e2723' }}>E-posta</label>
          <input 
            type="email" 
            placeholder="ornek@mail.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '2px solid #3e2723', borderRadius: '8px', color: '#000', fontWeight: '600' }} 
          />
        </div>

        {/* Dosya */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#3e2723' }}>Çizim Dosyası</label>
          <div style={{ position: 'relative', border: '2px dashed #a1887f', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
            <p style={{ color: '#000', margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>{file ? `✅ ${file.name}` : "Dosya seçin"}</p>
          </div>
        </div>

        {/* Açıklama Kutusu */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#3e2723' }}>Notunuz (Opsiyonel)</label>
          <textarea 
            placeholder="Malzeme türü, adet veya özel isteklerinizi yazın..." 
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            style={{ 
              width: '100%', padding: '12px', border: '2px solid #3e2723', borderRadius: '8px', 
              fontSize: '0.9rem', color: '#000', minHeight: '80px', fontFamily: 'sans-serif'
            }} 
          />
        </div>

        <button 
          onClick={basvuruYap}
          disabled={yukleniyor}
          style={{ 
            width: '100%', backgroundColor: yukleniyor ? '#a1887f' : '#3e2723', 
            color: '#fff', padding: '16px', border: 'none', borderRadius: '8px', 
            cursor: yukleniyor ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1.1rem'
          }}
        >
          {yukleniyor ? "Gönderiliyor..." : "Teklif Al ve Gönder"}
        </button>

        {mesaj && (
          <div style={{ 
            marginTop: '20px', padding: '15px', borderRadius: '8px', textAlign: 'center',
            backgroundColor: mesaj.includes("Hata") ? '#ffebee' : '#e8f5e9',
            color: mesaj.includes("Hata") ? '#c62828' : '#2e7d32',
            fontWeight: 'bold', border: '1px solid currentColor'
          }}>
            {mesaj}
          </div>
        )}
      </div>
    </div>
  );
}
