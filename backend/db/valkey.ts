import Redis from "ioredis";

/**
 * Valkey (Redis-compatible) client for rate limiting and caching
 * Used for API rate limiting and session caching
 */
let redisClient: Redis | null = null;

/**
 * Initialize Valkey connection
 * Connects to Valkey/Redis for rate limiting and caching
 */
export function connectToValkey(): Redis {
  if (!redisClient) {
    const valkeyUrl = process.env.VALKEY_URL || "redis://localhost:6379";

    redisClient = new Redis(valkeyUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      reconnectOnError: (err) => {
        console.warn("Redis reconnect on error:", err);
        return err.message.includes("READONLY");
      },
    });

    redisClient.on("error", (error) => {
      console.error("Valkey connection error:", error);
    });

    redisClient.on("connect", () => {
      console.log("Connected to Valkey");
    });
  }

  return redisClient;
}

/**
 * Get the Valkey client instance
 * Ensures connection is established
 */
export function getValkeyClient(): Redis {
  if (!redisClient) {
    return connectToValkey();
  }
  return redisClient;
}

/**
 * Close Valkey connection
 * Call this on application shutdown
 */
export async function closeValkeyConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}