import { ConferenceStore } from "./services/conference-store";
import { ConferenceFetcher } from "./services/conference-fetcher";
import { DiscordNotifier } from "./services/discord-notifier";

interface Env {
  CONFERENCES: KVNamespace;
  DISCORD_WEBHOOK_URL: string;
  WIKICFP_BASE_URL: string;
  CONFERENCE_CATEGORIES: string;
}

async function handleConferenceCheck(env: Env) {
  const fetcher = new ConferenceFetcher(env.WIKICFP_BASE_URL, env.CONFERENCE_CATEGORIES);
  const store = new ConferenceStore(env.CONFERENCES);
  const notifier = new DiscordNotifier(env.DISCORD_WEBHOOK_URL);

  const conferences = await fetcher.fetchNewConferences();
  const results = {
    processed: 0,
    new: 0,
    errors: 0,
    details: [],
  };

  for (const conference of conferences) {
    try {
      const existing = await store.getConference(conference.id);
      results.processed++;

      if (!existing) {
        await store.saveConference(conference);
        await notifier.notifyNewConference(conference);
        results.new++;
        results.details.push({
          status: "new",
          name: conference.name,
          id: conference.id,
        });
      } else {
        results.details.push({
          status: "existing",
          name: conference.name,
          id: conference.id,
        });
      }
    } catch (error) {
      results.errors++;
      results.details.push({
        status: "error",
        name: conference.name,
        id: conference.id,
        error: error.message,
      });
    }
  }

  return results;
}

export default {
  // Scheduled task remains the same
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    try {
      await handleConferenceCheck(env);
    } catch (error) {
      console.error("Error in scheduled task:", error);
    }
  },

  // New fetch handler for manual testing
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // Only allow GET requests
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const results = await handleConferenceCheck(env);

      return new Response(
        JSON.stringify(
          {
            success: true,
            timestamp: new Date().toISOString(),
            results: results,
          },
          null,
          2,
        ),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify(
          {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        ),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }
  },
};
