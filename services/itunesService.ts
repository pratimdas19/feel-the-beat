
// Simple in-memory cache to prevent redundant network requests for the same song
const ARTWORK_CACHE = new Map<string, string>();

export const fetchSongArtwork = async (artist: string, title: string): Promise<string | null> => {
  if (!artist || !title) {
    return null;
  }

  const cacheKey = `${artist.toLowerCase()}-${title.toLowerCase()}`;
  
  if (ARTWORK_CACHE.has(cacheKey)) {
    return ARTWORK_CACHE.get(cacheKey) || null;
  }

  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    // standard iTunes Search API
    const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
    
    if (!response.ok) {
        return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // defaults to 100x100, which is efficient for the list view
      const artworkUrl = data.results[0].artworkUrl100;
      ARTWORK_CACHE.set(cacheKey, artworkUrl);
      return artworkUrl;
    }
  } catch (error) {
    // If fetch fails (e.g. offline), fail silently to fallback
    console.warn('Artwork fetch failed:', error);
  }
  
  return null;
};
