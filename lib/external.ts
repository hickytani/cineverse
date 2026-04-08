// Extended API layer — TMDB, Jikan (Anime/Manga), Open Library (Books), Last.fm (Music)
// All free, no extra registration for Jikan or Open Library

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_KEY || process.env.TMDB_API_KEY || 'edf9f18f8ac43b090367c89d8682b3d9'
const TMDB_BASE = 'https://api.themoviedb.org/3'
const JIKAN_BASE = 'https://api.jikan.moe/v4'
const OL_BASE = 'https://openlibrary.org'
const LASTFM_KEY = process.env.NEXT_PUBLIC_LASTFM_KEY || process.env.LASTFM_API_KEY || '349189c4495cdb1fc1c1fb3982278405'
const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0'

export const TMDB_IMG = 'https://image.tmdb.org/t/p'
export const poster = (path: string | null, size = 'w500') => path ? `${TMDB_IMG}/${size}${path}` : null
export const backdrop = (path: string | null, size = 'w1280') => path ? `${TMDB_IMG}/${size}${path}` : null

// Simple TTL cache in memory for client-side deduplication
const memCache = new Map<string, { data: unknown; expires: number }>()
async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = memCache.get(key)
  if (hit && hit.expires > Date.now()) return hit.data as T
  const data = await fn()
  memCache.set(key, { data, expires: Date.now() + ttlMs })
  return data
}

// ── TMDB ──────────────────────────────────────────────────────────────────
async function tmdb<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`)
  url.searchParams.set('api_key', TMDB_KEY)
  url.searchParams.set('language', 'en-US')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`TMDB ${path} failed: ${res.status}`)
  return res.json()
}

export const tmdbApi = {
  trending: (period: 'day' | 'week' = 'day') =>
    cached(`tmdb:trending:${period}`, 3600_000, () => tmdb('/trending/all/day')),

  discover: (params: Record<string, string | number> = {}) =>
    cached(`tmdb:discover:${JSON.stringify(params)}`, 21600_000, () => tmdb('/discover/movie', params)),

  discoverTv: (params: Record<string, string | number> = {}) =>
    cached(`tmdb:tv:${JSON.stringify(params)}`, 21600_000, () => tmdb('/discover/tv', params)),

  movie: (id: number) => tmdb<Record<string, unknown>>(`/movie/${id}`, { append_to_response: 'credits,videos,similar,images' }),
  tvShow: (id: number) => tmdb<Record<string, unknown>>(`/tv/${id}`, { append_to_response: 'credits,videos,similar' }),

  popular: (page = 1) => tmdb('/movie/popular', { page }),
  topRated: (page = 1) => tmdb('/movie/top_rated', { page }),
  upcoming: () => tmdb('/movie/upcoming', { region: 'IN' }),

  bollywood: () => cached('tmdb:bollywood', 21600_000, () => tmdb('/discover/movie', { with_original_language: 'hi', sort_by: 'popularity.desc', region: 'IN' })),
  southIndian: () => cached('tmdb:south', 21600_000, () => tmdb('/discover/movie', { with_original_language: 'te,ta,ml,kn', sort_by: 'popularity.desc' })),
  kdramas: () => cached('tmdb:kdrama', 21600_000, () => tmdb('/discover/tv', { with_original_language: 'ko', sort_by: 'popularity.desc' })),
  webSeries: () => cached('tmdb:webseries', 21600_000, () => tmdb('/discover/tv', { sort_by: 'popularity.desc', with_type: '4' })),
  hiddenGems: () => cached('tmdb:gems', 21600_000, () => tmdb('/discover/movie', { 'vote_average.gte': 7.5, 'vote_count.lte': 5000, 'vote_count.gte': 500, sort_by: 'vote_average.desc' })),
  animeShows: () => cached('tmdb:anime', 21600_000, () => tmdb('/discover/tv', { with_genres: '16', with_original_language: 'ja', sort_by: 'popularity.desc' })),

  searchMulti: (query: string, page = 1) => tmdb('/search/multi', { query, page }),
  images: (id: number, type: 'movie' | 'tv' = 'movie') => tmdb(`/${type}/${id}/images`),
}

// ── JIKAN (Anime + Manga — no key needed) ────────────────────────────────
async function jikan<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${JIKAN_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  // Jikan has a 3 req/s rate limit — add small delay
  await new Promise(r => setTimeout(r, 350))
  const res = await fetch(url.toString(), { next: { revalidate: 21600 } })
  if (!res.ok) throw new Error(`Jikan ${path} failed: ${res.status}`)
  return res.json()
}

export const jikanApi = {
  topAnime: (page = 1) => cached(`jikan:anime:${page}`, 21600_000, () => jikan('/top/anime', { type: 'tv', page })),
  topManga: (page = 1) => cached(`jikan:manga:${page}`, 21600_000, () => jikan('/top/manga', { type: 'manga', page })),
  seasonNow: () => cached('jikan:season', 3600_000, () => jikan('/seasons/now')),
  anime: (id: number) => jikan(`/anime/${id}/full`),
  manga: (id: number) => jikan(`/manga/${id}/full`),
  searchAnime: (q: string) => jikan('/anime', { q }),
  searchManga: (q: string) => jikan('/manga', { q }),
}

// ── OPEN LIBRARY (Books — completely free, no key) ────────────────────────
export const openLibraryApi = {
  search: async (query: string, limit = 20) => {
    const res = await fetch(`${OL_BASE}/search.json?q=${encodeURIComponent(query)}&sort=rating&limit=${limit}`, { next: { revalidate: 43200 } })
    return res.json()
  },
  cover: (id: string | number, size: 'S' | 'M' | 'L' = 'M') => `https://covers.openlibrary.org/b/id/${id}-${size}.jpg`,
  book: async (id: string) => {
    const res = await fetch(`${OL_BASE}/works/${id}.json`, { next: { revalidate: 43200 } })
    return res.json()
  },
  topFantasy: () => cached('ol:fantasy', 43200_000, () => openLibraryApi.search('fantasy')),
  topManga: () => cached('ol:manga', 43200_000, () => openLibraryApi.search('manga')),
}

// ── LAST.FM (Music Charts — free API key) ─────────────────────────────────
async function lastfm<T>(method: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(LASTFM_BASE)
  url.searchParams.set('method', method)
  url.searchParams.set('api_key', LASTFM_KEY)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '20')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  const res = await fetch(url.toString(), { next: { revalidate: 10800 } })
  return res.json()
}

export const lastfmApi = {
  topTracks: () => cached('lastfm:tracks', 10800_000, () => lastfm('chart.gettoptracks')),
  topArtists: () => cached('lastfm:artists', 10800_000, () => lastfm('chart.gettopartists')),
  albumInfo: (artist: string, album: string) => lastfm('album.getinfo', { artist, album }),
  artistInfo: (artist: string) => lastfm('artist.getinfo', { artist }),
}
