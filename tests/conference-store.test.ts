import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { ConferenceStore } from '../src/services/conference-store';

describe('ConferenceStore', () => {
  let store: ConferenceStore;
  let mockKV: KVNamespace;

  beforeEach(() => {
    mockKV = {
      put: jest.fn(),
      get: jest.fn(),
      list: jest.fn()
    } as unknown as KVNamespace;
    
    store = new ConferenceStore(mockKV);
  });

  test('saveConference should store conference in KV', async () => {
    const conference = {
      id: '123',
      name: 'Test Conference',
      deadline: '2024-12-31',
      website: 'http://test.com',
      location: 'Test Location',
      categories: ['test'],
      lastUpdated: new Date().toISOString()
    };

    await store.saveConference(conference);

    expect(mockKV.put).toHaveBeenCalledWith(
      'conf_123',
      JSON.stringify(conference)
    );
  });
});

