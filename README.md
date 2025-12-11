
# Peak Learn

Peak Learn is a comprehensive Knowledge Graph platform designed to facilitate deep, structured learning. It combines a hierarchical Wiki system, a Reddit-inspired Forum for topic-specific discussions, and a 2D Vector Map for visualizing knowledge connections.

## Key Features

### 1. Hierarchical Wiki System
*   **Deep Nesting:** Topics support parent/child relationships, forming a true knowledge tree.
*   **Curated Ordering:** Topics are presented in a specific pedagogical order (based on a curated Wikipedia outline) rather than just alphabetical sorting.
*   **Interactive Sidebar:** A recursive sidebar component allows traversal of the entire knowledge graph.
*   **Article View:** A polished, academic aesthetic for reading topics, including syllabus, chapters, and sub-topic grids.

### 2. "Peak/Sub" Forum System
*   **Topic-Based Communities:** Every Wiki Topic acts as a "Subreddit" (e.g., `/wiki/physics` has a corresponding `/wiki/physics/forum`).
*   **Threaded Discussions:** Users can create threads via a clean modal interface.
*   **Wiki Context Drawer:** A unique "Context Drawer" allows users to reference the Wiki article *while* participating in forum discussions.

### 3. Visual Knowledge Graph (Map)
*   **2D Vector Map:** A D3-based force-directed graph to visualize topics and their relationships.
*   **Real-time Physics:** Nodes naturally cluster based on their connections.

### 4. Robust Backend & Infrastructure
*   **Stack:** Next.js 16 (Turbopack), Drizzle ORM, Postgres, TailwindCSS, Shadcn/UI, Lucide React.
*   **Database:** A typed, efficient schema handling Topics, Chapters, Threads, Posts, Tags, Relationships, and FAQs.
*   **Factory Reset / Seeding:** A `/api/seed` route that performs a true factory reset, clearing all data and restoring the pristine hierarchical structure with correct ordering.

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up the database:**
    Ensure you have a Postgres database running and `DATABASE_URL` set in `env.local`.
    ```bash
    npx drizzle-kit push
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Seed the database:**
    Visit `http://localhost:3000/api/seed` to populate the initial knowledge graph.

