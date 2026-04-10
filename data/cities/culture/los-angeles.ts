import type { ContributionItem, CultureCard } from "@/lib/types";

export const cultureCards: CultureCard[] = [
  {
    name: "Grand Central Market",
    tag: "Food & Community",
    story:
      "A century-old marketplace where dozens of food vendors reflect the city's diversity. From Oaxacan mole to Thai street food, it's a microcosm of LA on a single block.",
    link: "https://grandcentralmarket.com",
  },
  {
    name: "The Broad",
    tag: "Art & Culture",
    story:
      "A contemporary art museum with free general admission, housing works by Basquiat, Koons, and Kusama. The building itself — with its honeycomb exterior — is a landmark.",
    link: "https://thebroad.org",
  },
  {
    name: "Griffith Observatory",
    tag: "Nature & Science",
    story:
      "Perched above the city with panoramic views, free telescope viewings, and planetarium shows. It's the rare place where you can see both the Hollywood sign and the cosmos.",
  },
  {
    name: "Venice Beach Boardwalk",
    tag: "Neighborhood",
    story:
      "A two-mile stretch of street performers, murals, skate parks, and Muscle Beach. It's chaotic, colorful, and unapologetically LA.",
  },
];

export const contributionItems: ContributionItem[] = [
  {
    id: "la-beach-cleanup",
    title: "Beach Cleanup Crew",
    description:
      "Join monthly beach cleanups along Santa Monica and Venice shores.",
  },
  {
    id: "la-food-bank",
    title: "LA Food Bank Volunteer",
    description:
      "Help sort and distribute food to families across Los Angeles County.",
  },
  {
    id: "la-mentorship",
    title: "Youth Mentorship",
    description:
      "Mentor high school students in underserved neighborhoods through after-school programs.",
  },
  {
    id: "la-urban-garden",
    title: "Community Garden",
    description:
      "Tend a shared urban garden plot and help grow fresh produce for the neighborhood.",
  },
  {
    id: "la-transit-advocate",
    title: "Transit Advocacy",
    description:
      "Attend city council meetings and advocate for better public transportation options.",
  },
];
