import { NextResponse } from 'next/server';
import { getRedis } from '../../../lib/redis';

const tallyCategories = [
  'fridayNight',
  'saturdayMorning',
  'saturdayLunch',
  'saturdayDrinks',
  'saturdayNight',
  'sundayRecovery'
];

function isAuthorized(request) {
  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
  const provided = request.headers.get('x-admin-secret');
  return Boolean(adminSecret) && provided === adminSecret;
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const finalSelections = body?.finalSelections || null;

    const redis = await getRedis();
    const keys = await redis.keys('vote:*');
    const rawVotes = await Promise.all(
      keys.map(async (key) => {
        const raw = await redis.get(key);
        return raw ? JSON.parse(raw) : null;
      })
    );
    const votes = rawVotes.filter(Boolean);

    const tally = {};
    const otherSuggestions = {};
    for (const category of tallyCategories) {
      tally[category] = {};
      otherSuggestions[category] = [];
      for (const vote of votes) {
        const choice = vote?.[category];
        if (choice) {
          tally[category][choice] = (tally[category][choice] || 0) + 1;
        }

        const customText = vote?.[`${category}Other`]?.trim();
        const name = vote?.name?.trim();
        if (choice === 'other' && name && customText) {
          otherSuggestions[category].push({ name, text: customText });
        }
      }
    }

    const snapshot = {
      savedAt: new Date().toISOString(),
      voterCount: votes.length,
      voterNames: votes.map((vote) => vote?.name).filter(Boolean),
      votes,
      tally,
      otherSuggestions
    };

    await redis.set('final-results', JSON.stringify(snapshot));

    if (finalSelections && typeof finalSelections === 'object') {
      await redis.set('config:finalResults', JSON.stringify(finalSelections));
    }

    return NextResponse.json({ success: true, savedAt: snapshot.savedAt });
  } catch (error) {
    console.error('Admin finalise save error:', error);
    return NextResponse.json({ error: 'Failed to save final results' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const redis = await getRedis();
    await redis.del('final-results');
    await redis.del('config:finalResults');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin finalise clear error:', error);
    return NextResponse.json({ error: 'Failed to clear saved results' }, { status: 500 });
  }
}
