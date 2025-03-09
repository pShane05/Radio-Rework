class SpotifyAPI {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.baseUrl = 'https://api.spotify.com/v1';
    }

    async fetchFromSpotify(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...defaultOptions,
            ...options
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired
                localStorage.removeItem('spotify_access_token');
                window.location.reload();
                throw new Error('Session expired. Please login again.');
            }
            throw new Error(`Spotify API Error: ${response.statusText}`);
        }

        return response.json();
    }

    // User Profile
    async getCurrentUser() {
        return this.fetchFromSpotify('/me');
    }

    // Playlists
    async getUserPlaylists(limit = 20, offset = 0) {
        return this.fetchFromSpotify(`/me/playlists?limit=${limit}&offset=${offset}`);
    }

    async getPlaylist(playlistId) {
        return this.fetchFromSpotify(`/playlists/${playlistId}`);
    }

    // Search
    async search(query, types = ['track', 'artist', 'album']) {
        const params = new URLSearchParams({
            q: query,
            type: types.join(','),
            limit: 20
        });
        return this.fetchFromSpotify(`/search?${params}`);
    }

    // Tracks
    async getTrack(trackId) {
        return this.fetchFromSpotify(`/tracks/${trackId}`);
    }

    async getAudioFeatures(trackId) {
        return this.fetchFromSpotify(`/audio-features/${trackId}`);
    }

    // Albums
    async getAlbum(albumId) {
        return this.fetchFromSpotify(`/albums/${albumId}`);
    }

    async getAlbumTracks(albumId) {
        return this.fetchFromSpotify(`/albums/${albumId}/tracks`);
    }

    // Artists
    async getArtist(artistId) {
        return this.fetchFromSpotify(`/artists/${artistId}`);
    }

    async getArtistTopTracks(artistId, market = 'US') {
        return this.fetchFromSpotify(`/artists/${artistId}/top-tracks?market=${market}`);
    }

    // User Library
    async getSavedTracks(limit = 20, offset = 0) {
        return this.fetchFromSpotify(`/me/tracks?limit=${limit}&offset=${offset}`);
    }

    async checkSavedTracks(trackIds) {
        const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds;
        return this.fetchFromSpotify(`/me/tracks/contains?ids=${ids}`);
    }

    // Player
    async getCurrentPlayback() {
        return this.fetchFromSpotify('/me/player');
    }

    async getRecentlyPlayed() {
        return this.fetchFromSpotify('/me/player/recently-played');
    }

    // Recommendations
    async getRecommendations({seed_artists = [], seed_tracks = [], seed_genres = []}) {
        const params = new URLSearchParams({
            seed_artists: seed_artists.join(','),
            seed_tracks: seed_tracks.join(','),
            seed_genres: seed_genres.join(',')
        });
        return this.fetchFromSpotify(`/recommendations?${params}`);
    }
}