import { NextResponse } from 'next/server';
import { getRedis } from '../../../lib/redis';

function isAuthorized(request) {
  const adminSecret = process.env.ADMIN_SECRET;
  const provided = request.headers.get('x-admin-secret');
  return Boolean(adminSecret) && provided === adminSecret;
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const redis = await getRedis();
    await redis.set('config:finalResults', JSON.stringify(body?.finalResults || {}));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin finalise save error:', error);
    return NextResponse.json({ error: 'Failed to save final results' }, { status: 500 });
  }
}
