# OtterLink V2 Rebuild Sprint Checklist

- `[x]` **Sprint 1: Module A – Family Foundation**
  - `[x]` **1.1: Backend Schema Setup**
    - Set up `shared_values_profiles` schema and RLS policies inside database layer.
    - Set up `parent_alignment_profiles` schema and parent-to-parent security constraints.
  - `[x]` **1.2: Onboarding Setup Wizard**
    - Create [OnboardingWizard.tsx](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/OtterLink/Site%20Files/src/components/dashboard/OnboardingWizard.tsx) mapping out value selections and co-parent invitation hooks.
  - `[x]` **1.3: Parenting Alignment Questionnaire**
    - Create [AlignmentQuestionnaire.tsx](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/OtterLink/Site%20Files/src/components/dashboard/AlignmentQuestionnaire.tsx) to capture priorities, desired outcomes, and compare metrics visually.
  - `[x]` **1.4: Integration & Routing**
    - Hook the wizard into the `/onboarding` route and secure the user landing logic.

- `[x]` **Sprint 2: Module B – Growth Recognition System**
  - `[x]` **2.1: Backend Recognition Models**
    - Set up `growth_recognitions` table structure and secure-context RLS logic.
    - Define comments/reactions tables to support social reinforcement loop.
  - `[x]` **2.2: Growth Recognition Dialog**
    - Create [GiveRecognitionDialog.tsx](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/OtterLink/Site%20Files/src/components/dashboard/GiveRecognitionDialog.tsx) with a multi-step user flow.
  - `[x]` **2.3: Recognition Feed & Reactions**
    - Update [DashboardV2.tsx](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/OtterLink/Site%20Files/src/pages/DashboardV2.tsx) to display the newly integrated Growth Feed, including parent reactions.

- `[x]` **Sprint 3: Module C – Parent Alignment Layer**
  - `[x]` **3.1: Alignment Engine Calculations**
    - Write local utility layer or query triggers to identify shared recognitions and underrepresented traits.
  - `[x]` **3.2: Alignment Dashboard**
    - Create an elegant **Parent Alignment Panel** visualizing overlapping goals, shared recognitions, and educational trends in [AlignmentDashboardV2.tsx](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/OtterLink/Site%20Files/src/components/dashboard/AlignmentDashboardV2.tsx).

- `[x]` **Sprint 4: Module D – Child Space**
  - `[x]` **4.1: Secure Routing & Layout**
    - Create [ChildSpaceV2.tsx](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/OtterLink/Site%20Files/src/pages/ChildSpaceV2.tsx) styled specifically for children, emphasizing warmth, predictability, and safety.
  - `[x]` **4.2: Child Journey Feed**
    - Construct the "What People Noticed" child feed, showing recognitions from both households.
  - `[x]` **4.3: Feelings Check-ins**
    - Implement a clean visual feeling log for kids, updating the database check-in table.

- `[x]` **Sprint 5: Module E – Transition Tracking**
  - `[x]` **5.1: Exchange Logging System**
    - Create [TransitionTrackerV2.tsx](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/OtterLink/Site%20Files/src/components/dashboard/TransitionTrackerV2.tsx) providing exchange logging forms for parents.
  - `[x]` **5.2: Transition Check-ins for Kids**
    - Design a simple pre-exchange child mood check-in with support for quick reflections.

- `[x]` **Sprint 6: Module F – Growth Journey**
  - `[x]` **6.1: Aggregated Developmental Timeline**
    - Aggregate historical recognitions, feelings, and milestones into a visual timeline.
  - `[x]` **6.2: Constellation Visualization**
    - Create a clean premium **Growth Constellation Mapping** showing narrative growth over scores in [GrowthConstellation.tsx](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/OtterLink/Site%20Files/src/components/dashboard/GrowthConstellation.tsx).
  - `[x]` **6.3: Staging Compile & Release**
    - Run production build pipelines, prune stale cached staging resources, and deploy clean V2 build to staging folder `y:\otterlink\`.
