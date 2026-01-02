import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          // STL, DXF ve diğer yaygın çizim formatlarına izin veriyoruz
          allowedContentTypes: [
            'application/octet-stream', 
            'model/stl',               
            'image/x-dxf',             
            'application/dxf',         
            'image/jpeg', 
            'image/png',
            'application/pdf'
          ], 
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Yükleme tamamlandı:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
