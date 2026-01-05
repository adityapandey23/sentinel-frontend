# Sentinel Frontend

This is the frontend application for the Sentinel project, built with [Next.js](https://nextjs.org/).

## Prerequisites

Before running this project, ensure you have the following installed:

- **Bun**: This project uses `bun.lock`, so [Bun](https://bun.sh/) is the preferred package manager.
- **Backend Service**: The Sentinel backend service **must be up and running** for this frontend to function correctly.

## Getting Started

### 1. Installation

Install the project dependencies using Bun:

```bash
bun install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory of the project to store your environment variables. You can base it on the following example:

```bash
# .env.local

# URL of the running backend API (e.g., http://localhost:8080)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

> **Note:** Make sure `NEXT_PUBLIC_API_BASE_URL` points to your actual running backend instance.

### 3. Running Locally

Once the dependencies are installed and the backend is running, you can start the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
