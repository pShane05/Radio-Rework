document.addEventListener('DOMContentLoaded', () => {
    const auth = new SpotifyAuth();
    const logoutButton = document.getElementById('logout-button');
    const profilePic = document.getElementById('profile-pic');
    const searchInput = document.querySelector("[data-search]");
    const api = new SpotifyAPI(auth.getAccessToken());
    const trackCardTemplate = document.querySelector("[data-track-card-template]");
    const radioTrackCardTemplate = document.querySelector("[data-radio-track-template]");
    const recentTrackTemplate = document.querySelector("[data-recent-card]");
    const trackCardContainer = document.querySelector("[data-track-container]");
    const radioTrackCardContainer = document.querySelector("[data-radio-track-container");
    const recentsContainer = document.getElementById('recents');
    const backButton = document.getElementById('back-button');
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
        api.searchSpotify(value, 20).then(response => {
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
                    handleTrackSelect(clickTrackId);
                })

                trackCardContainer.append(card);
            });
        });

        switchDisplay('search');
    });


    // Change display
    async function switchDisplay(display) {
        const main = document.getElementById('main-display');
        const search = document.getElementById('search-display');
        const radio = document.getElementById('radio-display');
        const searchbar = document.getElementById('search-container');
        if(display === 'search') {
            main.style = "display: none";
            search.style = "display: flex";
            radio.style = "display: none";
            searchbar.style = "display: block";

        } else if (display === 'main') {
            main.style = "display: block";
            search.style = "display: none";
            radio.style = "display: none";
            searchbar.style = "display: block";
            
        } else if (display === 'radio') {
            main.style = "display: none";
            search.style = "display: none";
            radio.style = "display: flex";
            searchbar.style = "display: none";

        } else {
            console.log("Wrong display argument dummy");
            return;
        }
    }
      
    async function loadProfileContent(user) {
        // display pfp
        profilePic.innerHTML = `
            <img src="${user.images[0]?.url}" alt="Profile" style="width: 100%">
        `;
        
        // display recent tracks
        api.getRecentlyPlayed().then(response => {
            response.items.forEach(recentObject => {
                const recentTrack = recentObject.track;
                const recent = recentTrackTemplate.content.cloneNode(true).children[0];
                const cover = recent.querySelector("[data-cover]");
                const title = recent.querySelector("[data-title]");

                cover.src = recentTrack.album.images[0].url;
                title.textContent = recentTrack.name;

                // handle click
                recent.addEventListener('click', async () => {
                    clickTrackId = recentTrack.id;
                    handleTrackSelect(clickTrackId);
                })

                recentsContainer.append(recent);
            });
        })

        api.getFollowing().then(response => {
            response.artists.items.forEach(artist => {

            })
        })

        recents = await api.getRecentlyPlayed();
        following = await api.getFollowing();
        console.log(following);
        console.log(recents);


    }

    async function handleTrackSelect(id) {
        api.getTrack(id).then(track => {
            switchDisplay('radio');
            console.log(track);
            populateRadioPlaylist(track);
        });
        
    }

    // Create image, title, and song content for playlist
    async function populateRadioPlaylist(track) {
        const coverImg = document.getElementById('playlist-cover-container');
        const playlistTitle = document.getElementById('playlist-title');
        const coverSrc = `${track.album.images[0]?.url}`;
        const radioName = `Playlist based on ${track.name}`;
        const user = api.getCurrentUser();
        coverImg.innerHTML = `
            <img src="${coverSrc}"style="width: 100%">
        `;
        playlistTitle.innerHTML = `${radioName}`;


        const saveButton = document.getElementById('save-button');
        const checkCard = document.getElementById('check-card');
        saveButton.addEventListener('click', async () => {
            //api.createPlaylist(user, radioName);
            saveButton.style = `display: none`;
            checkCard.style = `display: flex`;
            console.log("ran onClick")
        });

        api.searchSpotify(`${track.name}`, 40).then(response => {
            response.tracks.items.forEach(recTrack => {
                if(recTrack.name != track.name) {
                    const card = radioTrackCardTemplate.content.cloneNode(true).children[0];
                    const cover = card.querySelector("[data-cover]");
                    const title = card.querySelector("[data-title]");
                    const artist = card.querySelector("[data-artist]");
                    const removeBtn = card.querySelector("[data-remove-button");
                    
                    cover.src = recTrack.album.images[0].url;
                    title.textContent = recTrack.name;
                    artist.textContent = recTrack.artists[0].name;
                    removeBtn.addEventListener('click', async () => {
                        radioTrackCardContainer.removeChild(card);
                    })
                    
                    radioTrackCardContainer.append(card);
                }
            });
        })
    }

    backButton.addEventListener('click', async () => {
        switchDisplay('main');
        //searchInput.value = '';
        window.location.reload();
    })
});