class LastfmAPIRecs {
    constructor() {
        this.apiKey = '7e93945eb4cd75734d4d6879a3ce5ac2';
        this.baseUrl = 'https://ws.audioscrobbler.com/2.0/';
    }

    async fetchRecsLastFM(artist, track) {
        const params = new URLSearchParams ({
            //api_key: `${this.apiKey}`,
            //method: 'track.getsimilar',
            artist: `${artist}`,
            track: `${track}`,
            //format: 'json'
        })


        const response = await fetch(`/api?artist=${artist}&track=${track}`);

        if (!response.ok) {
            throw new Error(`LastFm API Error: ${response.statusText}`);
        }

        return response.json();
    }


}