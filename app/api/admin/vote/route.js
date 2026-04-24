import { NextResponse } from 'next/server';
import { getRedis } from '../../../lib/redis';

function isAuthorized(request) {
  const adminSecret = process.env.ADMIN_SECRET;
  const provided = request.headers.get('x-admin-secret');
  return Boolean(adminSecret) && provided === adminSecret;
}

export async function DELETE(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const deleteAll = searchParams.get('all') === 'true';
    const redis = await getRedis();

    if (deleteAll) {
      const keys = await redis.keys('vote:*');
      if (keys.length) {
        await redis.del(keys);
      }
      await redis.del('voters');
      return NextResponse.json({ success: true, deletedAll: true, deletedCount: keys.length });
    }

    const name = searchParams.get('name')?.trim();
    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    }

    const key = `vote:${name.toLowerCase()}`;
    await redis.del(key);
    await redis.sRem('voters', key);

    return NextResponse.json({ success: true, deleted: key });
  } catch (error) {
    console.error('Admin vote delete error:', error);
    return NextResponse.json({ error: 'Failed to delete vote(s)' }, { status: 500 });
  }
}
