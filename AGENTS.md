## Learned User Preferences

- Use Inter font only, 10–24px range, semi-bold (600) max weight, no bold
- Use Base UI (`@base-ui/react`) as the component library
- UI should be simple and minimal — "the ui needs to be way simpler"
- Dark theme inspired by Cursor dashboard UI (cursor.com/dashboard)
- Glass morphism elements on surfaces (backdrop-blur, semi-transparent backgrounds)
- Use `make-interfaces-feel-better` skill for UI polish (shadows over borders, staggered animations, scale on press, specific transition properties — never `transition: all`)
- Build large features in stages rather than all at once
- City-first flow: let users select a city before choosing a mode
- Map location dots should be black
- Floating sidebar (inset from edges, rounded corners) rather than flush panels

## Learned Workspace Facts

- Tech stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Mapbox GL JS v3, Base UI
- Project is a cost-of-living explorer for US cities ("Can You Live Here?")
- Mapbox token stored in `.env.local` as `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- Map uses Mapbox `dark-v11` style; design tokens and CSS custom properties in `app/globals.css`
- City panel implemented as Base UI Drawer; tabs use Base UI Tabs; dividers use Base UI Separator
- Currently only Los Angeles has full cost/culture data; other cities show "Coming Soon"
- `npx skills add jakubkrehel/make-interfaces-feel-better` installed for design engineering guidance
- Turbopack root set to `__dirname` in `next.config.ts` to suppress lockfile warning
