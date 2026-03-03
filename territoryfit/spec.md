# Specification

## Summary
**Goal:** Build FitZone Conquest, a territory-based fitness tracking multiplayer web app with gamification, social features, an in-app store, and an admin panel, using a minimalist black-and-white theme.

**Planned changes:**
- **Authentication & Onboarding:** Guest mode (temporary session) and Internet Identity login (persistent account); profile dashboard showing username, avatar, level, XP, and fitness stats; onboarding form collecting name, age, gender, height, weight, and fitness goal
- **Fitness Activity Tracking:** Manual workout session logging (running, walking, jogging, cycling, outdoor workout) capturing activity type, duration, distance, pace, estimated calories, and timestamp; activity history grouped by day/week/month
- **Health Analytics Dashboard:** Line/bar charts for distance and calories over 7 and 30 days; personal bests; daily goal progress bar; week-over-week trend indicators
- **AI Fitness Coach (Rule-Based):** Template-driven personalized workout routines, diet/meal suggestions, hydration reminders, and recovery tips based on user profile and recent activity; gated behind Pro/Elite subscription tiers
- **Territory Game Mode:** Fixed SVG/canvas grid map of named territory zones; users claim zones by logging zone passes during workouts; zone ownership assigned to user with highest cumulative pass count; takeover logic handled server-side; each user has a unique accent color
- **Live Territory Map:** SVG/canvas grid rendering all zones in owner colors; selected zone highlighted; contested zones show conflict indicator; ownership changes animate with color-fill transition; responsive and mobile-friendly
- **Leaderboards:** Global and region-filtered leaderboards ranked by territories owned, distance, calories, and successful takeovers; top 100 display with current user rank highlighted
- **Gamification & Rewards:** XP awarded for workouts, captures, and takeovers; level progression table; badge collection for milestones; daily/weekly challenges with bonus XP; login streak tracking
- **Social & Community:** Friend requests and friend list; public activity feed showing last 20 friend activities; team creation/joining with aggregated zone passes for team territory battles; activity share via clipboard
- **Subscription Tiers:** Four tiers (Free, Premium, Pro, Elite) stored per user; Free tier shows ad placeholder banner; AI Coach locked for Free/Premium; Elite tier counts zone passes as 2x; subscription management page
- **In-App Purchase Store:** Territory Boosters, XP Multipliers, Cosmetic Skins, and Power-ups purchasable via Stripe Checkout; inventory and timed active boosts stored in backend; active boosts visible on profile
- **Admin Panel:** Admin-only access by whitelisted principals; user management (list, ban, reset stats); territory monitor; subscription tier override; feature flag toggles; revenue dashboard
- **UI/UX:** Minimalist black (#0a0a0a) and white (#f5f5f5) palette with player territory colors as sole accents; bold modern typography; bottom tab bar on mobile, sidebar on desktop; XP gain, level-up, and zone capture animation overlays; smooth micro-animations throughout; app icon and splash screen assets displayed on login/loading screen

**User-visible outcome:** Users can sign in or play as a guest, log fitness workouts, compete for territory zones on an interactive grid map, view analytics and AI coaching recommendations, participate in leaderboards and team battles, earn XP/badges/rewards, purchase power-ups via Stripe, and admins can manage all aspects of the platform through a dedicated control panel.
