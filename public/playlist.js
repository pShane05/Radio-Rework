document.addEventListener('DOMContentLoaded', () => {
    // setup user
    const api = new SpotifyAPI();
    const auth = new SpotifyAuth();
    checkAuthStatus();
    profilePic.innerHTML = `
        <img src="${user.images[0]?.url}" alt="Profile" style="width: 100px">
    `;

    // retrieve params
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const trackId = urlParams.get('trackId');

    const user = api.getUser(userId);
    const track = api.getTrack(trackId);
    console.log(user);
    console.log(track);


    function checkAuthStatus() {
        const accessToken = localStorage.getItem('spotify_access_token');
        
        if (!auth.isLoggedIn()) 
            auth.login();
        else {
            // Load user profile
            api.getCurrentUser()
                .then(user => {
                    profilePic.innerHTML = `
                        <img src="${user.images[0]?.url}" alt="Profile" style="width: 100px">
                    `;
                })
                .catch(error => {
                    console.error('Error:', error);
                    auth.logout();
                    window.location.reload();
                });
        }
    }
});