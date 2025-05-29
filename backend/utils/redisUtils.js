import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Redis client instance
let redisClient = null;

/**
 * Initialize the Redis client and connect to the Redis server
 */
const connectRedis = async () => {
	try {
		// localhost right now
		const redisUrl = process.env.REDIS_URL;

		// Create Redis client
		redisClient = createClient({
			url: redisUrl,
		});

		// Error handler
		redisClient.on('error', (err) => {
			console.error('Redis connection error:', err);
		});

		// Connect to Redis
		await redisClient.connect();
		console.log('Redis Connected!');
	} catch (err) {
		console.error('Error connecting to Redis:', err.message);
		// If Redis fails to connect, continue without caching
		redisClient = null;
	}
};

/**
 * Get data from Redis cache
 * @param {*} key
 */
const getCache = async (key) => {
	if (!redisClient) return null;

	try {
		const cachedData = await redisClient.get(key);
		return cachedData ? JSON.parse(cachedData) : null;
	} catch (err) {
		console.error('Redis get error:', err);
		return null;
	}
};

/**
 * Set data in Redis cache with TTL
 * @param {*} key 
 * @param {*} data 
 * @param {*} ttl 
 * @returns 
 */
const setCache = async (key, data, ttl = 120) => {
	if (!redisClient) return false;

	try {
		await redisClient.set(key, JSON.stringify(data), { EX: ttl });
		return true;
	} catch (err) {
		console.error('Redis set error:', err);
		return false;
	}
};

export { connectRedis, getCache, setCache };
