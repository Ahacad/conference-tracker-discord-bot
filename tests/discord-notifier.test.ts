import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { DiscordNotifier } from '../src/services/discord-notifier';
import { Response } from '@cloudflare/workers-types';

describe('DiscordNotifier', () => {
  let notifier: DiscordNotifier;
  
  beforeEach(() => {
    notifier = new DiscordNotifier('http://discord-webhook.com');
  });

  test('notifyNewConference should send formatted message to Discord', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    );

    const conference = {
      id: '123',
      name: 'Test Conference',
      deadline: '2024-12-31',
      website: 'http://test.com',
      location: 'Test Location',
      categories: ['test'],
      lastUpdated: new Date().toISOString()
    };

    await notifier.notifyNewConference(conference);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://discord-webhook.com',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Test Conference')
      })
    );
  });

  test('notifyNewConference should handle Discord API errors', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Invalid webhook' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      })
    );

    const conference = {
      id: '123',
      name: 'Test Conference',
      deadline: '2024-12-31',
      website: 'http://test.com',
      location: 'Test Location',
      categories: ['test'],
      lastUpdated: new Date().toISOString()
    };

    await expect(notifier.notifyNewConference(conference)).rejects.toThrow();
  });
});
