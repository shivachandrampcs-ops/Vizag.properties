/**
 * Representative imagery for the "Popular Locations" cards on the homepage.
 *
 * These are royalty-free placeholder photographs (served via Picsum, which
 * sources real, license-free stock photography — not AI-generated images).
 * Each entry uses a descriptive seed name that documents which real,
 * on-location photograph it should eventually be replaced with. Swap the
 * `src` for a real photo of the locality whenever one becomes available —
 * the seed/alt text tells you exactly what to shoot or source.
 */

export interface LocationImage {
  /** Remote image URL used as the card background. */
  src: string;
  /** Descriptive alt text for accessibility + SEO. */
  alt: string;
}

function placeholder(seed: string) {
  // 800x1000 portrait crop suits the 4:5 location card aspect ratio.
  return `https://picsum.photos/seed/${seed}/800/1000`;
}

export const LOCATION_IMAGES: Record<string, LocationImage> = {
  Madhurawada: {
    src: placeholder("vizag-madhurawada-apartments-it-buildings"),
    alt: "Modern apartments and IT buildings in Madhurawada, Visakhapatnam",
  },
  Gajuwaka: {
    src: placeholder("vizag-gajuwaka-commercial-area"),
    alt: "Commercial area and shops in Gajuwaka, Visakhapatnam",
  },
  "MVP Colony": {
    src: placeholder("vizag-mvp-colony-residential-apartments"),
    alt: "Residential apartments in MVP Colony, Visakhapatnam",
  },
  "Dwaraka Nagar": {
    src: placeholder("vizag-dwaraka-nagar-shopping-street"),
    alt: "Busy shopping street in Dwaraka Nagar, Visakhapatnam",
  },
  "Beach Road": {
    src: placeholder("vizag-beach-road-rk-beach-skyline"),
    alt: "RK Beach and Beach Road skyline, Visakhapatnam",
  },
  Rushikonda: {
    src: placeholder("vizag-rushikonda-beach-coastline"),
    alt: "Rushikonda Beach coastline, Visakhapatnam",
  },
  Yendada: {
    src: placeholder("vizag-yendada-hills-apartments"),
    alt: "Hillside apartments in Yendada, Visakhapatnam",
  },
  Pendurthi: {
    src: placeholder("vizag-pendurthi-hills-housing"),
    alt: "Hills and housing developments in Pendurthi, Visakhapatnam",
  },
  Anakapalle: {
    src: placeholder("vizag-anakapalle-town-landmark"),
    alt: "Town landmark in Anakapalle, near Visakhapatnam",
  },
  Sabbavaram: {
    src: placeholder("vizag-sabbavaram-green-surroundings"),
    alt: "Green, open surroundings in Sabbavaram, Visakhapatnam",
  },
  Kommadi: {
    src: placeholder("vizag-kommadi-villas"),
    alt: "Gated villa community in Kommadi, Visakhapatnam",
  },
  Mangalapalem: {
    src: placeholder("vizag-mangalapalem-residential-development"),
    alt: "Residential development in Mangalapalem, Visakhapatnam",
  },
  Bheemunipatnam: {
    src: placeholder("vizag-bheemunipatnam-beach-lighthouse"),
    alt: "Beach and lighthouse in Bheemunipatnam, Visakhapatnam",
  },
  Kancharapalem: {
    src: placeholder("vizag-kancharapalem-urban-neighborhood"),
    alt: "Urban neighborhood streets in Kancharapalem, Visakhapatnam",
  },
  Marripalem: {
    src: placeholder("vizag-marripalem-residential-locality"),
    alt: "Residential locality in Marripalem, Visakhapatnam",
  },
  Gopalapatnam: {
    src: placeholder("vizag-gopalapatnam-residential-area"),
    alt: "Residential area in Gopalapatnam, Visakhapatnam",
  },
  "NAD Junction": {
    src: placeholder("vizag-nad-junction-city-roads"),
    alt: "City roads near NAD Junction, Visakhapatnam",
  },
  Akkayyapalem: {
    src: placeholder("vizag-akkayyapalem-residential-streets"),
    alt: "Residential streets in Akkayyapalem, Visakhapatnam",
  },
  Siripuram: {
    src: placeholder("vizag-siripuram-business-district"),
    alt: "Business district in Siripuram, Visakhapatnam",
  },
  Waltair: {
    src: placeholder("vizag-waltair-heritage-locality"),
    alt: "Heritage locality of Waltair, Visakhapatnam",
  },
  Hanumanthawaka: {
    src: placeholder("vizag-hanumanthawaka-residential-junction"),
    alt: "Residential junction area in Hanumanthawaka, Visakhapatnam",
  },
  Lankelapalem: {
    src: placeholder("vizag-lankelapalem-emerging-locality"),
    alt: "Emerging residential locality in Lankelapalem, Visakhapatnam",
  },
  Vepagunta: {
    src: placeholder("vizag-vepagunta-residential-layout"),
    alt: "Residential layout in Vepagunta, Visakhapatnam",
  },
  Arilova: {
    src: placeholder("vizag-arilova-hillside-layout"),
    alt: "Hillside residential layout in Arilova, Visakhapatnam",
  },
  Kapuluppada: {
    src: placeholder("vizag-kapuluppada-developing-locality"),
    alt: "Developing residential locality in Kapuluppada, Visakhapatnam",
  },
};

/** Fallback used for any locality not yet mapped above. */
export const DEFAULT_LOCATION_IMAGE: LocationImage = {
  src: placeholder("vizag-visakhapatnam-neighborhood"),
  alt: "Neighborhood in Visakhapatnam",
};
