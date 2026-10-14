/**
 * Search suggestions for Visakhapatnam and nearby localities. Canonical names
 * are shared by forms, property filters and homepage links; their inclusion is
 * not a claim about GVMC jurisdiction, postal boundaries, service coverage or
 * property legality.
 *
 * Municipal-source review (14 Oct 2026) used only these official GVMC sources:
 * - Elected-council ward-wise area details:
 *   https://www.gvmc.gov.in/image_uploads/GVMC%20Corporators%20Ward%20wsie%20Area%20details.pdf
 * - Final 98-ward delimitation notification:
 *   https://www.gvmc.gov.in/wss/image_uploads/gnengward98.pdf
 *
 * 85 suggestions directly/clearly match a name in the ward-area list; 27
 * remain ambiguous or unmatched and are explicitly listed below as
 * unverified. The delimitation notification review was incomplete (only the
 * first three of eight fetched chunks were reviewed; a later chunk failed), so
 * even a ward-area name match is not proof of current jurisdiction or service
 * coverage. An unmatched suggestion is not evidence that the locality is
 * outside GVMC. The full 112-name vocabulary is retained for search, while the
 * verification status remains separate and auditable.
 */

export const VIZAG_LOCATION_GROUPS = [
  {
    label: "Central & East Visakhapatnam",
    locations: [
      "Akkayyapalem",
      "Allipuram",
      "Asilmetta",
      "Balayya Sastri Layout",
      "Beach Road",
      "Burujupeta",
      "CBM Compound",
      "Chengal Rao Peta",
      "Daba Gardens",
      "Daspalla Hills",
      "Dondaparthy",
      "Dwaraka Nagar",
      "Jagadamba Centre",
      "Jalari Peta",
      "Kailasapuram",
      "Kancharapalem",
      "Kirlampudi Layout",
      "Lawsons Bay Colony",
      "Maddilapalem",
      "Maharanipeta",
      "MVP Colony",
      "Narasimha Nagar",
      "One Town",
      "Pandurangapuram",
      "Pedda Waltair",
      "Pithapuram Colony",
      "Poorna Market",
      "Prakashraopeta",
      "Railway New Colony",
      "Ramnagar",
      "Resapuvanipalem",
      "Relli Veedhi",
      "Salipeta",
      "Seethammadhara",
      "Siripuram",
      "Suryabagh",
      "Town Kotha Road",
      "Waltair",
    ],
  },
  {
    label: "North & Coastal Corridor",
    locations: [
      "Anandapuram",
      "Bheemili",
      "Gambhiram",
      "Gidijala",
      "Jodugullapalem",
      "Kapuluppada",
      "Kommadi",
      "Madhurawada",
      "Mangamaripeta",
      "Nidigattu",
      "Padmanabham",
      "Pothinamallayya Palem",
      "Rushikonda",
      "Sagar Nagar",
      "Sontyam",
      "Tagarapuvalasa",
      "Thimmapuram",
      "Vellanki",
      "Yendada",
    ],
  },
  {
    label: "South & Industrial Corridor",
    locations: [
      "Aganampudi",
      "Akkireddypalem",
      "Anakapalli",
      "Appikonda",
      "Atchutapuram",
      "BHPV",
      "Chinagantyada",
      "Desapatrunipalem",
      "Duvvada",
      "Gajuwaka",
      "Gandhigram",
      "Gangavaram",
      "Kurmannapalem",
      "Lankelapalem",
      "Malkapuram",
      "Mangalapalem",
      "Mindi",
      "Mulagada",
      "Nadupuru",
      "Nathayyapalem",
      "Parawada",
      "Pedagantyada",
      "Scindia",
      "Sheela Nagar",
      "Sriharipuram",
      "Tunglam",
      "Ukkunagaram",
      "Vadlapudi",
      "Yarada",
    ],
  },
  {
    label: "West & Greater Visakhapatnam",
    locations: [
      "Adarsh Nagar",
      "Adavivaram",
      "Arilova",
      "Chinna Gadhili",
      "Chinnamushidiwada",
      "Chintalagraharam",
      "Devipuram",
      "Gopalapatnam",
      "Hanumanthawaka",
      "Kakani Nagar",
      "Kothavalasa",
      "Madhavadhara",
      "Marripalem",
      "Muralinagar",
      "NAD Junction",
      "Naidu Thota",
      "Narava",
      "Pendurthi",
      "Pineapple Colony",
      "Prahaladapuram",
      "Ravindra Nagar",
      "Sabbavaram",
      "Simhachalam",
      "Sujatha Nagar",
      "Vepagunta",
      "Visalakshi Nagar",
    ],
  },
] as const;

/** Flat canonical list for autocomplete and compact navigation components. */
export const VIZAG_LOCATIONS = VIZAG_LOCATION_GROUPS.flatMap(
  (group) => group.locations
);

/** Names in the suggestion list that remain unverified against the GVMC sources. */
export const VIZAG_UNVERIFIED_LOCALITY_SUGGESTIONS = [
  "Asilmetta",
  "Balayya Sastri Layout",
  "Burujupeta",
  "Dwaraka Nagar",
  "Jagadamba Centre",
  "Kailasapuram",
  "Maharanipeta",
  "One Town",
  "Siripuram",
  "Town Kotha Road",
  "Waltair",
  "Anandapuram",
  "Gambhiram",
  "Gidijala",
  "Mangamaripeta",
  "Padmanabham",
  "Pothinamallayya Palem",
  "Sontyam",
  "Vellanki",
  "Atchutapuram",
  "Parawada",
  "Scindia",
  "Ukkunagaram",
  "Chintalagraharam",
  "Devipuram",
  "NAD Junction",
  "Sabbavaram",
] as const;

const unverifiedLocalityKeys = new Set(
  VIZAG_UNVERIFIED_LOCALITY_SUGGESTIONS.map((name) =>
    name.toLocaleLowerCase("en-IN")
  )
);

/**
 * Suggestions that directly/clearly match a name in the cited GVMC ward-area
 * list. This is a source-name match only, not a current-boundary assertion.
 */
export const VIZAG_GVMC_WARD_AREA_NAME_MATCHES = VIZAG_LOCATIONS.filter(
  (name) => !unverifiedLocalityKeys.has(name.toLocaleLowerCase("en-IN"))
);

/**
 * Legacy spellings and commonly used short names resolve to a canonical
 * locality. Existing property rows are never rewritten; search uses these
 * aliases so old records remain discoverable.
 */
export const VIZAG_LOCATION_ALIASES: Readonly<Record<string, string>> = {
  "Akkayapalem": "Akkayyapalem",
  "Anakapalle": "Anakapalli",
  "Bheemunipatnam": "Bheemili",
  "Endada": "Yendada",
  "Jagadamba Junction": "Jagadamba Centre",
  "Kancharlapalem": "Kancharapalem",
  "Maharani Peta": "Maharanipeta",
  "NAD Kotha Road": "NAD Junction",
  "NAD Kottha Road": "NAD Junction",
  "Peda Waltair": "Pedda Waltair",
  "PM Palem": "Pothinamallayya Palem",
  "P.M. Palem": "Pothinamallayya Palem",
  "R.K. Beach": "Beach Road",
  "Thagarapuvalasa": "Tagarapuvalasa",
  "Thagarapu Valasa": "Tagarapuvalasa",
  "Vishalakshi Nagar": "Visalakshi Nagar",
};

const canonicalByName = new Map<string, string>(
  VIZAG_LOCATIONS.map((location) => [location.toLocaleLowerCase("en-IN"), location])
);

const aliasByName = new Map<string, string>(
  Object.entries(VIZAG_LOCATION_ALIASES).map(([alias, canonical]) => [
    alias.toLocaleLowerCase("en-IN"),
    canonical,
  ])
);

export function canonicalVizagLocation(value: string): string {
  const trimmed = value.trim();
  const key = trimmed.toLocaleLowerCase("en-IN");
  return canonicalByName.get(key) ?? aliasByName.get(key) ?? trimmed;
}

/** Exact stored values to search for, including known historical aliases. */
export function vizagLocationSearchValues(value: string): string[] {
  const trimmed = value.trim();
  const canonical = canonicalVizagLocation(trimmed);
  const aliases = Object.entries(VIZAG_LOCATION_ALIASES)
    .filter(([, target]) => target === canonical)
    .map(([alias]) => alias);
  return Array.from(new Set([trimmed, canonical, ...aliases].filter(Boolean)));
}

export function isKnownVizagLocation(value: string): boolean {
  const key = value.trim().toLocaleLowerCase("en-IN");
  return canonicalByName.has(key) || aliasByName.has(key);
}
