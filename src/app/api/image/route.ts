import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url');
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ message: 'A valid image URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, { headers: { Accept: 'image/*' }, cache: 'no-store' });
    if (!response.ok) return new NextResponse(null, { status: response.status });

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': response.headers.get('content-type') || 'image/jpeg'
      }
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
