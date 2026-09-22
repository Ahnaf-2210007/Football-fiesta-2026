import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await query('DELETE FROM players WHERE id = $1', [params.id]);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Player deletion failed:', error);
    return NextResponse.json({ message: 'Unable to delete player' }, { status: 400 });
  }
}