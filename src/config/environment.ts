export interface Environment {
  CONFERENCES: KVNamespace;
  DISCORD_WEBHOOK_URL: string;
  WIKICFP_BASE_URL: string;
  CONFERENCE_CATEGORIES: string;
}

export function validateEnvironment(env: Environment): void {
  const required = ['DISCORD_WEBHOOK_URL', 'CONFERENCE_CATEGORIES'];
  const missing = required.filter(key => !env[key as keyof Environment]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Set defaults for optional variables
  if (!env.WIKICFP_BASE_URL) {
    env.WIKICFP_BASE_URL = 'http://www.wikicfp.com';
  }
}
