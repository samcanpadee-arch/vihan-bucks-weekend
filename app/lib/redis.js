import { createClient } from 'redis';

let client = null;

export async function getRedis() {
  if (!client) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    client = createClient({ url });
    client.on('error', (err) => console.error('Redis client error:', err));
    await client.connect();
  }

  return client;
}
