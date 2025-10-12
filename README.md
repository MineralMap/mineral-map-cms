# Mineral Map CMS

Content Management System for the Dice Museum Staff, integrates with Mineral Map.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev

# Build for production
npm run build
```

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Development guide and architecture overview
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Netlify deployment instructions
- **[scripts/README.md](scripts/README.md)** - Database setup guide

## Key Features

- 🔐 Authentication with Supabase Auth
- 📝 Rich text editing with TinyMCE
- 🖼️ Image and video management
- 🏷️ Tagging system
- 📱 Responsive design with Tailwind CSS
- 🔒 Row Level Security for data protection
- 🌐 Public API for reading data (write access requires authentication)

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms:** React Hook Form + Zod
- **State:** TanStack Query (React Query)
- **Routing:** React Router v7
