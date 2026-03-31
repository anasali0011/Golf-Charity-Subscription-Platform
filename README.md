# GolfLottery - Fantasy Subscription App

This is a modern, responsive full-stack application for a subscription-based golf lottery system built with React, Vite, Node.js, Express, and PostgreSQL (Supabase).

## Highlights

*   **Extremely Rich UI**: Built with a sleek Glassmorphism design pattern directly using Tailwind CSS utilities to provide a stunning impression.
*   **Complete Draw Logic**: Handles creating pools, deducting charity amounts, calculating multiple tiers of winnings based on matching a user's rolling top-5 scores against winning numbers.
*   **Five Score Constraint**: A strict database management logic limits user scores to the latest 5 entries, automatically dropping the oldest.
*   **Separation of Concerns**: Beautifully typed APIs and segregated logic layers mimicking a high-quality production codebase ready for deployment.

## Installation & Setup

1. **Backend**:
   ```bash
   cd backend
   npm install
   ```
   *Create a `.env` file in the backend folder using `.env.example` as a template (fill your Supabase URL & Key).*
   
   Execute the `schema.sql` via Supabase SQL Editor.
   
   *Start Backend*: `npm run dev`

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   ```
   *Start Frontend*: `npm run dev`

*The frontend runs at http://localhost:5173 by default, and communicates with the backend at http://localhost:5000/api.*
