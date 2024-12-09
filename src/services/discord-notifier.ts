import { Conference } from "../models/conference";

export class DiscordNotifier {
  constructor(private readonly webhookUrl: string) {}

  async notifyNewConference(conference: Conference): Promise<void> {
    const embed = {
      title: conference.name,
      description: `New conference found!`,
      fields: [
        {
          name: "Deadline",
          value: conference.deadline,
          inline: true,
        },
        {
          name: "Location",
          value: conference.location,
          inline: true,
        },
        {
          name: "Website",
          value: conference.website,
        },
      ],
      color: 0xa0522d,
    };

    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        `Discord API error: ${error.error || response.statusText}`,
      );
    }
  }
}
