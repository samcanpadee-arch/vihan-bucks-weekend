import { NextResponse } from 'next/server';
import { getRedis } from '../../../lib/redis';

function isAuthorized(request) {
  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
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
      const names = await redis.sMembers('voter-names');
      const voteKeys = names?.length
        ? names.map((name) => `vote:${String(name).trim().toLowerCase()}`)
        : await redis.keys('vote:*');
      if (voteKeys.length) await redis.del(voteKeys);
      await redis.del('voter-names');
      await redis.del('voters');
      return NextResponse.json({ success: true, deletedAll: true, deletedCount: voteKeys.length });
    }

    const name = searchParams.get('name')?.trim();
    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    }

    const normalizedName = name.toLowerCase();
    const key = `vote:${normalizedName}`;
    await redis.del(key);
    await redis.sRem('voter-names', normalizedName);
    await redis.sRem('voters', key);

    return NextResponse.json({ success: true, deleted: key, removedName: normalizedName });
  } catch (error) {
    console.error('Admin vote delete error:', error);
    return NextResponse.json({ error: 'Failed to delete vote(s)' }, { status: 500 });
  }
}
