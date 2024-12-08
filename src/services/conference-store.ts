import { Conference } from '../models/conference';

export class ConferenceStore {
  constructor(private readonly kv: KVNamespace) {}

  async saveConference(conference: Conference): Promise<void> {
    const key = `conf_${conference.id}`;
    await this.kv.put(key, JSON.stringify(conference));
  }

  async getConference(id: string): Promise<Conference | null> {
    const key = `conf_${id}`;
    const data = await this.kv.get(key);
    return data ? JSON.parse(data) : null;
  }

  async getAllConferences(): Promise<Conference[]> {
    const list = await this.kv.list();
    const conferences: Conference[] = [];
    
    for (const key of list.keys) {
      const data = await this.kv.get(key.name);
      if (data) conferences.push(JSON.parse(data));
    }
    
    return conferences;
  }
}
