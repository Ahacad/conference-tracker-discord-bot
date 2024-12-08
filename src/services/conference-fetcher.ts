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
        const url = `${this.baseUrl}/cfp/call?conference=${encodeURIComponent(category)}`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        const html = await response.text();
        
        const $ = cheerio.load(html);
        
        // Find the conference table within contsec
        const mainTable = $('.contsec table table').last();
        
        // Find rows with bgcolor="#f6f6f6" or bgcolor="#e6e6e6"
        const rows = mainTable.find('tr[bgcolor="#f6f6f6"], tr[bgcolor="#e6e6e6"]');
        console.log('Found rows:', rows.length);
        
        // Process rows in pairs
        for (let i = 0; i < rows.length; i += 2) {
          try {
            const titleRow = $(rows[i]);
            const detailsRow = $(rows[i + 1]);
            
            if (!titleRow.length || !detailsRow.length) continue;
            
            // Extract data from the first row
            const linkElement = titleRow.find('td:first-child a');
            const eventId = this.extractEventId(linkElement.attr('href') || '');
            const shortName = linkElement.text().trim();
            const fullTitle = titleRow.find('td[colspan="3"]').text().trim();
            
            // Extract data from the second row
            const cells = detailsRow.find('td');
            const date = $(cells[0]).text().trim();
            const location = $(cells[1]).text().trim();
            const deadline = $(cells[2]).text().trim();
            
            if (eventId && deadline) {
              const conference: Conference = {
                id: eventId,
                name: fullTitle || shortName,
                deadline,
                website: `${this.baseUrl}${linkElement.attr('href')}`,
                location: location !== 'N/A' ? location : '',
                categories: [category],
                lastUpdated: new Date().toISOString()
              };
              
              console.log('Parsed conference:', conference.name);
              conferences.push(conference);
            }
          } catch (error) {
            console.error('Error parsing conference pair:', error);
            continue;
          }
        }
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
