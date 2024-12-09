# Conference Tracker Bot

An automated academic conference tracker that posts updates to Discord.

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/conference-tracker
cd conference-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create your KV namespace:
```bash
wrangler kv:namespace create CONFERENCES
```

4. Create your configuration:
```bash
# Copy example configurations
cp wrangler.example.toml wrangler.toml
cp .env.example .env

# Edit wrangler.toml and update your KV namespace ID
```

5. Set up secrets:
```bash
# Set your Discord webhook URL
wrangler secret put DISCORD_WEBHOOK_URL

# Set WikiCFP base URL (optional, defaults to http://www.wikicfp.com)
wrangler secret put WIKICFP_BASE_URL
```

6. Deploy:
```bash
npm run deploy
```

## Development

1. Run tests:
```bash
npm test
```

2. Local development:
```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Submit a pull request

## Environment Variables

The following environment variables are required:

- `DISCORD_WEBHOOK_URL`: Your Discord webhook URL
- `CONFERENCES`: KV namespace for storing conference data

Optional variables:
- `WIKICFP_BASE_URL`: Base URL for WikiCFP (defaults to http://www.wikicfp.com)

