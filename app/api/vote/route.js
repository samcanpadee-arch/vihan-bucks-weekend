import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

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
      saturdayMorning: body.saturdayMorning,
      saturdayLunch: body.saturdayLunch,
      saturdayDrinks: body.saturdayDrinks,
      saturdayNight: body.saturdayNight,
      sundayRecovery: body.sundayRecovery,
      finalComments: body.finalComments || '',
      submittedAt: new Date().toISOString()
    };

    const normalizedName = body.name.trim().toLowerCase();
    const key = `vote:${normalizedName}`;

    await kv.set(key, vote);
    await kv.sadd('voters', key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vote submission error:', error);
    return NextResponse.json({ error: 'Failed to save vote' }, { status: 500 });
  }
}
