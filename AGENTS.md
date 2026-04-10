## Learned User Preferences

- Use Inter font only, 10–24px range app-wide, semi-bold (600) max weight, no bold; on the Plan page the moving-plan column uses only 13–14px (labels 13px, values 14px) with line-height = font-size + 4px
- Use Base UI (`@base-ui/react`) as the component library
- UI should be simple and minimal — "the ui needs to be way simpler"
- Design follows a specific Figma source-of-truth file; implement it exactly, matching all styles, text, and colors
- Use `make-interfaces-feel-better` skill for UI polish (shadows over borders, staggered animations, scale on press, specific transition properties — never `transition: all`)
- Build large features in stages rather than all at once
- City-first flow: select a city before choosing a mode; city-named get-started suggestion badges must update dashboard `citySlug` before navigating so the map and chat intake stay aligned
- Map location dots should be black
- Layout: 20px page padding, breadcrumb top bar (grey “Moving to:” label before the city where used), left sidebar with icon nav items, main content panel with 24px radius and map as background fill; no drawers, no tab systems; plan and profile document columns use 40px vertical spacing between major sections
- Paired title lines (e.g. app name + tagline, city + nickname): same type size and weight; second line stays muted color; 0px gap between the two lines; line-height = font-size + 4px for text scale
- Primary accent and highlights: Apple system blue (not orange) everywhere in the UI, including agent chat bubbles
- Plan and Profile chats: rotating page-specific conversation starters; never ask for information already stored on the profile or elsewhere in the app; Plan chat should iterate on the move plan (e.g. budgeting) rather than re-collecting basics like income

## Learned Workspace Facts

- Tech stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Mapbox GL JS v3, Base UI
- Project is a cost-of-living explorer for US cities ("Can You Live Here?")
- Mapbox token stored in `.env.local` as `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- Map uses Mapbox `streets-v12` (`lib/mapbox.ts`); dashboard shell renders the map layer at ~20% opacity; design tokens and CSS custom properties in `app/globals.css`
- Mapbox default attribution and navigation UI are hidden in the embedded map
- All five beta cities (LA, SF, Chicago, NYC, Boston) have dossier data in `data/dashboard/city-dossiers.ts`
- AI SDK (`ai`, `@ai-sdk/openai`) and `zod` installed; `OPENAI_API_KEY` in `.env.local` (server-side only)
- Plan intake via `/api/chat-intake`; profile chat via `/api/profile-chat`; affordability summary via `/api/affordability-summary`; structured dashboard summary via `/api/dashboard-summary`
- Primary plan workspace is `/dashboard/chat` (sidebar label Plan) with an even split between the document rail and chat column
- `npx skills add jakubkrehel/make-interfaces-feel-better` installed for design engineering guidance
- Turbopack root set to `__dirname` in `next.config.ts` to suppress lockfile warning
- Design tokens: `#0F0F0F` bg, `#141414` raised, `#3C3C3C` surface/active, `#DCDCDC` secondary text, `#656565` muted, global `-0.02em` letter-spacing
