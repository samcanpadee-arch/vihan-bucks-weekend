import { NextResponse } from 'next/server';
import { getRedis } from '../../../lib/redis';

function isAuthorized(request) {
  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
  const provided = request.headers.get('x-admin-secret');
  return Boolean(adminSecret) && provided === adminSecret;
}

export async function GET() {
  try {
    const redis = await getRedis();
    const votingLocked = (await redis.get('config:votingLocked')) === 'true';
    const finalResultsRaw = await redis.get('config:finalResults');
    const finalResults = finalResultsRaw ? JSON.parse(finalResultsRaw) : null;

    return NextResponse.json({ votingLocked, finalResults });
  } catch (error) {
    console.error('Admin config fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const redis = await getRedis();
    const votingLocked = Boolean(body?.votingLocked);
    await redis.set('config:votingLocked', String(votingLocked));
    return NextResponse.json({ success: true, votingLocked });
  } catch (error) {
    console.error('Admin config save error:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
