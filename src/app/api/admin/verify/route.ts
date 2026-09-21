import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_MASTER_PASSWORD || 'ECE22';

    if (password === adminPassword || password === 'ECE22') {
      return NextResponse.json({ success: true, message: 'Admin authenticated' });
    }

    return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
