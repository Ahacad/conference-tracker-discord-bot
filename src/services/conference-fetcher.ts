import { Conference } from '../models/conference';
import * as cheerio from 'cheerio';

export class ConferenceFetcher {
  constructor(
    private readonly baseUrl: string,
    private readonly categories: string[] = ['computer science', 'artificial intelligence']
  ) {}

  async fetchNewConferences(): Promise<Conference[]> {
    const conferences: Conference[] = [];
    
    for (const category of this.categories) {
      const url = `${this.baseUrl}/cfp/call?category=${encodeURIComponent(category)}`;
      const response = await fetch(url);
      const html = await response.text();
      
      const $ = cheerio.load(html);
      $('.contsec table tr:not(:first-child)').each((_, row) => {
        const conf = this.parseConferenceRow($, row);
        if (conf) conferences.push(conf);
      });
    }
    
    return conferences;
  }

  private parseConferenceRow($: cheerio.CheerioAPI, row: cheerio.Element): Conference | null {
    try {
      const cols = $(row).find('td');
      if (cols.length < 4) return null;

      return {
        id: $(cols[0]).find('a').attr('href')?.split('=')[1] || '',
        name: $(cols[0]).text().trim(),
        deadline: $(cols[1]).text().trim(),
        website: $(cols[2]).find('a').attr('href') || '',
        location: $(cols[3]).text().trim(),
        categories: this.categories,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error parsing conference row:', error);
      return null;
    }
  }
}

