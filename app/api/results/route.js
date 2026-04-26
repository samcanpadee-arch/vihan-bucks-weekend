import { NextResponse } from 'next/server';
import { getRedis } from '../../lib/redis';

export const dynamic = 'force-dynamic';

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
      return NextResponse.json({ voterCount: 0, voterNames: [], tally: {}, otherSuggestions: {}, groupNotes: [], votes: [], finalResults });
    }

    const rawVotes = await Promise.all(
      keys.map(async (key) => {
        const raw = await redis.get(key);
        return raw ? JSON.parse(raw) : null;
      })
    );
    const votes = rawVotes.filter(Boolean);

    const tally = {};
    const otherSuggestions = {};
    const votesForTable = votes.map((vote) => ({
      name: vote?.name || '',
      fridayNight: vote?.fridayNight || '',
      fridayNightOther: vote?.fridayNightOther || '',
      saturdayMorning: vote?.saturdayMorning || '',
      saturdayMorningOther: vote?.saturdayMorningOther || '',
      saturdayLunch: vote?.saturdayLunch || '',
      saturdayLunchOther: vote?.saturdayLunchOther || '',
      saturdayDrinks: vote?.saturdayDrinks || '',
      saturdayDrinksOther: vote?.saturdayDrinksOther || '',
      saturdayNight: vote?.saturdayNight || '',
      saturdayNightOther: vote?.saturdayNightOther || '',
      sundayRecovery: vote?.sundayRecovery || '',
      sundayRecoveryOther: vote?.sundayRecoveryOther || '',
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

    return NextResponse.json({
      voterCount: votes.length,
      voterNames: votes.map((vote) => vote.name).filter(Boolean),
      tally,
      otherSuggestions,
      groupNotes,
      votes: votesForTable,
      finalResults
    });
  } catch (error) {
    console.error('Results fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
