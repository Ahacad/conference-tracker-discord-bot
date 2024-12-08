import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { ConferenceFetcher } from '../src/services/conference-fetcher';
import { Response } from '@cloudflare/workers-types';

describe('ConferenceFetcher', () => {
  let fetcher: ConferenceFetcher;
  
  beforeEach(() => {
    fetcher = new ConferenceFetcher('http://example.com');
  });

  test('fetchNewConferences should parse HTML and return conferences', async () => {
    const mockHtml = `
      <div class="contsec">
        <table>
          <tr><th>Conference</th><th>Deadline</th><th>Website</th><th>Location</th></tr>
          <tr>
            <td><a href="?id=123">TestConf 2024</a></td>
            <td>Dec 31, 2024</td>
            <td><a href="http://test.com">Website</a></td>
            <td>New York, USA</td>
          </tr>
        </table>
      </div>
    `;

    jest.mocked(global.fetch).mockResolvedValueOnce(
      new Response(mockHtml, {
        status: 200,
        headers: { 'content-type': 'text/html' }
      })
    );

    const conferences = await fetcher.fetchNewConferences();
    
    expect(conferences).toHaveLength(1);
    expect(conferences[0]).toEqual({
      id: '123',
      name: 'TestConf 2024',
      deadline: 'Dec 31, 2024',
      website: 'http://test.com',
      location: 'New York, USA',
      categories: ['computer science', 'artificial intelligence'],
      lastUpdated: expect.any(String)
    });
  });

  test('fetchNewConferences should handle empty response', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(
      new Response('', {
        status: 200,
        headers: { 'content-type': 'text/html' }
      })
    );

    const conferences = await fetcher.fetchNewConferences();
    expect(conferences).toHaveLength(0);
  });

  test('fetchNewConferences should handle network errors', async () => {
    jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
    await expect(fetcher.fetchNewConferences()).rejects.toThrow('Network error');
  });
});

