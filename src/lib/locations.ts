/**
 * Search suggestions for Visakhapatnam and its commonly described suburbs.
 * Canonical names are shared by forms, property filters and homepage links.
 *
 * Reference sources consulted for locality discovery and spelling review
 * (14 Oct 2026):
 * - GVMC elected-council ward-wise area details (98 wards):
 *   https://www.gvmc.gov.in/image_uploads/GVMC%20Corporators%20Ward%20wsie%20Area%20details.pdf
 * - GVMC final 98-ward delimitation notification:
 *   https://www.gvmc.gov.in/wss/image_uploads/gnengward98.pdf
 * - Visakhapatnam neighbourhood list (secondary source; also includes nearby
 *   suburbs):
 *   https://en.wikipedia.org/wiki/List_of_neighbourhoods_in_Visakhapatnam
 * - Visakhapatnam map/locality directory (secondary spelling reference):
 *   https://www.mapsofindia.com/visakhapatnam/
 *
 * This list contains 112 distinct search suggestions, including nearby Greater
 * Vizag settlements outside GVMC. It has not been reconciled name-by-name
 * against the official ward records; treat it as a candidate search vocabulary,
 * not a verified municipal directory, legal boundary, postal directory, proof
 * of service coverage, or property check. Complete official-source review
 * before describing the entries as verified.
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
