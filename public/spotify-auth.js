class SpotifyAuth {
    constructor() {
        this.clientId = '6e3e7b1272f74f18b75612995627d9cd';
        this.redirectUri = 'http://127.0.0.1:5500';
        this.scope = 'user-read-private user-read-email playlist-read-private user-follow-read user-read-recently-played';
        
        const params = new URLSearchParams(window.location.hash.substring(1));
        this.accessToken = params.get('access_token');
        
        if (this.accessToken) {
            localStorage.setItem('spotify_access_token', this.accessToken);
            window.location.hash = '';
        }
    }

    getLoginUrl() {
        const authEndpoint = 'https://accounts.spotify.com/authorize';
        const queryParams = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'token',
            redirect_uri: this.redirectUri,
            scope: this.scope,
            show_dialog: true
        });
        
        return `${authEndpoint}?${queryParams.toString()}`;
    }

    login() {
        window.location.href = this.getLoginUrl();
    }

    getAccessToken() {
        return localStorage.getItem('spotify_access_token');
    }

    logout() {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        console.log("logged out")
    }

    isLoggedIn() {
        return !!this.getAccessToken();
    }
}