# BloomSpace Marketplace

A modern marketplace connecting local florists with customers, built with React, TypeScript, and Supabase.

## Features

- 🌺 Browse and search local florists
- 📍 Location-based search with Google Maps integration
- 🛒 Easy ordering and checkout process
- 🚚 Real-time delivery tracking
- 💐 Florist dashboard for managing orders and inventory
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Query
- **Backend**: Supabase
- **Maps & Geocoding**: Google Maps API
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **File Storage**: Supabase Storage
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/bloomspace-marketplace.git
cd bloomspace-marketplace
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
- Copy `.env.example` to `.env`
- Fill in the required values:
  - Supabase credentials
  - Google Maps API key
  - Other configuration values

4. Start the development server
```bash
npm run dev
```

## Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `VITE_SENTRY_DSN`: Your Sentry DSN (optional)

## API Keys Setup

### Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Distance Matrix API
4. Create credentials (API key)
5. Add the API key to your `.env` file

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run test`: Run tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@bloomspace.com or join our Slack channel.
