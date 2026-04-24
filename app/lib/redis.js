import { createClient } from 'redis';

export async function getRedis() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error('REDIS_URL is not set');

  const client = createClient({ url });
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  return client;
}
