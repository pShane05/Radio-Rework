document.addEventListener('DOMContentLoaded', () => {
    const auth = new SpotifyAuth();
    const logoutButton = document.getElementById('logoutButton');
    const userProfile = document.getElementById('userProfile');
    const profilePic = document.getElementById('profile-pic');


    if (!auth.isLoggedIn()) 
        auth.login();
    else {
        const api = new SpotifyAPI(auth.getAccessToken());

        // Example: Load user profile
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

    logoutButton.addEventListener('click', async () => {
        auth.logout();
        window.location.reload();
    });

    api.search('Your search query', ['track'])
    .then(results => {
        console.log('Search results:', results);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});