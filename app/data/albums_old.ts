export type Tier = "S" | "A" | "B" | "C" | "D" | "F";

export type Album = {
  key: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  favouriteTrack: string;
  review: string;
  tier: Tier;
  mbid: string;

  /** Fallback background color shown behind the cover (and on its own if no mbid). */
  background?: number | string;
};

/**
  {
    key: "",
    title: "",
    artist: "",
    year: ,
    genre: "",
    favouriteTrack: "",
    review:
      "",
    tier: "",
    mbid: "",
    background: ,
  },
 */

export const albumData: Album[] = [
  {
    key: "KID_A",
    title: "Kid A",
    artist: "Radiohead",
    year: 2000,
    genre: "Art Rock / Electronic / Ambient",
    favouriteTrack: "Everything In Its Right Place",
    review:
      `Very digestible introduction to soundscape works. Favourite album to fall asleep to.
      'Everything In Its Right Place' has an amazing intro immediately setting the tone for the rest of the album.`,
    tier: "S",
    mbid: "e75c0549-ad55-39e3-8025-c72c5d4a3c5d",
    background: 0x422a27,
  },
  {
    key: "IN_RAINBOWS",
    title: "In Rainbows",
    artist: "Radiohead",
    year: 2007,
    genre: "Alternative Rock",
    favouriteTrack: "Weird Fishes / Arpeggi",
    review:
      "15 Step is another great opening song. My entry into Radiohead. Their most jolly album. Got put off this album before listening because I thought the cover was too ugly.",
    tier: "S",
    mbid: "6e335887-60ba-38f0-95af-fae7774336bf",
    background: 0x031725,
  },
  {
    key: "EUSEXUA",
    title: "EUSEXUA",
    artist: "FKA twigs",
    year: 2025,
    genre: "Dance Pop / EDM",
    favouriteTrack: "",
    review:
      "",
    tier: "B",
    mbid: "05c8e133-ba85-48cc-82c3-afcf0cc9e9ff",
    background: 0xd8d4d3,
  },
  {
    key: "FOREVER_HOWLONG",
    title: "Forever Howlong",
    artist: "Black Country, New Road",
    year: 2025,
    genre: "Chamber Pop / Art Rock / Progressive Folk",
    favouriteTrack: "Two Horses",
    review:
      "",
    tier: "A",
    mbid: "23a9b1c2-3dd1-408e-89cb-ca0b81429176",
    background: 0xee8432,
  },
  {
    key: "ABSOLUTELY",
    title: "Absolutely",
    artist: "Dijon",
    year: 2021,
    genre: "Neo-Soul / Alternative R&B",
    favouriteTrack: "",
    review:
      "",
    tier: "A",
    mbid: "c2455d4a-3e81-4aba-833c-5119d18a8fc0",
    background: 0xc7b69c,
  },
  {
    key: "DAWN",
    title: "Dawn",
    artist: "Yebba",
    year: 2021,
    genre: "Soul / R&B",
    favouriteTrack: "",
    review:
      "",
    tier: "B",
    mbid: "594f931f-d19f-4cdb-98aa-fd4c1b52b966",
    background: 0x242f1e,
  },
  {
    key: "TWILIGHT",
    title: "Twilight",
    artist: "bôa",
    year: 2001,
    genre: "Alternative Rock / Indie Pop",
    favouriteTrack: "",
    review:
      "",
    tier: "A",
    mbid: "38174604-0631-381b-a67b-5ce30e498505",
    background: 0x0062a6,
  },
  {
    key: "WISH_YOU_WERE_HERE",
    title: "Wish You Were Here",
    artist: "Pink Floyd",
    year: 1975,
    genre: "Progressive Rock, Art Rock",
    favouriteTrack: "Wish You Were Here",
    review:
      "Amazing listening experience. Unshuffleable. Two 10+ min songs but you don't even notice.",
    tier: "S",
    mbid: "1a272023-10d3-38ee-bab3-317b55fcc21d",
    background: 0xffffff,
  },
  {
    key: "OK_COMPUTER",
    title: "OK Computer",
    artist: "Radiohead",
    year: 1997,
    genre: "Alternative Rock / Art Rock",
    favouriteTrack: "",
    review:
      "",
    tier: "S",
    mbid: "b1392450-e666-3926-a536-22c65f834433",
    background: 0x94cee4,
  },
  {
    key: "RUMOURS",
    title: "Rumours",
    artist: "Fleetwood Mac",
    year: 1977,
    genre: "Soft Rock / Folk Pop",
    favouriteTrack: "",
    review:
      `When I first listened to it, it was not my normal listening taste but it's undeniably a masterpiece that perfectly carves out a slice of the 70's. 
      The behind the scenes drama is an added bonus.`,
    tier: "S",
    mbid: "416bb5e5-c7d1-3977-8fd7-7c9daf6c2be6",
    background: 0xfffdea,
  },
  {
    key: "THE_DARK_SIDE_OF_THE_MOOD",
    title: "The Dark Side of the Moon",
    artist: "Pink Floyd",
    year: 1973,
    genre: "Progressive Rock, Psychedelic Rock",
    favouriteTrack: "The Great Gig in the Sky",
    review:
      `Didn't understand the hype until my exchange trip. Put it on the speaker in our hostel. 
      I still get anxiety when the 'Time' intro rolls around. 
      Probably the sole reason I can't enjoy the album more.
      I remember studying 'Money' in early high school for its 7/4 time signature, but I couldn't get
      into the rest of the album (was only listening to EDM back then).`,
    tier: "S",
    mbid: "f5093c06-23e3-404f-aeaa-40f72885ee3a",
    background: 0x000000,
  },
  {
    key: "Pulsar",
    title: "Pulsar",
    artist: "L'Impératrice",
    year: 2024,
    genre: "Nu-Disco / French Pop",
    favouriteTrack: "",
    review:
      "",
    tier: "A",
    mbid: "a70b228a-20a9-4d24-8ded-d4ea40d9694c",
    background: 0x2c396a,
  },
  {
    key: "MADVILLAINY",
    title: "Madvillainy",
    artist: "Madvillain",
    year: 2004,
    genre: "Hip Hop / Jazz Rap",
    favouriteTrack: "",
    review:
      "",
    tier: "A",
    mbid: "ab570ccb-b06b-3746-8147-4903163ba895",
    background: 0xd6d6d6,
  },
  {
    key: "MM..FOOD",
    title: "MM..FOOD",
    artist: "MF DOOM",
    year: 2004,
    genre: "Hip Hop / Jazz Rap",
    favouriteTrack: "",
    review:
      "",
    tier: "B",
    mbid: "ec84ab32-eb41-3d91-a099-7a01c72f21d2",
    background: 0xa7ba5e,
  },
  {
    key: "THE_BENDS",
    title: "The Bends",
    artist: "Radiohead",
    year: 1995,
    genre: "Alternative Rock / Post-Britpop",
    favouriteTrack: "",
    review:
      "",
    tier: "B",
    mbid: "b8048f24-c026-3398-b23a-b5e50716cbc7",
    background: 0xd62541,
  },
  {
    key: "AMNESIAC",
    title: "Amnesiac",
    artist: "Radiohead",
    year: 2001,
    genre: "Experimental Rock / Alternative Rock",
    favouriteTrack: "",
    review:
      "",
    tier: "A",
    mbid: "bca9280e-28b4-327f-8fe0-fd918579e486",
    background: 0x342e30,
  },
  {
    key: "HEAVEN_OR_LAS_VEGAS",
    title: "Heaven or Las Vegas",
    artist: "Cocteau Twins",
    year: 1990,
    genre: "Dream Pop",
    favouriteTrack: "",
    review:
      "",
    tier: "A",
    mbid: "12fab6b9-4eaf-33b0-963e-cae03ac332fe",
    background: 0x394572,
  },
  {
    key: "HAIL_TO_THE_THIEF",
    title: "Hail to the Thief",
    artist: "Radiohead",
    year: 2003,
    genre: "Alternative Rock / Art Rock",
    favouriteTrack: "Backdrifts",
    review:
      "Strong opening and end to the album, but I think I lost a bit of interest around the middle. Good crunch on Backdrifts.",
    tier: "B",
    mbid: "5c14fd50-a2f1-3672-9537-b0dad91bea2f",
    background: 0x4b6d7d,
  },
  {
    key: "THE_KING_OF_LIMBS",
    title: "The King of Limbs",
    artist: "Radiohead",
    year: 2011,
    genre: "Alternative Rock / Ambient Pop",
    favouriteTrack: "",
    review:
      "",
    tier: "A",
    mbid: "899b6d09-807e-4c18-a6d4-3642e00d6a3d",
    background: 0x263d06,
  },
  {
    key: "A_MOON_SHAPED_POOL",
    title: "A Moon Shaped Pool",
    artist: "Radiohead",
    year: 2016,
    genre: "",
    favouriteTrack: "Art Rock / Ambient Pop",
    review:
      "",
    tier: "A",
    mbid: "bbce0087-d386-4246-a51d-dbcdfdbe8fb2",
    background: 0xe5e4eb,
  },
  {
    key: "FLEETWOOD_MAC",
    title: "Fleetwood Mac",
    artist: "Fleetwood Mac",
    year: 1975,
    genre: "Pop Rock / Folk Rock",
    favouriteTrack: "Rhiannon",
    review:
      "",
    tier: "A",
    mbid: "6b5d9bf1-f496-34b5-9488-7df2533d6208",
    background: 0xffffff,
  },
  {
    key: "EVERYBODY_ELSE_IS_DOING_IT",
    title: "Everybody Else Is Doing It, So Why Can't We?",
    artist: "The Cranberries",
    year: 1993,
    genre: "Alternative Rock / Dream Pop",
    favouriteTrack: "",
    review:
      "",
    tier: "S",
    mbid: "e6b486b3-68e7-331c-a078-94fd71d61877",
    background: 0x000000,
  },
  {
    key: "TAPESTRY",
    title: "Tapestry",
    artist: "Carol King",
    year: 1971,
    genre: "Folk Rock / Pop",
    favouriteTrack: "",
    review:
      "Super digestible and catchy. Takes you to a different time.",
    tier: "A",
    mbid: "6e4f39e6-3403-39d7-81c6-8e61a990d509",
    background: 0x272935,
  },
  {
    key: "DIRE_STRAITS",
    title: "Dire Straits",
    artist: "Dire Straits",
    year: 1978,
    genre: "Rock / Blues Rock",
    favouriteTrack: "",
    review:
      "",
    tier: "A",
    mbid: "0c9bc273-a9e9-3290-b423-c61b9f8d20bc",
    background: 0xf6f4d8,
  },
  {
    key: "BRAND_NEW_EYES",
    title: "Brand New Eyes",
    artist: "Paramore",
    year: 2009,
    genre: "Pop Punk / Alternative Rock",
    favouriteTrack: "",
    review:
      "",
    tier: "A",
    mbid: "cd706457-8b16-4809-a61a-cdba1b281d39",
    background: 0xe8e0d5,
  },
  {
    key: "ON_THE_INSIDE",
    title: "On The Inside",
    artist: "Gotts Street Park",
    year: 2023,
    genre: "Contemporary Jazz / Funk / Soul",
    favouriteTrack: "",
    review:
      "",
    tier: "A",
    mbid: "1bd84b8b-e187-44d9-aff0-e32f9e3de987",
    background: 0x1d1d1d,
  },
  {
    key: "THIS_IS_HOW_TOMORROW_MOVES",
    title: "This Is How Tomorrow Moves",
    artist: "beabadoobee",
    year: 2024,
    genre: "Alternative Rock / Indie Pop",
    favouriteTrack: "",
    review:
      "",
    tier: "B",
    mbid: "b21b5309-90b0-4ddb-9ea1-0c7870b10341",
    background: 0xa5d8e8,
  },
  {
    key: "AAA",
    title: "AAA",
    artist: "HYUKOH & Sunset Rollercoaster",
    year: 2024,
    genre: "Indie / Korean Rock / Taiwanese Rock",
    favouriteTrack: "",
    review:
      "",
    tier: "B",
    mbid: "a4647cf0-3497-4624-a54d-1a2540259233",
    background: 0x88899e,
  },
  {
    key: "SLOW_BURN",
    title: "Slow Burn",
    artist: "Baby Rose & BADBADNOTGOOD",
    year: 2024,
    genre: "Blues / Jazz / R&B / Soul",
    favouriteTrack: "",
    review:
      "",
    tier: "A",
    mbid: "ae9ad4fb-c840-4e14-aaed-ea319dc3d324",
    background: 0x3c3835,
  },
  {
    key: "TROPEAU_BLEU",
    title: "Tropeau Bleu",
    artist: "Cortex",
    year: 1975,
    genre: "Funk / Jazz Rock",
    favouriteTrack: "",
    review:
      "",
    tier: "A",
    mbid: "17beaab5-7f01-3511-848a-7b981d4d92ff",
    background: 0xc4c6ca,
  },
  {
    key: "TO_HELL_WITH_IT",
    title: "to hell with it",
    artist: "PinkPantheress",
    year: 2021,
    genre: "Atmospheric Drum and Bass / Contemporary R&B",
    favouriteTrack: "",
    review:
      "",
    tier: "B",
    mbid: "a09cac39-38c3-4973-8302-7f8210dcbcc7",
    background: 0x1a3151,
  },
  {
    key: "NICOLE",
    title: "Nicole",
    artist: "NIKI",
    year: 2022,
    genre: "Indie Folk / Pop",
    favouriteTrack: "",
    review:
      "",
    tier: "A",
    mbid: "79abdd44-3e2d-41f8-a65a-8f827eff97d1",
    background: 0xe4dbd3,
  },
  {
    key: "BUZZ",
    title: "Buzz",
    artist: "NIKI",
    year: 2024,
    genre: "Folk Pop",
    favouriteTrack: "",
    review:
      "",
    tier: "C",
    mbid: "85961bf4-8be5-4838-a8ba-0deba96efeb0",
    background: 0x8a3d3a,
  },
  {
    key: "SINK_INTO_ME",
    title: "Sink Into Me",
    artist: "Babeheaven",
    year: 2022,
    genre: "Alternative Indie / Dream pop",
    favouriteTrack: "",
    review:
      "",
    tier: "B",
    mbid: "09745143-b260-4730-a24b-856ff84d71fb",
    background: 0xe5061d,
  },
  {
    key: "A_LA_SALA",
    title: "A LA SALA",
    artist: "Khruangbin",
    year: 2024,
    genre: "Neo-Psychedelia / Funk Rock",
    favouriteTrack: "",
    review:
      "",
    tier: "B",
    mbid: "758d7fb2-fa83-4276-aa20-f7e5120e4002",
    background: 0xf15a49,
  },
  {
    key: "IV",
    title: "IV",
    artist: "BADBADNOTGOOD",
    year: 2016,
    genre: "Nu Jazz",
    favouriteTrack: "",
    review:
      "",
    tier: "A",
    mbid: "16297acb-896e-48e4-8390-f9ca95c4f0d9",
    background: 0x8adcfb,
  },
];

export const TIERS: Tier[] = ["S", "A", "B", "C", "D", "F"];

export const TIER_COLOURS: Record<Tier, { bg: string}> = {
  S: { bg: "#F8FBDB" },  
  A: { bg: "#ECF39E" },  
  B: { bg: "#90A955" },  
  C: { bg: "#4F772D" },  
  D: { bg: "#31572C" }, 
  F: { bg: "#132A13" },  
};