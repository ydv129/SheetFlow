import mongoose from "mongoose";

// Define the connection state to avoid connecting multiple times
// This is especially important in serverless environments like Vercel
let cachedConnection: typeof mongoose | null = null;

/**
 * Connect to MongoDB Atlas
 * This function handles connection caching to prevent multiple connections
 * which would cause issues in serverless environments
 */
async function connectToDatabase() {
  // If we already have a connection, reuse it
  if (cachedConnection) {
    return cachedConnection;
  }

  // Check that we have the MongoDB URI before trying to connect
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI environment variable is not set. Check your .env.local file."
    );
  }

  try {
    // Create a new connection
    const connection = await mongoose.connect(mongoUri);

    // Cache the connection for future use
    cachedConnection = connection;

    console.log("✓ Connected to MongoDB successfully");
    return connection;
  } catch (error) {
    console.error("✗ Failed to connect to MongoDB:", error);
    throw error;
  }
}

export default connectToDatabase;
