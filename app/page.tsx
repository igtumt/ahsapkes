"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase bağlantısını kuruyoruz
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [email, setEmail] = useState("");
  const [mesaj, setMesaj] = useState("");

  const kayitOl = async () => {
    if (!email) return;

    const { error } = await supabase
      .from('basvurular') // Senin oluşturduğun tablo adı
      .insert([{ email: email }]);

    if (error) {
      setMesaj("Bir hata oluştu: " + error.message);
    } else {
      setMesaj("Harika! Sizi listeye ekledik.");
      setEmail("");
    }
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', 
      backgroundColor: '#f5f5dc' 
    }}>
      <h1 style={{ color: '#3e2723', fontSize: '3.5rem' }}>AhşapKes</h1>
      <p style={{ color: '#5d4037' }}>Çizimlerini yükle, ahşaba hayat verelim.</p>
      
      <div style={{ 
        padding: '30px', border: '2px solid #3e2723', 
        borderRadius: '12px', backgroundColor: '#ffffff' 
      }}>
        <input 
          type="email" 
          placeholder="E-posta adresiniz" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '12px', border: '1px solid #3e2723', borderRadius: '4px', width: '250px', color: '#000' }} 
        />
        <button 
          onClick={kayitOl}
          style={{ backgroundColor: '#3e2723', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' }}
        >
          Haberdar Et
        </button>
      </div>
      {mesaj && <p style={{ marginTop: '15px', color: '#3e2723' }}>{mesaj}</p>}
    </div>
  );
}
