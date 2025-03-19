This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

pdf-app/
│── .next/          # Next.js build output
│── .swc/           # SWC (Rust-based compiler) cache
│── coverage/       # Code coverage reports
│── node_modules/   # Project dependencies
│── public/         # Static assets (images, fonts, etc.)
│── src/            # Source code
│   ├── app/        # Main application logic
│   │   ├── api.ts        # API-related logic
│   │   ├── db.ts         # Database configuration(IndexedDB)
│   │   ├── layout.tsx    # Layout component
│   │   ├── page.tsx      # Main page component
│   │   ├── page.test.tsx # Test main page component
│   │   ├── providers.tsx # Context providers
│   │   ├── types.ts      # TypeScript type definitions
│   │   ├── globals.css   # Global styles
│── .env            # Environment variables
│── .gitignore      # Files to be ignored by Git
│── jest.config.ts  # Jest configuration for testing
│── jest.setup.ts   # Jest setup file
│── next-env.d.ts   # Next.js environment types
│── next.config.ts  # Next.js configuration
│── package.json    # Project metadata and dependencies
│── package-lock.json  # Dependency lockfile