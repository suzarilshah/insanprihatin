I have revised the plan to ensure **100% CMS compatibility**. All content managed via your CMS (Hero text, About/Mission, Impact Stats, and Projects) will be preserved and displayed in the new high-converting structure.

### 1. Structure & CMS Integration
I will restructure `src/app/page.tsx` to follow the "Outcome-Focused" narrative while pulling dynamic data:

1.  **Hero Section** (CMS-Driven):
    -   Uses `getHeroContent()` for Title, Subtitle, and Background.
    -   *Enhancement*: I will refine the `Hero` component design to be more "aspirational" without changing the data source.

2.  **Problem Section** (Static + Context):
    -   A new dedicated section to articulate the "Pain Point" (as requested).
    -   *Note*: Since there is no "Problem" table in your CMS, this will use high-quality static copy initially.

3.  **Solution Section** (CMS-Driven Powerhouse):
    -   **Replaces "Programs"**: Instead of static icons, we will showcase your **Real Projects**.
    -   **Data Source**: I will fetch `getProjects({ limit: 3, published: true })` to display your actual latest work as the "Solution".
    -   **Trust Indicators**: I will integrate `getImpactStats()` here to prove the solution works.
    -   **Mission Context**: I will use `getAboutContent()` (Mission/Vision) here to explain the *philosophy* behind the solution.

4.  **How It Works** (Static):
    -   A visual 3-step process flow (Donation -> Deployment -> Impact).
    -   *Rationale*: This is usually static structural content.

5.  **Final CTA** (Static/Dynamic):
    -   Hardcoded high-conversion copy ("Join us today") directing to your Donation page.

### 2. Implementation Steps

#### A. Data Fetching Update
I will update `src/app/page.tsx` to fetch the additional `projects` data:
```typescript
const [heroContent, aboutContent, impactStats, projects] = await Promise.all([
  getHeroContent(),
  getAboutContent(),
  getImpactStats(),
  getProjects({ limit: 3, published: true }) // New fetch
])
```

#### B. New Components
-   **`src/components/sections/Problem.tsx`**: Dark, emotive section focusing on the community need.
-   **`src/components/sections/Solution.tsx`**: A dynamic component that accepts `projects`, `impactStats`, and `aboutContent` as props to build a comprehensive "Our Solution" narrative.
-   **`src/components/sections/HowItWorks.tsx`**: Visual process flow.

#### C. Design System
-   Retain your `globals.css` "Premium" theme.
-   Use `framer-motion` for "staggered reveals" as requested in aesthetics.

### 3. Execution Order
1.  Create `Problem`, `Solution`, `HowItWorks` components.
2.  Update `page.tsx` to fetch data and assemble the new layout.
3.  Verify that all CMS data (About text, Projects, Stats) appears correctly in the new layout.

This approach gives you the **structure you want** (Hero -> Problem -> Solution) without losing the **CMS flexibility you need**.