import { NextResponse } from 'next/server';
import { getRedis } from '../../lib/redis';

const tallyCategories = [
  'fridayNight',
  'saturdayMorning',
  'saturdayLunch',
  'saturdayDrinks',
  'saturdayNight',
  'sundayRecovery'
];

export async function GET() {
  try {
    const redis = await getRedis();
    const voterKeys = await redis.sMembers('voters');

    if (!voterKeys?.length) {
      return NextResponse.json({ voterCount: 0, voterNames: [], tally: {} });
    }

    const rawVotes = await Promise.all(
      voterKeys.map(async (key) => {
        const raw = await redis.get(key);
        return raw ? JSON.parse(raw) : null;
      })
    );
    const votes = rawVotes.filter(Boolean);

    const tally = {};

    for (const category of tallyCategories) {
      tally[category] = {};
      for (const vote of votes) {
        const choice = vote?.[category];
        if (choice) {
          tally[category][choice] = (tally[category][choice] || 0) + 1;
        }
      }
    }

    return NextResponse.json({
      voterCount: votes.length,
      voterNames: votes.map((vote) => vote.name).filter(Boolean),
      tally
    });
  } catch (error) {
    console.error('Results fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
