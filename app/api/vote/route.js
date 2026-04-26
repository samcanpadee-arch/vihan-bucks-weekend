import { NextResponse } from 'next/server';
import { getRedis } from '../../lib/redis';

const requiredFields = [
  'name',
  'fridayNight',
  'saturdayMorning',
  'saturdayLunch',
  'saturdayDrinks',
  'saturdayNight',
  'sundayRecovery'
];

export async function POST(request) {
  try {
    const body = await request.json();

    const hasMissingRequired = requiredFields.some((field) => !body[field]);
    if (hasMissingRequired) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const vote = {
      name: body.name,
      hardConstraints: body.hardConstraints || '',
      fridayNight: body.fridayNight,
      fridayNightOther: body.fridayNightOther || '',
      saturdayMorning: body.saturdayMorning,
      saturdayMorningOther: body.saturdayMorningOther || '',
      saturdayLunch: body.saturdayLunch,
      saturdayLunchOther: body.saturdayLunchOther || '',
      saturdayDrinks: body.saturdayDrinks,
      saturdayDrinksOther: body.saturdayDrinksOther || '',
      saturdayNight: body.saturdayNight,
      saturdayNightOther: body.saturdayNightOther || '',
      sundayRecovery: body.sundayRecovery,
      sundayRecoveryOther: body.sundayRecoveryOther || '',
      submittedAt: new Date().toISOString()
    };

    const normalizedName = body.name.trim().toLowerCase();
    const key = `vote:${normalizedName}`;

    const redis = await getRedis();
    const votingLocked = (await redis.get('config:votingLocked')) === 'true';
    if (votingLocked) {
      return NextResponse.json({ error: 'Voting is locked' }, { status: 403 });
    }

    await redis.set(key, JSON.stringify(vote));
    await redis.sAdd('voter-names', normalizedName);
    await redis.sAdd('voters', key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vote submission error:', error);
    return NextResponse.json({ error: 'Failed to save vote' }, { status: 500 });
  }
}
