// Verified official game cover/capsule database for exact title matching
const VERIFIED_GAME_COVERS: Record<string, { cover: string; platform?: string; year?: number }> = {
  'elden ring': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900_2x.jpg',
    platform: 'PC / PS5',
    year: 2022
  },
  'cyberpunk 2077: phantom liberty': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/2138330/library_600x900_2x.jpg',
    platform: 'PC / PS5',
    year: 2023
  },
  'cyberpunk 2077 phantom liberty': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/2138330/library_600x900_2x.jpg',
    platform: 'PC / PS5',
    year: 2023
  },
  'cyberpunk 2077': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900_2x.jpg',
    platform: 'PC / PS5',
    year: 2020
  },
  'the legend of zelda: tears of the kingdom': {
    cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg',
    platform: 'Nintendo Switch',
    year: 2023
  },
  'the legend of zelda tears of the kingdom': {
    cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg',
    platform: 'Nintendo Switch',
    year: 2023
  },
  'the legend of zelda: breath of the wild': {
    cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.jpg',
    platform: 'Nintendo Switch',
    year: 2017
  },
  'god of war ragnarök': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/2322010/library_600x900_2x.jpg',
    platform: 'PlayStation 5 / PC',
    year: 2022
  },
  'god of war ragnarok': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/2322010/library_600x900_2x.jpg',
    platform: 'PlayStation 5 / PC',
    year: 2022
  },
  'god of war': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/1593500/library_600x900_2x.jpg',
    platform: 'PC / PlayStation 4',
    year: 2018
  },
  'hollow knight': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/367520/library_600x900_2x.jpg',
    platform: 'PC',
    year: 2017
  },
  'red dead redemption 2': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900_2x.jpg',
    platform: 'PC / PS4',
    year: 2018
  },
  'resident evil 4 remake': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/2050650/library_600x900_2x.jpg',
    platform: 'PC / PS5',
    year: 2023
  },
  'resident evil 4': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/2050650/library_600x900_2x.jpg',
    platform: 'PC / PS5',
    year: 2023
  },
  "baldur's gate 3": {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900_2x.jpg',
    platform: 'PC',
    year: 2023
  },
  'baldurs gate 3': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900_2x.jpg',
    platform: 'PC',
    year: 2023
  },
  'silent hill 2 remake': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/2124490/library_600x900_2x.jpg',
    platform: 'PC / PS5',
    year: 2024
  },
  'silent hill 2': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/2124490/library_600x900_2x.jpg',
    platform: 'PC / PS5',
    year: 2024
  },
  'ghost of tsushima': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/2215430/library_600x900_2x.jpg',
    platform: 'PC / PS5',
    year: 2020
  },
  'black myth: wukong': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/2358720/library_600x900_2x.jpg',
    platform: 'PC / PS5',
    year: 2024
  },
  'the witcher 3: wild hunt': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900_2x.jpg',
    platform: 'PC',
    year: 2015
  },
  'sekiro: shadows die twice': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/814380/library_600x900_2x.jpg',
    platform: 'PC',
    year: 2019
  },
  'dark souls iii': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/374320/library_600x900_2x.jpg',
    platform: 'PC',
    year: 2016
  },
  'grand theft auto v': {
    cover: 'https://shared.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900_2x.jpg',
    platform: 'PC',
    year: 2013
  }
};

export interface GameMetadata {
  title: string;
  coverUrl: string | null;
  releaseYear?: number;
  platform?: string;
  genres?: string[];
  developer?: string;
}

/**
 * Fetch official game box art and metadata by exact title.
 */
export async function fetchGameCover(title: string, platform?: string): Promise<GameMetadata | null> {
  const normalized = title.trim().toLowerCase();

  // 1. First priority: Check verified official collection mapping
  if (VERIFIED_GAME_COVERS[normalized]) {
    const match = VERIFIED_GAME_COVERS[normalized];
    return {
      title,
      coverUrl: match.cover,
      releaseYear: match.year,
      platform: match.platform || platform
    };
  }

  // 2. If RAWG API key is provided via env, query live game database
  const rawgApiKey = import.meta.env.VITE_GAME_API_KEY;
  if (rawgApiKey) {
    try {
      const url = `https://api.rawg.io/api/games?search=${encodeURIComponent(title)}&key=${rawgApiKey}&page_size=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const game = data.results[0];
          return {
            title: game.name,
            coverUrl: game.background_image || null,
            releaseYear: game.released ? parseInt(game.released.slice(0, 4), 10) : undefined,
            genres: game.genres?.map((g: { name: string }) => g.name)
          };
        }
      }
    } catch (err) {
      console.warn('Live RAWG API fetch failed:', err);
    }
  }

  return null;
}
