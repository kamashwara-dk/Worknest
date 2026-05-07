import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Only initialize Redis if real credentials are provided
const isRedisConfigured =
  redisUrl &&
  redisToken &&
  !redisUrl.includes('YOUR_UPSTASH_URL') &&
  !redisToken.includes('YOUR_UPSTASH_TOKEN');

export const redis = isRedisConfigured
  ? new Redis({ url: redisUrl!, token: redisToken! })
  : null;

export const ratelimit = isRedisConfigured
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'worknest:ratelimit',
    })
  : null;
