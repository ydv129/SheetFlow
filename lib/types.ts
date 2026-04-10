/**
 * Standard API Response Format
 * All backend API routes should return responses in this format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * User Type - matches what NextAuth returns
 */
export interface UserSession {
  email: string;
  name?: string;
  image?: string;
}

/**
 * Project Configuration Type
 */
export interface ProjectConfigData {
  _id: string;
  userId: string;
  projectName: string;
  description?: string;
  excelFilePath?: string;
  aiModel: "SmolLM2-360M" | "Gemma-4-E2B";
  watcherInterval: number;
  ignoredColumns: string[];
  dashboardLayout: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
