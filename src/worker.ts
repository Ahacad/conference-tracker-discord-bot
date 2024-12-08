import { Environment, validateEnvironment } from './config/environment';
import { ConferenceFetcher } from './services/conference-fetcher';
import { ConferenceStore } from './services/conference-store';
import { DiscordNotifier } from './services/discord-notifier';

export default {
  async scheduled(event: ScheduledEvent, env: Environment, ctx: ExecutionContext) {
    try {
      // Validate environment before starting
      validateEnvironment(env);

      const fetcher = new ConferenceFetcher(env.WIKICFP_BASE_URL);
      const store = new ConferenceStore(env.CONFERENCES);
      const notifier = new DiscordNotifier(env.DISCORD_WEBHOOK_URL);

      const conferences = await fetcher.fetchNewConferences();
      
      for (const conference of conferences) {
        const existing = await store.getConference(conference.id);
        
        if (!existing) {
          await store.saveConference(conference);
          await notifier.notifyNewConference(conference);
        }
      }
    } catch (error) {
      console.error('Worker error:', error);
      // You might want to add error reporting here (e.g., Sentry)
      throw error;
    }
  }
};
