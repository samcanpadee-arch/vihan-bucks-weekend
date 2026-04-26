import { createClient } from 'redis';

let client = null;
let connecting = null;

export async function getRedis() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error('REDIS_URL is not set');

  if (client?.isReady) return client;

  if (connecting) return connecting;

  connecting = (async () => {
    client = createClient({ url });
    client.on('error', (err) => console.error('Redis client error:', err));
    await client.connect();
    connecting = null;
    return client;
  })();

  return connecting;
}
