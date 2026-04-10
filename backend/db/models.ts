import mongoose, { Schema, Document, Model } from "mongoose";

interface UserPreferences {
  theme: "light" | "dark";
  language: string;
}

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string | null;
  subscriptionTier: "free" | "pro";
  subscriptionExpiresAt: Date | null;
  isOnboarded: boolean;
  lastLoginAt: Date;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

interface IProjectConfig extends Document {
  userId: mongoose.Types.ObjectId;
  projectName: string;
  description: string;
  excelFilePath: string | null;
  aiModel: "SmolLM2-360M" | "Gemma-4-E2B";
  watcherInterval: number;
  ignoredColumns: string[];
  dashboardLayout: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Schema - Stores user information and subscription status
 * IMPORTANT: We never store actual spreadsheet data in the database
 * Only metadata like settings and subscription status
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    subscriptionTier: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    subscriptionExpiresAt: {
      type: Date,
      default: null,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: () => new Date(),
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      language: {
        type: String,
        default: "en",
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * ProjectConfig Schema - Stores settings for user's Excel projects
 * Each user can have multiple project configurations
 */
const projectConfigSchema = new Schema<IProjectConfig>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    excelFilePath: {
      type: String,
      default: null,
    },
    aiModel: {
      type: String,
      enum: ["SmolLM2-360M", "Gemma-4-E2B"],
      default: "SmolLM2-360M",
    },
    watcherInterval: {
      type: Number,
      default: 5,
      min: 1,
      max: 60,
    },
    ignoredColumns: {
      type: [String],
      default: [],
    },
    dashboardLayout: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
projectConfigSchema.index({ userId: 1 });

// Export models - use existing models if they're already defined
// This prevents errors when the module is imported multiple times
export const User:
  | Model<IUser>
  | (mongoose.Model<IUser> & typeof mongoose.models.User) =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export const ProjectConfig: Model<IProjectConfig> =
  mongoose.models.ProjectConfig ||
  mongoose.model<IProjectConfig>("ProjectConfig", projectConfigSchema);
