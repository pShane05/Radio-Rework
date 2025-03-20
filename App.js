document.addEventListener('DOMContentLoaded', () => {
    const auth = new SpotifyAuth();
    const logoutButton = document.getElementById('logout-button');
    const profilePic = document.getElementById('profile-pic');
    const searchInput = document.querySelector("[data-search]");
    const api = new SpotifyAPI(auth.getAccessToken());
    const trackCardTemplate = document.querySelector("[data-track-card-template]");
    const trackCardContainer = document.querySelector("[data-track-container]");
    var following;
    var recents;
    var clickTrackId = null;


    //Login
    if (!auth.isLoggedIn()) 
        auth.login();
    else {
        // Load user profile
        api.getCurrentUser()
            .then(user => {
                loadProfileContent(user);
            })
            .catch(error => {
                console.error('Error:', error);
                auth.logout();
                window.location.reload();
            });
    }

    // Logout
    logoutButton.addEventListener('click', async () => {
        auth.logout();
        window.location.reload();
    });


    // Search
    searchInput.addEventListener("input", e => {
        const value = e.target.value

        // Keep main display if search is emptied
        if (value === '') {
            switchDisplay('main');
            trackCardContainer.innerHTML = '';
            return
        }

        trackCardContainer.innerHTML = '';

        // Add track data to cards and append
        api.searchSpotify(value).then(response => {
            response.tracks.items.forEach(track => {
                const card = trackCardTemplate.content.cloneNode(true).children[0];
                const cover = card.querySelector("[data-cover]");
                const title = card.querySelector("[data-title]");
                const artist = card.querySelector("[data-artist]");

                cover.src = track.album.images[0].url;
                title.textContent = track.name;
                artist.textContent = track.artists[0].name;
                
                // handle click
                card.addEventListener('click', async () => {
                    clickTrackId = track.id;
                    api.handleTrackSelect(clickTrackId);
                })

                trackCardContainer.append(card);
            });
           console.log(response.tracks.items);
        });

        switchDisplay('search');
    });


    // Change display
    async function switchDisplay(display) {
        const main = document.getElementById('main-display');
        const search = document.getElementById('search-display');
        if(display === 'search') {
            main.style = "display: none";
            search.style = "display: flex";
        } else if (display === 'main') {
            main.style = "display: block";
            search.style = "display: none";
            console.log('main');
        } else {
            console.log("Wrong display argument dummy");
            return;
        }
    }
      
    async function loadProfileContent(user) {
        profilePic.innerHTML = `
                    <img src="${user.images[0]?.url}" alt="Profile" style="width: 100px">
                `;
        following = await api.getFollowing();
        recents = await api.getRecentlyPlayed();
        console.log(following);
        console.log(recents);
    }
});