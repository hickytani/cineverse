// CineVerse — Shared TypeScript Types

export interface MediaItem {
  _id: string
  tmdbId?: number
  jikanId?: number
  type: MediaType
  title: string
  originalTitle?: string
  overview?: string
  posterPath?: string
  backdropPath?: string
  releaseYear?: number
  releaseDate?: string
  genres?: string[]
  runtime?: number
  language?: string
  country?: string
  tmdbRating?: number
  voteCount?: number
  popularity?: number
  tagline?: string
  trailerKey?: string
  cast?: CastMember[]
  director?: string
  imdbRating?: number
  rottenTomatoesScore?: number
  boxOffice?: string
}

export type MediaType = 'MOVIE' | 'TV_SERIES' | 'ANIME' | 'MANGA' | 'WEB_SERIES' | 'DOCUMENTARY' | 'OVA' | 'ONA' | 'SPECIAL'

export interface CastMember {
  name: string
  character: string
  profilePath?: string
}

export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatar?: string
  avatarUrl?: string
  bio?: string
  location?: string
  interests?: string[]
  followersCount: number
  followingCount: number
  watchedCount?: number
  reviewCount?: number
  watchlistCount?: number
  preferredGenres?: string[]
  createdAt?: string
}

export interface Review {
  _id?: string
  id?: string
  userId: string
  mediaId: string
  content: string
  reviewText?: string
  rating?: number
  score?: number
  spoiler: boolean
  likes: number
  createdAt: string
  user?: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>
}

export interface Rating {
  id: string
  userId: string
  mediaId: string
  value: number
  createdAt: string
}

export interface WatchlistItem {
  id: string
  userId: string
  mediaId: string
  status: WatchlistStatus
  progress?: number
  addedAt: string
  media?: MediaItem
}

export type WatchlistStatus = 'WANT_TO_WATCH' | 'WATCHING' | 'COMPLETED' | 'DROPPED' | 'ON_HOLD'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  movies?: T extends MediaItem[] ? MediaItem[] : never
}

export interface PaginatedResponse<T> {
  success: boolean
  items: T[]
  page: number
  totalPages: number
  totalResults: number
  source?: 'tmdb' | 'jikan' | 'fallback'
}
