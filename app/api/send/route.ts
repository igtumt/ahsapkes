import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, fileUrl, orderCode, aciklama } = await request.json();

    const data = await resend.emails.send({
      from: 'AhsapKes <onboarding@resend.dev>',
      to: ['isilaygamzetoluk@gmail.com'],
      subject: `Yeni Sipariş: #${orderCode} 🪵`,
      html: `
        <h3>Yeni Teklif Talebi #${orderCode}</h3>
        <p><strong>Müşteri:</strong> ${email}</p>
        <p><strong>Açıklama:</strong> ${aciklama || "Belirtilmemiş"}</p>
        <p><strong>Dosya:</strong> <a href="${fileUrl}">Dosyayı Görüntüle</a></p>
      `
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
