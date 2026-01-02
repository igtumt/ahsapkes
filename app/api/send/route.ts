import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, fileUrl } = await request.json();

    const data = await resend.emails.send({
      from: 'AhsapKes <onboarding@resend.dev>', // Ücretsiz planda bu adres sabit kalmalı
      to: ['igtanchor1@gmail.com'], // Buraya bildirim almak istediğin kendi mailini yaz
      subject: 'Yeni Teklif Talebi Var! 🪵',
      html: `<p><strong>${email}</strong> adresinden yeni bir teklif talebi geldi.</p>
             <p>Dosya Linki: <a href="${fileUrl}">${fileUrl}</a></p>`
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
