import type { CityDossier } from "@/lib/types";

export const CITY_DOSSIERS: Record<string, CityDossier> = {
  "los-angeles": {
    citySlug: "los-angeles",
    overview:
      "Los Angeles can reward flexibility, but the city asks you to budget for distance, patchwork transit access, and neighborhood-level differences that feel huge block to block.",
    historicalContext:
      "Los Angeles carries a long history of redlining, freeway-led displacement, and cultural districts being reshaped by speculative demand. Any move here lands inside that story, especially in neighborhoods that have long functioned as immigrant, Black, and working-class anchors.",
    languageAccess:
      "Spanish, Korean, Tagalog, Armenian, and Mandarin shape everyday life across the city, but access varies by neighborhood and by public institution.",
    financialAssumptions: {
      effectiveTaxRate: 0.3,
      depositMonths: 1,
      movingCost: 1850,
      landingBuffer: 900,
      rentBurdenTarget: 0.3,
    },
    neighborhoods: [
      {
        name: "Koreatown",
        pressure: "High",
        narrative:
          "Dense, transit-connected, and culturally rich, with sustained rent pressure from centrality and constant newcomer demand.",
        languages: ["English", "Spanish", "Korean"],
        anchors: ["Wilshire corridor businesses", "Korean community institutions"],
        coordinates: [-118.3004, 34.0628],
        mapView: {
          center: [-118.3004, 34.0628],
          zoom: 13.2,
          bearing: -10,
          pitch: 34,
        },
        fitProfile: {
          housingFits: ["roommates", "alone"],
          workStyleFits: ["remote", "hybrid", "in-person"],
          moveReasonFits: ["opportunity", "necessity"],
          budgetBand: "stretch",
          communitySignals: ["Korean", "Asian", "diaspora", "immigrant"],
          vibe: "Fast, dense, transit-friendly, and always on.",
          caution:
            "Rent pressure is persistent, so convenience can outpace your financial margin very quickly.",
        },
        articleQueries: {
          history: "\"Koreatown\" Los Angeles history community development",
          development:
            "\"Koreatown\" Los Angeles housing development rent pressure",
          currentEvents: "\"Koreatown\" Los Angeles community news",
        },
      },
      {
        name: "Boyle Heights",
        pressure: "High",
        narrative:
          "A historic Mexican American neighborhood where arts investment and regional access continue to raise fears of displacement.",
        languages: ["English", "Spanish"],
        anchors: ["Mariachi Plaza", "legacy family businesses"],
        coordinates: [-118.2051, 34.0401],
        mapView: {
          center: [-118.2051, 34.0401],
          zoom: 13.1,
          bearing: -16,
          pitch: 32,
        },
        fitProfile: {
          housingFits: ["roommates", "family"],
          workStyleFits: ["hybrid", "in-person"],
          moveReasonFits: ["necessity", "caretaking"],
          budgetBand: "steady",
          communitySignals: ["Latino", "Mexican", "Chicano", "Spanish", "family"],
          vibe: "Rooted, civically active, and deeply shaped by local memory.",
          caution:
            "This is a neighborhood where newcomers need to understand displacement concerns before treating culture as an amenity.",
        },
        articleQueries: {
          history:
            "\"Boyle Heights\" Los Angeles history displacement community",
          development:
            "\"Boyle Heights\" Los Angeles development gentrification housing",
          currentEvents: "\"Boyle Heights\" Los Angeles local news community",
        },
      },
      {
        name: "Leimert Park",
        pressure: "Medium",
        narrative:
          "A major Black cultural anchor with deep artistic history and renewed development pressure tied to transit investment.",
        languages: ["English"],
        anchors: ["Leimert Park Village", "community arts spaces"],
        coordinates: [-118.3283, 34.0005],
        mapView: {
          center: [-118.3283, 34.0005],
          zoom: 13,
          bearing: -8,
          pitch: 28,
        },
        fitProfile: {
          housingFits: ["alone", "family"],
          workStyleFits: ["remote", "hybrid"],
          moveReasonFits: ["opportunity", "caretaking"],
          budgetBand: "steady",
          communitySignals: ["Black", "African", "arts", "culture", "diaspora"],
          vibe: "Creative, neighborhood-scaled, and anchored in cultural institutions.",
          caution:
            "The cultural draw is real, but transit-led investment is also raising the stakes around who gets to stay.",
        },
        articleQueries: {
          history:
            "\"Leimert Park\" Los Angeles Black history arts community",
          development:
            "\"Leimert Park\" Los Angeles development transit investment",
          currentEvents: "\"Leimert Park\" Los Angeles community news",
        },
      },
    ],
    timeline: [
      {
        year: "1930s-1950s",
        title: "Redlining shapes housing access",
        detail:
          "Mortgage discrimination restricted where Black, Mexican, and Asian Angelenos could buy or build wealth.",
      },
      {
        year: "1950s-1970s",
        title: "Freeway construction cuts through communities",
        detail:
          "Regional infrastructure displaced households and physically split long-standing neighborhoods.",
      },
      {
        year: "2000s-present",
        title: "Transit and reinvestment pressure central districts",
        detail:
          "New capital and higher-income demand concentrate around walkable neighborhoods and rail access.",
      },
    ],
    tenantProtections: [
      "Rent stabilization covers many older units, but vacancy, exemptions, and turnover still create pressure.",
      "Tenant protections are stronger in the city than in much of the region, yet enforcement often depends on access to legal help.",
      "Short-term affordability can look manageable while long-term neighborhood pressure remains high.",
    ],
    resources: [
      {
        title: "Tenant rights clinics",
        description:
          "Start with local tenant unions and legal aid before signing or renewing in pressure-heavy areas.",
        category: "tenant-rights",
      },
      {
        title: "Neighborhood mutual aid networks",
        description:
          "Useful for understanding community expectations beyond landlord or relocation marketing.",
        category: "mutual-aid",
      },
      {
        title: "Cultural corridor guides",
        description:
          "Look for small-business directories to keep spending inside long-standing community ecosystems.",
        category: "community",
      },
    ],
  },
  "san-francisco": {
    citySlug: "san-francisco",
    overview:
      "San Francisco is compact and transit-legible compared with Los Angeles, but housing costs and tech-driven displacement pressure make almost every affordability conversation start from scarcity.",
    historicalContext:
      "Redevelopment, exclusion, and repeated tech booms have reshaped who gets to stay near jobs and transit. Long-standing communities in the Mission, Chinatown, Bayview, and SoMa continue to carry the weight of that churn.",
    languageAccess:
      "Cantonese, Spanish, Tagalog, Mandarin, and English are highly visible, though service quality and access differ sharply across agencies and neighborhoods.",
    financialAssumptions: {
      effectiveTaxRate: 0.33,
      depositMonths: 1,
      movingCost: 2100,
      landingBuffer: 1100,
      rentBurdenTarget: 0.3,
    },
    neighborhoods: [
      {
        name: "Mission District",
        pressure: "High",
        narrative:
          "Culturally central and transit-rich, with long-running displacement pressure tied to venture wealth and limited housing supply.",
        languages: ["English", "Spanish"],
        anchors: ["Latino cultural institutions", "independent restaurants and murals"],
        coordinates: [-122.4192, 37.7599],
        mapView: {
          center: [-122.4192, 37.7599],
          zoom: 13.4,
          bearing: -12,
          pitch: 30,
        },
        fitProfile: {
          housingFits: ["roommates", "alone"],
          workStyleFits: ["remote", "hybrid", "in-person"],
          moveReasonFits: ["opportunity", "necessity"],
          budgetBand: "stretch",
          communitySignals: ["Latino", "Mexican", "Spanish", "arts", "immigrant"],
          vibe: "Energetic, central, and intensely shaped by culture and pressure.",
          caution:
            "The Mission can feel like the obvious answer, but that same centrality often means the thinnest room for error.",
        },
        articleQueries: {
          history:
            "\"Mission District\" San Francisco history displacement community",
          development:
            "\"Mission District\" San Francisco housing development gentrification",
          currentEvents: "\"Mission District\" San Francisco local news",
        },
      },
      {
        name: "Chinatown",
        pressure: "Medium",
        narrative:
          "A dense immigrant anchor with unusually strong cultural continuity, but affordability stress remains intense.",
        languages: ["Cantonese", "English", "Mandarin"],
        anchors: ["family associations", "senior services", "legacy businesses"],
        coordinates: [-122.4066, 37.7941],
        mapView: {
          center: [-122.4066, 37.7941],
          zoom: 14,
          bearing: -18,
          pitch: 34,
        },
        fitProfile: {
          housingFits: ["alone", "roommates"],
          workStyleFits: ["in-person", "hybrid"],
          moveReasonFits: ["caretaking", "necessity"],
          budgetBand: "steady",
          communitySignals: ["Chinese", "Asian", "Cantonese", "Mandarin", "elder"],
          vibe: "Dense, intergenerational, and institutionally rooted.",
          caution:
            "The community fabric is strong, but availability and affordability can still make access fragile.",
        },
        articleQueries: {
          history: "\"Chinatown\" San Francisco history community",
          development:
            "\"Chinatown\" San Francisco housing development preservation",
          currentEvents: "\"Chinatown\" San Francisco local news",
        },
      },
      {
        name: "Bayview-Hunters Point",
        pressure: "Medium",
        narrative:
          "A historically Black neighborhood with ongoing environmental justice and development pressure concerns.",
        languages: ["English"],
        anchors: ["community health orgs", "church networks"],
        coordinates: [-122.3892, 37.7294],
        mapView: {
          center: [-122.3892, 37.7294],
          zoom: 12.9,
          bearing: -10,
          pitch: 26,
        },
        fitProfile: {
          housingFits: ["family", "alone"],
          workStyleFits: ["remote", "hybrid"],
          moveReasonFits: ["caretaking", "necessity"],
          budgetBand: "steady",
          communitySignals: ["Black", "environmental justice", "church", "community"],
          vibe: "Residential, civic-minded, and shaped by long-term organizing.",
          caution:
            "Fit here depends less on trend proximity and more on whether you value community continuity over central convenience.",
        },
        articleQueries: {
          history:
            "\"Bayview-Hunters Point\" San Francisco history community",
          development:
            "\"Bayview-Hunters Point\" San Francisco development environmental justice",
          currentEvents:
            "\"Bayview-Hunters Point\" San Francisco local news",
        },
      },
    ],
    timeline: [
      {
        year: "1950s-1970s",
        title: "Redevelopment displaces working-class communities",
        detail:
          "Major urban renewal programs removed homes and businesses, especially in Black neighborhoods.",
      },
      {
        year: "1990s-2000s",
        title: "Dot-com era resets housing expectations",
        detail:
          "Wage growth in tech widened the gap between local incomes and asking rents.",
      },
      {
        year: "2010s-present",
        title: "Platform economy pressure spreads",
        detail:
          "Rising commercial and residential demand pushes displacement anxiety beyond the traditional tech core.",
      },
    ],
    tenantProtections: [
      "Rent protections exist but are easier to benefit from in older housing stock.",
      "Housing searches move fast, so pressure often comes from timing as much as price.",
      "Neighborhood fit matters because even small commute savings can cost a lot in rent premiums.",
    ],
    resources: [
      {
        title: "Tenant counseling organizations",
        description:
          "Get lease and rent-control guidance early if you are considering older multifamily stock.",
        category: "tenant-rights",
      },
      {
        title: "Neighborhood merchant associations",
        description:
          "Useful for spending locally in districts where chain replacement is an active concern.",
        category: "community",
      },
      {
        title: "Transit-first newcomer guides",
        description:
          "Helpful when choosing whether to pay for centrality or trade rent for a longer daily rhythm.",
        category: "forum",
      },
    ],
  },
  chicago: {
    citySlug: "chicago",
    overview:
      "Chicago often looks financially easier on paper than the coasts, but neighborhood choice determines whether that affordability translates into stability, access, and cultural fit.",
    historicalContext:
      "Chicago's neighborhood geography is inseparable from segregation, disinvestment, and uneven redevelopment. Bronzeville, Pilsen, Uptown, and Albany Park each tell a different story about continuity, cultural infrastructure, and pressure.",
    languageAccess:
      "Spanish, Polish, Mandarin, Arabic, and English all have visible footprints, with stronger access in neighborhoods shaped by recent immigrant settlement.",
    financialAssumptions: {
      effectiveTaxRate: 0.28,
      depositMonths: 1,
      movingCost: 1450,
      landingBuffer: 750,
      rentBurdenTarget: 0.3,
    },
    neighborhoods: [
      {
        name: "Pilsen",
        pressure: "High",
        narrative:
          "A long-standing Mexican neighborhood where cultural visibility remains strong but housing pressure is persistent.",
        languages: ["English", "Spanish"],
        anchors: ["arts spaces", "family-owned food businesses"],
        coordinates: [-87.6818, 41.8565],
        mapView: {
          center: [-87.6818, 41.8565],
          zoom: 13.3,
          bearing: -14,
          pitch: 30,
        },
        fitProfile: {
          housingFits: ["roommates", "family"],
          workStyleFits: ["hybrid", "in-person"],
          moveReasonFits: ["necessity", "caretaking"],
          budgetBand: "steady",
          communitySignals: ["Latino", "Mexican", "Spanish", "arts", "family"],
          vibe: "Visible, expressive, and strongly neighborhood-oriented.",
          caution:
            "Its cultural visibility can attract newcomers quickly, so understanding local pressure is part of living here responsibly.",
        },
        articleQueries: {
          history: "\"Pilsen\" Chicago history community displacement",
          development: "\"Pilsen\" Chicago development housing gentrification",
          currentEvents: "\"Pilsen\" Chicago local news",
        },
      },
      {
        name: "Bronzeville",
        pressure: "Medium",
        narrative:
          "Historically central to Black Chicago, with heritage preservation and reinvestment moving side by side.",
        languages: ["English"],
        anchors: ["historic music and civic sites", "church networks"],
        coordinates: [-87.6176, 41.8219],
        mapView: {
          center: [-87.6176, 41.8219],
          zoom: 13,
          bearing: -8,
          pitch: 28,
        },
        fitProfile: {
          housingFits: ["alone", "family"],
          workStyleFits: ["remote", "hybrid", "in-person"],
          moveReasonFits: ["opportunity", "caretaking"],
          budgetBand: "steady",
          communitySignals: ["Black", "history", "music", "church", "civic"],
          vibe: "Historic, reflective, and tied to a strong civic lineage.",
          caution:
            "The neighborhood rewards people who value place history, not just relative affordability or commute math.",
        },
        articleQueries: {
          history: "\"Bronzeville\" Chicago history Black community",
          development:
            "\"Bronzeville\" Chicago development reinvestment housing",
          currentEvents: "\"Bronzeville\" Chicago local news",
        },
      },
      {
        name: "Albany Park",
        pressure: "Medium",
        narrative:
          "A deeply multilingual neighborhood with strong immigrant networks and a more mixed affordability profile.",
        languages: ["English", "Spanish", "Arabic", "Korean"],
        anchors: ["multilingual small businesses", "community schools"],
        coordinates: [-87.7194, 41.9683],
        mapView: {
          center: [-87.7194, 41.9683],
          zoom: 12.9,
          bearing: -10,
          pitch: 24,
        },
        fitProfile: {
          housingFits: ["family", "roommates"],
          workStyleFits: ["remote", "hybrid"],
          moveReasonFits: ["necessity", "caretaking", "opportunity"],
          budgetBand: "flexible",
          communitySignals: ["immigrant", "multilingual", "Arabic", "Korean", "Spanish"],
          vibe: "Layered, multilingual, and more everyday than performative.",
          caution:
            "Affordability can look stronger here, but fit depends on whether you want a neighborhood organized around local daily life.",
        },
        articleQueries: {
          history:
            "\"Albany Park\" Chicago history immigrant community",
          development:
            "\"Albany Park\" Chicago housing development neighborhood change",
          currentEvents: "\"Albany Park\" Chicago local news",
        },
      },
    ],
    timeline: [
      {
        year: "1910s-1940s",
        title: "Segregation hardens neighborhood boundaries",
        detail:
          "Racial covenants and lending practices shaped who could access wealth-building neighborhoods.",
      },
      {
        year: "1950s-1970s",
        title: "Urban renewal and expressways reshape the South and West sides",
        detail:
          "Public policy concentrated instability in neighborhoods already facing disinvestment.",
      },
      {
        year: "2000s-present",
        title: "Selective reinvestment intensifies pressure",
        detail:
          "Affordability remains relative, but demand clusters around amenity-rich, transit-served districts.",
      },
    ],
    tenantProtections: [
      "Affordability can be more achievable, but neighborhood turnover and landlord practices still matter.",
      "Transit access changes the real price of a neighborhood more than headline rent alone suggests.",
      "Community fit is often stronger when newcomers understand the local civic fabric before choosing convenience.",
    ],
    resources: [
      {
        title: "Tenant and eviction prevention groups",
        description:
          "Important for understanding neighborhood-by-neighborhood housing risk, even when base rent feels manageable.",
        category: "tenant-rights",
      },
      {
        title: "Block-club and ward-level forums",
        description:
          "A practical way to understand what residents are actually organizing around nearby.",
        category: "forum",
      },
      {
        title: "Independent business corridors",
        description:
          "Use local corridors to keep everyday spending closer to neighborhood institutions.",
        category: "community",
      },
    ],
  },
  "new-york": {
    citySlug: "new-york",
    overview:
      "New York City can offer dense access, fast job matching, and strong transit utility, but the trade-off is that housing pressure shows up almost immediately in your monthly breathing room.",
    historicalContext:
      "Redlining, disinvestment, rezonings, and luxury development have all changed where different communities could stay. The city's density can make neighborhood change feel both hyper-local and citywide at once.",
    languageAccess:
      "Spanish, Mandarin, Cantonese, Russian, Bengali, Haitian Creole, and English all matter depending on borough and neighborhood.",
    financialAssumptions: {
      effectiveTaxRate: 0.35,
      depositMonths: 1,
      movingCost: 2400,
      landingBuffer: 1200,
      rentBurdenTarget: 0.3,
    },
    neighborhoods: [
      {
        name: "Jackson Heights",
        pressure: "Medium",
        narrative:
          "One of the city's strongest multilingual community anchors, with deep immigrant infrastructure and growing cost pressure.",
        languages: ["English", "Spanish", "Bengali", "Nepali", "Tibetan"],
        anchors: ["immigrant business corridors", "multilingual services"],
        coordinates: [-73.8857, 40.7557],
        mapView: {
          center: [-73.8857, 40.7557],
          zoom: 13.6,
          bearing: 8,
          pitch: 34,
        },
        fitProfile: {
          housingFits: ["roommates", "family"],
          workStyleFits: ["hybrid", "in-person"],
          moveReasonFits: ["necessity", "caretaking", "opportunity"],
          budgetBand: "steady",
          communitySignals: ["immigrant", "South Asian", "Latino", "multilingual", "diaspora"],
          vibe: "Dense, multilingual, and oriented around local infrastructure.",
          caution:
            "Transit access is excellent, but rising pressure means the neighborhood works best when community fit matters more than brand value.",
        },
        articleQueries: {
          history:
            "\"Jackson Heights\" New York history immigrant community",
          development:
            "\"Jackson Heights\" Queens housing development neighborhood change",
          currentEvents: "\"Jackson Heights\" Queens local news",
        },
      },
      {
        name: "Bed-Stuy",
        pressure: "High",
        narrative:
          "A historic Black neighborhood where investment and displacement pressure have moved together for years.",
        languages: ["English"],
        anchors: ["legacy churches", "arts venues", "small businesses"],
        coordinates: [-73.9419, 40.6872],
        mapView: {
          center: [-73.9419, 40.6872],
          zoom: 13.4,
          bearing: 10,
          pitch: 32,
        },
        fitProfile: {
          housingFits: ["roommates", "alone"],
          workStyleFits: ["remote", "hybrid", "in-person"],
          moveReasonFits: ["opportunity", "necessity"],
          budgetBand: "stretch",
          communitySignals: ["Black", "arts", "church", "legacy", "community"],
          vibe: "Residential, expressive, and heavily shaped by change.",
          caution:
            "This is a place where convenience, cachet, and displacement pressure often overlap too neatly.",
        },
        articleQueries: {
          history: "\"Bed-Stuy\" Brooklyn history community displacement",
          development:
            "\"Bed-Stuy\" Brooklyn housing development gentrification",
          currentEvents: "\"Bed-Stuy\" Brooklyn local news",
        },
      },
      {
        name: "Washington Heights",
        pressure: "Medium",
        narrative:
          "A dense Dominican and Latino anchor with relative access advantages, but rising cost pressure tied to location and transit.",
        languages: ["English", "Spanish"],
        anchors: ["uptown parks", "family-run food and retail"],
        coordinates: [-73.9362, 40.8518],
        mapView: {
          center: [-73.9362, 40.8518],
          zoom: 13.1,
          bearing: 14,
          pitch: 30,
        },
        fitProfile: {
          housingFits: ["family", "roommates"],
          workStyleFits: ["hybrid", "in-person"],
          moveReasonFits: ["necessity", "caretaking"],
          budgetBand: "steady",
          communitySignals: ["Dominican", "Latino", "Spanish", "family", "diaspora"],
          vibe: "Family-scaled, park-connected, and strongly neighborhood-based.",
          caution:
            "It can offer more breathing room than lower Manhattan, but that advantage shrinks as demand pushes uptown.",
        },
        articleQueries: {
          history:
            "\"Washington Heights\" Manhattan history Dominican community",
          development:
            "\"Washington Heights\" Manhattan housing development neighborhood change",
          currentEvents: "\"Washington Heights\" Manhattan local news",
        },
      },
    ],
    timeline: [
      {
        year: "1930s-1960s",
        title: "Redlining and clearance reshape access",
        detail:
          "Planning and lending decisions pushed communities of color into uneven housing markets.",
      },
      {
        year: "1970s-1990s",
        title: "Disinvestment and uneven recovery split neighborhoods",
        detail:
          "The city's recovery arrived faster in some districts than others, creating long-tail inequality.",
      },
      {
        year: "2000s-present",
        title: "Rezoning and luxury demand intensify rent pressure",
        detail:
          "Growth corridors and amenity-rich areas became focal points for displacement anxiety.",
      },
    ],
    tenantProtections: [
      "Rent-stabilized units can offer real protection, but competition for them is intense.",
      "Broker fees, deposits, and move-in timing can make first-month costs much heavier than the monthly rent alone suggests.",
      "Transit-rich neighborhoods often ask a premium, so commute savings should be weighed against long-term strain.",
    ],
    resources: [
      {
        title: "Housing rights groups",
        description:
          "Start here for questions about rent stabilization, broker fees, and lease norms.",
        category: "tenant-rights",
      },
      {
        title: "Mutual aid and neighborhood care maps",
        description:
          "A useful way to read beyond branded neighborhood narratives.",
        category: "mutual-aid",
      },
      {
        title: "Local civic and cultural newsletters",
        description:
          "These can help a newcomer understand whether they are entering an active neighborhood ecosystem or a more transactional one.",
        category: "forum",
      },
    ],
  },
  boston: {
    citySlug: "boston",
    overview:
      "Boston blends high education and health-sector access with a housing market that rewards preparation. Smaller geography can make it feel manageable, but the price of proximity adds up quickly.",
    historicalContext:
      "Boston's neighborhood story includes school desegregation battles, urban renewal, and long-running tension between institutional expansion and community continuity. Roxbury, Dorchester, Chinatown, and East Boston each sit differently inside that pressure.",
    languageAccess:
      "Spanish, Haitian Creole, Mandarin, Vietnamese, Cape Verdean Creole, and English all matter depending on neighborhood.",
    financialAssumptions: {
      effectiveTaxRate: 0.29,
      depositMonths: 1,
      movingCost: 1650,
      landingBuffer: 850,
      rentBurdenTarget: 0.3,
    },
    neighborhoods: [
      {
        name: "Roxbury",
        pressure: "High",
        narrative:
          "A historically Black neighborhood where institutional growth and development pressure remain central concerns.",
        languages: ["English", "Spanish", "Haitian Creole"],
        anchors: ["community health orgs", "arts institutions"],
        coordinates: [-71.0826, 42.3296],
        mapView: {
          center: [-71.0826, 42.3296],
          zoom: 13.2,
          bearing: -10,
          pitch: 28,
        },
        fitProfile: {
          housingFits: ["family", "alone"],
          workStyleFits: ["remote", "hybrid", "in-person"],
          moveReasonFits: ["caretaking", "necessity"],
          budgetBand: "steady",
          communitySignals: ["Black", "Haitian", "arts", "community", "health"],
          vibe: "Institutionally aware, community-rooted, and historically significant.",
          caution:
            "Roxbury makes the city's pressure legible fast, so fit here depends on how seriously you take local history.",
        },
        articleQueries: {
          history: "\"Roxbury\" Boston history Black community",
          development:
            "\"Roxbury\" Boston development housing pressure",
          currentEvents: "\"Roxbury\" Boston local news",
        },
      },
      {
        name: "Dorchester",
        pressure: "Medium",
        narrative:
          "Large, varied, and deeply immigrant, with different affordability and transit realities inside the same neighborhood name.",
        languages: ["English", "Spanish", "Vietnamese", "Cape Verdean Creole"],
        anchors: ["neighborhood main streets", "faith communities"],
        coordinates: [-71.0656, 42.2973],
        mapView: {
          center: [-71.0656, 42.2973],
          zoom: 12.6,
          bearing: -6,
          pitch: 22,
        },
        fitProfile: {
          housingFits: ["family", "roommates"],
          workStyleFits: ["remote", "hybrid"],
          moveReasonFits: ["necessity", "caretaking", "opportunity"],
          budgetBand: "flexible",
          communitySignals: ["immigrant", "Vietnamese", "Cape Verdean", "faith", "family"],
          vibe: "Big, varied, and oriented around local routines instead of downtown image.",
          caution:
            "Because Dorchester contains multiple sub-markets, it needs more block-level reading than a single neighborhood label suggests.",
        },
        articleQueries: {
          history:
            "\"Dorchester\" Boston history immigrant community",
          development:
            "\"Dorchester\" Boston housing development neighborhood change",
          currentEvents: "\"Dorchester\" Boston local news",
        },
      },
      {
        name: "Chinatown",
        pressure: "High",
        narrative:
          "Small in footprint but central to the city's Asian American history, with heavy downtown development pressure.",
        languages: ["English", "Mandarin", "Cantonese"],
        anchors: ["family associations", "elder support networks"],
        coordinates: [-71.0598, 42.3501],
        mapView: {
          center: [-71.0598, 42.3501],
          zoom: 14.1,
          bearing: -12,
          pitch: 34,
        },
        fitProfile: {
          housingFits: ["alone", "roommates"],
          workStyleFits: ["in-person", "hybrid"],
          moveReasonFits: ["caretaking", "opportunity"],
          budgetBand: "stretch",
          communitySignals: ["Chinese", "Asian", "Mandarin", "Cantonese", "elder"],
          vibe: "Compact, historic, and under intense downtown pressure.",
          caution:
            "Its centrality is the draw and the risk, especially when development pressure is part of the neighborhood story.",
        },
        articleQueries: {
          history: "\"Chinatown\" Boston history Asian American community",
          development:
            "\"Chinatown\" Boston development housing pressure",
          currentEvents: "\"Chinatown\" Boston local news",
        },
      },
    ],
    timeline: [
      {
        year: "1950s-1970s",
        title: "Urban renewal disrupts core neighborhoods",
        detail:
          "Large projects displaced homes and businesses while reshaping access to downtown.",
      },
      {
        year: "1970s-1980s",
        title: "School desegregation conflict reshapes neighborhood identity",
        detail:
          "Public policy and racial conflict left a long civic memory that still matters in local belonging.",
      },
      {
        year: "2000s-present",
        title: "Institutional and luxury growth raise pressure",
        detail:
          "Education, biotech, and downtown development increase demand across adjacent neighborhoods.",
      },
    ],
    tenantProtections: [
      "Broker fees and up-front costs can turn a plausible monthly budget into a difficult move-in reality.",
      "Neighborhood choice changes not just commute time but also access to community and language support.",
      "Boston's smaller scale can hide sharp differences in who feels welcomed or priced in.",
    ],
    resources: [
      {
        title: "Tenant support and legal help",
        description:
          "Useful when up-front fees and lease structures make a move look easier than it is.",
        category: "tenant-rights",
      },
      {
        title: "Neighborhood cultural centers",
        description:
          "A strong way to orient beyond university- and employer-centered networks.",
        category: "community",
      },
      {
        title: "Local newcomer guides",
        description:
          "Helpful for comparing convenience with long-term cultural fit and community presence.",
        category: "forum",
      },
    ],
  },
};

export function getCityDossier(citySlug: string) {
  return CITY_DOSSIERS[citySlug];
}
