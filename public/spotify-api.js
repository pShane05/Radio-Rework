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
                // Token renew
                localStorage.removeItem('spotify_access_token');
                window.location.reload();
                throw new Error('Session expired. Please login again.');
            }
            throw new Error(`Spotify API Error: ${response.statusText}`);
        }

        return response.json();
    }


    // Search
    async searchSpotify(query, lim) {
        const params = new URLSearchParams({
            q: query,
            type: ['track'],
            limit: lim
        });
        return this.fetchFromSpotify(`/search?${params}`);
    }


    // Create Playlist
    async createPlaylist(name) {
        const currUser = await this.getCurrentUser();
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
              },
            body: JSON.stringify({
                "name": `${name}`,
                "description": "A playlist based on your fine taste in songs",
                "public": true
            })
        }
        const response = await fetch(`${this.baseUrl}/users/${currUser.id}/playlists`, options);

        if (!response.ok) {
            if (response.status === 401) {
                // Token renew
                localStorage.removeItem('spotify_access_token');
                window.location.reload();
                throw new Error('Session expired. Please login again.');
            }
            throw new Error(`Spotify API Error: ${response.statusText}`);
        }

        return response.json();
    }

    // Add to Playlist
    async addTracksToPlaylist(playlistId, uris) {
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
              },
            body: JSON.stringify({
                "uris": uris,
                "position": 0
            })
        }
        return this.fetchFromSpotify(`/playlists/${playlistId}/tracks`, options);
    }

    //  Recommendations
    //
    //  --[[ DEPRECATED  ]]--
    //  Only included for memories
    //  and proof I made it
    //
    /*async getRecommendations(seedGenres, seedTracks) {
        try {    
            const totalSeeds = seedTracks.length + seedGenres.length;
            if (totalSeeds === 0) {
                throw new Error('At least one seed is required');
            }
            if (totalSeeds > 5) {
                throw new Error('Maximum of 5 total seeds allowed');
            }
    
            const params = new URLSearchParams();
    
            if (seedTracks.length > 0) {
                params.append('seed_tracks', seedTracks.join(','));
            }
            if (seedGenres.length > 0) {
                params.append('seed_genres', seedGenres.join(','));
            }
    
            params.append('limit', 40);

            return this.fetchFromSpotify('/recommendations?${params}');
        

        } catch (error) {
            console.error('Error getting recommendations:', error);
            throw error;
        }
    }*/


    // Get from Spotify
    async getCurrentUser() {
        return this.fetchFromSpotify('/me');
    }

    async getUser(userId) {
        return this.fetchFromSpotify(`/users/${userId}`);
    }

    async getUserPlaylists(limit = 20, offset = 0) {
        return this.fetchFromSpotify(`/me/playlists?limit=${limit}&offset=${offset}`);
    }

    async getPlaylist(playlistId) {
        return this.fetchFromSpotify(`/playlists/${playlistId}`);
    }

    async getTrack(trackId) {
        return this.fetchFromSpotify(`/tracks/${trackId}`);
    }

    async getFollowing() {
        return this.fetchFromSpotify(`/me/following/?type=artist`);
    }

    async getAlbum(albumId) {
        return this.fetchFromSpotify(`/albums/${albumId}`);
    }

    async getAlbumTracks(albumId) {
        return this.fetchFromSpotify(`/albums/${albumId}/tracks`);
    }

    async getArtist(artistId) {
        return this.fetchFromSpotify(`/artists/${artistId}`);
    }

    async getArtistTopTracks(artistId, market = 'US') {
        return this.fetchFromSpotify(`/artists/${artistId}/top-tracks?market=${market}`);
    }

    async getSavedTracks(limit = 20, offset = 0) {
        return this.fetchFromSpotify(`/me/tracks?limit=${limit}&offset=${offset}`);
    }

    async checkSavedTracks(trackIds) {
        const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds;
        return this.fetchFromSpotify(`/me/tracks/contains?ids=${ids}`);
    }

    async getCurrentPlayback() {
        return this.fetchFromSpotify('/me/player');
    }

    async getRecentlyPlayed() {
        return this.fetchFromSpotify('/me/player/recently-played');
    }
}