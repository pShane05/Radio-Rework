class TasteDive {
    constructor() {
        this.accessToken = '1048030-RadioRew-16A2F1F1';
        this.baseUrl = 'https://thingproxy.freeboard.io/fetch/https://tastedive.com/api/similar';
    }

    async fetchFromTasteDive(query) {

        const response = await fetch(
            `${this.baseUrl}?q=${query}&type=music&limit=20&slimit=3&k=${this.accessToken}`, {
        });

        return response.json();
    }
}