import { Conference } from '../models/conference';
import * as cheerio from 'cheerio';

export class ConferenceFetcher {
  constructor(
    private readonly baseUrl: string,
    private readonly categories: string[] = ['artificial intelligence']
  ) {}

  async fetchNewConferences(): Promise<Conference[]> {
    const conferences: Conference[] = [];
    
    for (const category of this.categories) {
      try {
        const url = `${this.baseUrl}/cfp/servlet/event.showcfp?contextid=1&sortby=1`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Find the main content table
        const mainTable = $('table.conferencetable');
        
        // Process each odd row (containing conference info)
        mainTable.find('tr:not(.tableheader)').each((i, row) => {
          try {
            const columns = $(row).find('td');
            if (columns.length < 4) return; // Skip if row structure is invalid
            
            const eventLink = $(columns[0]).find('a').first();
            const eventId = this.extractEventId(eventLink.attr('href') || '');
            const name = eventLink.text().trim();
            const deadline = $(columns[1]).text().trim();
            const conference = $(columns[2]).text().trim();
            const location = $(columns[3]).text().trim();
            
            if (eventId && name && deadline) {
              conferences.push({
                id: eventId,
                name: name,
                deadline: deadline,
                website: `${this.baseUrl}${eventLink.attr('href')}`,
                location: location !== 'N/A' ? location : '',
                categories: [category],
                lastUpdated: new Date().toISOString()
              });
              
              console.log('Parsed conference:', name);
            }
          } catch (error) {
            console.error('Error parsing conference row:', error);
          }
        });
        
      } catch (error) {
        console.error(`Error fetching conferences for category ${category}:`, error);
      }
    }
    
    console.log(`Total conferences found: ${conferences.length}`);
    return conferences;
  }

  private extractEventId(href: string): string {
    const match = href.match(/eventid=(\d+)/);
    return match ? match[1] : '';
  }
}
