// Environment variable validation
export const env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
} as const

// Validate required environment variables
if (!env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required")
}

if (!env.BLOB_READ_WRITE_TOKEN) {
  throw new Error("BLOB_READ_WRITE_TOKEN is required")
}
