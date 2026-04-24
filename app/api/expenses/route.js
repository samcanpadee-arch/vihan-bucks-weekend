import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const EXPENSE_SET_KEY = 'expense-ids';

function normalizeName(value = '') {
  return value.trim();
}

function parseAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Number(amount.toFixed(2));
}

export async function GET() {
  try {
    const expenseIds = await kv.smembers(EXPENSE_SET_KEY);
    if (!expenseIds?.length) {
      return NextResponse.json({ expenses: [] });
    }

    const rawExpenses = await Promise.all(expenseIds.map((id) => kv.get(`expense:${id}`)));
    const expenses = rawExpenses
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error('Expenses fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const description = body.description?.trim();
    const amount = parseAmount(body.amount);
    const paidBy = normalizeName(body.paidBy);
    const splitType = body.splitType === 'equal' ? 'equal' : null;
    const splitAmong = Array.isArray(body.splitAmong)
      ? body.splitAmong.map((name) => normalizeName(name)).filter(Boolean)
      : [];

    if (!description || !amount || !paidBy || !splitType || splitAmong.length === 0) {
      return NextResponse.json({ error: 'Invalid expense payload' }, { status: 400 });
    }

    const id = body.id?.trim() || `exp_${Date.now()}`;
    const expense = {
      id,
      description,
      amount,
      paidBy,
      splitType,
      splitAmong: Array.from(new Set(splitAmong)),
      createdAt: body.createdAt || new Date().toISOString()
    };

    await kv.set(`expense:${id}`, expense);
    await kv.sadd(EXPENSE_SET_KEY, id);

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error('Expense save error:', error);
    return NextResponse.json({ error: 'Failed to save expense' }, { status: 500 });
  }
}
