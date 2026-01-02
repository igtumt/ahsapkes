"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { upload } from '@vercel/blob/client';

// Supabase Bağlantısı
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const basvuruYap = async () => {
    if (!email || !file) {
      setMesaj("Hata: Lütfen e-posta girin ve bir dosya seçin.");
      return;
    }

    try {
      setYukleniyor(true);
      setMesaj("İşleminiz yapılıyor, lütfen bekleyin...");
      
      // 1. Dosyayı Vercel Blob'a yüklüyoruz
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      // 2. Gelen URL'i ve e-postayı Supabase'e kaydediyoruz
      const { error } = await supabase
        .from('basvurular')
        .insert([{ 
          email: email, 
          dosya_url: newBlob.url 
        }]);

      if (error) throw error;

      // 3. Gmail Bildirimi Gönder (Az önce oluşturduğun /api/send rotasına istek atar)
      await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, fileUrl: newBlob.url }),
      });

      setMesaj("Başarılı! Bilgileriniz alındı, size dönüş yapacağız.");
      setEmail("");
      setFile(null);
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
      <p style={{ color: '#5d4037', fontSize: '1.1rem', marginBottom: '30px' }}>
        Teklif için datayı yükleyin.
      </p>
      
      <div style={{ 
        padding: '30px', border: '1px solid #d7ccc8', 
        borderRadius: '16px', backgroundColor: '#ffffff', width: '100%', maxWidth: '450px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3e2723' }}>E-posta</label>
          <input 
            type="email" 
            placeholder="ornek@mail.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              width: '100%', padding: '12px', border: '1px solid #3e2723', 
              borderRadius: '8px', fontSize: '1rem', outlineColor: '#3e2723',
              color: '#000000', // Yazı rengi net siyah
              backgroundColor: '#ffffff'
            }} 
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3e2723' }}>
            Çizim Dosyası (STL, DXF, PNG...)
          </label>
          <div style={{
            position: 'relative', border: '2px dashed #a1887f', borderRadius: '8px',
            padding: '30px 20px', textAlign: 'center', backgroundColor: file ? '#f1f8e9' : '#f9f9f9',
            transition: 'all 0.3s ease'
          }}>
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
            />
            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{file ? '📄' : '📤'}</div>
            <p style={{ color: '#5d4037', margin: 0, fontSize: '0.9rem', fontWeight: file ? '600' : '400' }}>
              {file ? `${file.name}` : "Dosyayı buraya sürükleyin veya tıklayın"}
            </p>
          </div>
        </div>

        <button 
          onClick={basvuruYap}
          disabled={yukleniyor}
          style={{ 
            width: '100%', backgroundColor: yukleniyor ? '#a1887f' : '#3e2723', 
            color: '#fff', padding: '16px', border: 'none', borderRadius: '8px', 
            cursor: yukleniyor ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem'
          }}
        >
          {yukleniyor ? "Yükleniyor..." : "Teklif Al ve Gönder"}
        </button>

        {mesaj && (
          <div style={{ 
            marginTop: '20px', padding: '12px', borderRadius: '8px', textAlign: 'center',
            backgroundColor: mesaj.includes("Hata") ? '#ffebee' : '#e8f5e9',
            color: mesaj.includes("Hata") ? '#c62828' : '#2e7d32',
            fontSize: '0.9rem', border: '1px solid currentColor'
          }}>
            {mesaj}
          </div>
        )}
      </div>
    </div>
  );
}
