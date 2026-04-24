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
    const keys = await redis.keys('vote:*');
    const finalResultsRaw = await redis.get('config:finalResults');
    const finalResults = finalResultsRaw ? JSON.parse(finalResultsRaw) : null;

    if (!keys?.length) {
      return NextResponse.json({ voterCount: 0, voterNames: [], tally: {}, groupNotes: [], votes: [], finalResults });
    }

    const rawVotes = await Promise.all(
      keys.map(async (key) => {
        const raw = await redis.get(key);
        return raw ? JSON.parse(raw) : null;
      })
    );
    const votes = rawVotes.filter(Boolean);

    const tally = {};
    const votesForTable = votes.map((vote) => ({
      name: vote?.name || '',
      fridayNight: vote?.fridayNight || '',
      saturdayMorning: vote?.saturdayMorning || '',
      saturdayLunch: vote?.saturdayLunch || '',
      saturdayDrinks: vote?.saturdayDrinks || '',
      saturdayNight: vote?.saturdayNight || '',
      sundayRecovery: vote?.sundayRecovery || '',
      hardConstraints: vote?.hardConstraints || ''
    }));
    const groupNotes = votes
      .map((vote) => ({
        name: vote?.name?.trim(),
        note: vote?.hardConstraints?.trim()
      }))
      .filter((item) => item.name && item.note);

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
      tally,
      groupNotes,
      votes: votesForTable,
      finalResults
    });
  } catch (error) {
    console.error('Results fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
