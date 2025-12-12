# Wikits - Project Status Report

**Date**: December 11, 2025
**Version**: 0.1.5 (Core Feature Complete)

## 1. Executive Summary
The project "Wikits" has successfully transitioned from a dashboard concept to a Generative Learning Engine. All core pillars—**Learn** (Generation), **Map** (Visualization), **Wiki** (Archive), and **Forum** (Discussion)—are implemented and functional. The application is backed by a persistent PostgreSQL database and features a unified Global UI.

## 2. Completed Features

### 🎓 Learn (Generative Engine)
- **Status**: ✅ Working
- **Features**: 
  - Dynamic Syllabus Generation (JSON-structured).
  - Chapter Content Generation (Streaming Markdown).
  - **Persistence**: Automatically saves all generated topics and chapters to the DB.

### 🗺️ Map (Knowledge Graph)
- **Status**: ✅ Working (Optimized)
- **Features**:
  - **3D Visualization**: `react-three-fiber` point cloud.
  - **Performance**: Optimized edge rendering (1 draw call) and imperative node loops (60FPS).
  - **Interactivity**: node selection, detail cards, zoom/reset controls.

### 🏛️ Wiki (Living Archive)
- **Status**: ✅ Working
- **Features**:
  - **Index**: Gallery of all saved topics (`/wiki`).
  - **Topic View**: Read-optimized layout with sticky TOC (`/wiki/[slug]`).
  - **Relations**: Deep linking between related topics.

### 🗣️ Forum (Community)
- **Status**: ✅ Working
- **Features**:
  - **Threads**: Create and view discussions.
  - **Replies**: Threaded conversation view.
  - **Tech**: Uses React Server Actions for instant DB mutations.

### 🌍 Global UI
- **Status**: ✅ Working
- **Features**:
  - **Bottom Dock**: Unified navigation bar (Home, Map, Wiki, Forum).
  - **Sidebar**: Toggleable Tree View (Mock Data).
  - **Inspector**: Toggleable Activity Log (Mock Data).
  - **Responsive**: Mobile-ready layouts (Tailwind).

## 3. Architecture & Tech Stack
- **Framework**: Next.js 16 (App Router).
- **Database**: PostgreSQL (Neon) via Drizzle ORM.
- **State Management**: Zustand (Global UI Store).
- **Styling**: Tailwind CSS + Framer Motion.
- **AI**: Vercel AI SDK (OpenRouter/OpenAI).

## 4. Known Limitations (Technical Debt)
1.  **Sidebar Data**: The Sidebar Tree View currently uses **Mock Data**. It needs to be connected to the `getAllTopics` query to reflect the real database state.
2.  **Inspector Data**: The Activity Log is currently **Mock Data**. A real `events` table or logging system is needed.
3.  **Authentication**: Users are currently "Anonymous". No login/signup system exists.
4.  **Local LLM**: The "Use Local Model" toggle in Settings is UI-only and does not yet switch the AI provider.

## 5. Next Steps
1.  **Sidebar Integration**: Replace mock data with real DB hierarchy.
2.  **Authentication**: Implement Auth (e.g., Clerk or NextAuth) to replace "Anonymous" users.
3.  **Real Activity Log**: Implement event tracking for the Inspector.
4.  **Dashboard**: A centralized "Home" dashboard showing progress and stats (optional).
