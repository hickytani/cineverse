import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cv_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Movies ──────────────────────────────────────────────────────────────
export const movieApi = {
  getTrending: (period: 'day' | 'week' = 'week') =>
    api.get('/movies/trending', { params: { period } }).then(r => r.data),

  getPopular: (page = 1) =>
    api.get('/movies/popular', { params: { page } }).then(r => r.data),

  getTopRated: (page = 1) =>
    api.get('/movies/top_rated', { params: { page } }).then(r => r.data),

  discover: (params: Record<string, string | number>) =>
    api.get('/movies/discover', { params }).then(r => r.data),

  getDetails: (id: string) =>
    api.get(`/movies/${id}`).then(r => r.data),

  getSimilar: (id: string) =>
    api.get(`/movies/${id}/similar`).then(r => r.data),

  search: (q: string, page = 1) =>
    api.get('/movies/search', { params: { q, page } }).then(r => r.data),
}

// ── TMDB Direct (through our proxy) ─────────────────────────────────────
// Content by country/genre using discover endpoint
export const contentApi = {
  indianMovies: () =>
    movieApi.discover({ origin_country: 'IN', sort_by: 'popularity.desc' }),

  kdramas: () =>
    api.get('/movies/discover', { params: { origin_country: 'KR', type: 'tv', sort_by: 'popularity.desc' } }).then(r => r.data),

  animeContent: () =>
    movieApi.discover({ with_genres: '16', sort_by: 'popularity.desc' }),

  upcoming: () =>
    movieApi.discover({ sort_by: 'popularity.desc', 'release_date.gte': new Date().toISOString().split('T')[0] }),

  southIndian: () =>
    movieApi.discover({ with_original_language: 'te|ta|ml|kn', sort_by: 'popularity.desc' }),
}

// ── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { username: email, password }).then(r => r.data),

  register: (data: { email: string; password: string; username: string; displayName: string }) =>
    api.post('/auth/register', data).then(r => r.data),

  me: () =>
    api.get('/auth/me').then(r => r.data),

  logout: () =>
    api.post('/auth/logout').then(r => r.data),
}

// ── Ratings ──────────────────────────────────────────────────────────────
export const ratingApi = {
  upsert: (movieId: string, score: number, reviewText?: string) =>
    api.post('/ratings', { movieId, score, reviewText }).then(r => r.data),

  getForMovie: (movieId: string) =>
    api.get(`/ratings/movie/${movieId}`).then(r => r.data),

  getForUser: (userId: string) =>
    api.get(`/ratings/user/${userId}`).then(r => r.data),
}

// ── Watchlist ─────────────────────────────────────────────────────────────
export const watchlistApi = {
  toggle: (movieId: string) =>
    api.post(`/lists/watchlist/${movieId}`).then(r => r.data),

  get: (userId: string, listType: string = 'watchlist') =>
    api.get(`/lists/${userId}/${listType}`).then(r => r.data),
}

// ── Search ────────────────────────────────────────────────────────────────
export const searchApi = {
  query: (q: string) =>
    api.get('/search', { params: { q } }).then(r => r.data),

  recommendations: (limit = 20) =>
    api.get('/search/recommendations', { params: { limit } }).then(r => r.data),
}

// ── Groups & Community ──────────────────────────────────────────────────
export const groupApi = {
  getCommunityGroup: () =>
    api.get('/groups').then(r => r.data.groups?.find((g: any) => g.name === 'Cinematic Collective')),
  getMessages: (groupId: string, before?: number) =>
    api.get(`/groups/${groupId}/messages`, { params: { before } }).then(r => r.data),
  send: (groupId: string, text: string) =>
    api.post(`/groups/${groupId}/messages`, { text }).then(r => r.data),
}

// ── Users & Social ──────────────────────────────────────────────────────
export const userApi = {
  search: (q: string) =>
    api.get('/search/users', { params: { q } }).then(r => r.data),
  getProfile: (username: string) =>
    api.get(`/users/username/${username}`).then(r => r.data),
  follow: (userId: string) =>
    api.post(`/follow/${userId}`).then(r => r.data),
  unfollow: (userId: string) =>
    api.delete(`/follow/${userId}`).then(r => r.data),
}

// ── Direct Messaging ─────────────────────────────────────────────────────
export const chatApi = {
  list: () =>
    api.get('/chat/list').then(r => r.data),
  getOrCreate: (userId: string) =>
    api.post(`/chat/with/${userId}`).then(r => r.data),
  getMessages: (chatId: string, before?: number) =>
    api.get(`/chat/${chatId}/messages`, { params: { before } }).then(r => r.data),
  send: (chatId: string, text: string) =>
    api.post(`/chat/${chatId}/messages`, { text }).then(r => r.data),
}

export default api
