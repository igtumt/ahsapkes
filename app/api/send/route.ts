import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  console.log("--- E-posta Gönderimi Başladı ---");
  
  try {
    const body = await request.json();
    console.log("Gelen Veri:", body);

    if (!process.env.RESEND_API_KEY) {
      console.error("HATA: RESEND_API_KEY bulunamadı!");
      return NextResponse.json({ error: "API Key eksik" }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from: 'AhsapKes <onboarding@resend.dev>',
      to: ['isilaygamzetoluk@gmail.com'],
      subject: 'Yeni Teklif Talebi Var! 🪵',
      html: `<p>E-posta: ${body.email}</p><p>Dosya: ${body.fileUrl}</p>`
    });

    if (error) {
      console.error("Resend Hatası:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    console.log("E-posta başarıyla sıraya alındı:", data);
    return NextResponse.json({ success: true, data });
    
  } catch (err: any) {
    console.error("Sistemsel Hata:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

