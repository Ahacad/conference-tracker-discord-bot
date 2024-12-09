import { Conference } from "../models/conference";
import * as cheerio from "cheerio";

export class ConferenceFetcher {
  private readonly categories: string[];

  constructor(
    private readonly baseUrl: string,
    categoriesStr: string,
  ) {
    this.categories = categoriesStr.split(",").map((c) => c.trim());
  }

  async fetchNewConferences(): Promise<Conference[]> {
    const conferences: Conference[] = [];

    for (const category of this.categories) {
      try {
        const url = `${this.baseUrl}/cfp/call?conference=${encodeURIComponent(
          category,
        )}`;
        console.log("Fetching from URL:", url);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Find all conference rows (those with bgcolor="#f6f6f6" or bgcolor="#e6e6e6")
        const rows = $(
          '.contsec table tbody tr[bgcolor="#f6f6f6"], .contsec table tbody tr[bgcolor="#e6e6e6"]',
        );
        console.log("Found rows:", rows.length);

        // Convert cheerio object to array for easier iteration
        const rowsArray = rows.toArray();

        // Process rows in pairs (each conference takes 2 rows)
        for (let i = 0; i < rowsArray.length; i += 2) {
          try {
            const titleRow = $(rowsArray[i]);
            const detailsRow = $(rowsArray[i + 1]);

            if (!titleRow.length || !detailsRow.length) {
              console.log("Skipping invalid row pair at index", i);
              continue;
            }

            // Extract from title row
            const linkElement = titleRow.find("td:first-child a").first();
            const href = linkElement.attr("href");
            if (!href) {
              console.log("No href found for row", i);
              continue;
            }

            const eventId = this.extractEventId(href);
            const shortName = linkElement.text().trim();
            const fullTitle = titleRow.find('td[colspan="3"]').text().trim();

            // Extract from details row
            const dateText = detailsRow.find("td:nth-child(1)").text().trim();
            const location = detailsRow.find("td:nth-child(2)").text().trim();
            const deadline = detailsRow.find("td:nth-child(3)").text().trim();

            if (eventId && deadline) {
              const conference: Conference = {
                id: eventId,
                name: fullTitle || shortName,
                deadline,
                website: `${this.baseUrl}${linkElement.attr("href")}`,
                location: location !== "N/A" ? location : "",
                categories: [category],
                lastUpdated: new Date().toISOString(),
              };

              console.log("Parsed conference:", conference.name);
              conferences.push(conference);
            }
          } catch (error) {
            console.error("Error parsing conference pair:", error);
            continue;
          }
        }
      } catch (error) {
        console.error(
          `Error fetching conferences for category ${category}:`,
          error,
        );
      }
    }

    console.log(`Total conferences found: ${conferences.length}`);
    return conferences;
  }

  private extractEventId(href: string): string {
    try {
      const match = href.match(/eventid=(\d+)/);
      return match ? match[1] : "";
    } catch (error) {
      console.error("Error extracting event ID from href:", href, error);
      return "";
    }
  }
}
