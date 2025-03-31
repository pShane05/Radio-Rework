document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const radioTrackId = urlParams.get('track');
    const auth = new SpotifyAuth();
    const api = new SpotifyAPI(auth.getAccessToken());
    const lastRecs = new LastfmAPIRecs();
    console.log(radioTrackId);

    const logoutButton = document.getElementById('logout-button');
    const profilePic = document.getElementById('profile-pic');
    

    // templates
    const radioTrackCardTemplate = document.querySelector("[data-radio-track-template]");
    const radioTrackCardContainer = document.querySelector("[data-radio-track-container");



    //Login
    if (!auth.isLoggedIn()) 
        auth.login();
    else {
        // Load user profile
        api.getCurrentUser()
            .then(user => {
                loadProfileContent(user);
                api.getTrack(radioTrackId).then(response => {
                    populateRadioPlaylist(response);
                })
                
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


      
    async function loadProfileContent(user) {
        // display pfp
        profilePic.innerHTML = `
            <img src="${user.images[0]?.url}" alt="Profile" style="width: 100%">
        `;
    }

    // Create image, title, and song content for playlist
    async function populateRadioPlaylist(track) {
        const coverImg = document.getElementById('playlist-cover-container');
        const playlistTitle = document.getElementById('playlist-title');
        const coverSrc = `${track.album.images[0]?.url}`;
        const radioName = `Songs based on "${track.name}"`;
        var playlistTracks = [];
        coverImg.innerHTML = `
            <img src="${coverSrc}"style="width: 100%">
        `;
        playlistTitle.innerHTML = `${radioName}`;


        const saveButton = document.getElementById('save-button');
        const checkCard = document.getElementById('check-card');
        saveButton.addEventListener('click', async () => {
            // Return if no songs to add
            if (radioTrackCardContainer.childElementCount < 1) {
                console.log('No Songs To Add');
                return;
            }
            console.log('button works')

            // loop each track for URI
            document.querySelectorAll('.radioTrack').forEach(trackCard => {
                playlistTracks.push(trackCard.lastChild.previousSibling.textContent);
            })

            // create playlist with all songs
            api.createPlaylist(radioName).then(response => {
                api.addTracksToPlaylist(response.id, playlistTracks);
            })
            saveButton.style = `display: none`;
            checkCard.style = `display: flex`;
        });

        // encode lastfm params
        const encodedName = encodeURI(`${track.name}`);
        const encodedArtist = encodeURI(`${track.artists[0].name}`);

        // get recommendations from lastfm
        lastRecs.fetchRecsLastFM(encodedArtist, encodedName).then(response => {
            // Error handling for empty recs
            if(response.children[0].children.length < 1) {
                console.log('nah');
                
            }
            response.children[0].children.forEach(recTrack => {
                var spotTrack;
                const card = radioTrackCardTemplate.content.cloneNode(true).children[0];
                const cover = card.querySelector("[data-cover]");
                const title = card.querySelector("[data-title]");
                const artist = card.querySelector("[data-artist]");
                const trackUri = card.querySelector("[data-track-uri]");

                // search Spotify API for each song recommended
                api.searchSpotify(recTrack.children[0].value, 1).then(response => {
                    spotTrack = response.tracks.items[0];

                    cover.src = spotTrack.album.images[0].url;
                    title.textContent = spotTrack.name;
                    artist.textContent = spotTrack.artists[0].name;
                    trackUri.textContent = spotTrack.uri;
                })

                // Button handler for removing unwanted songs
                const removeBtn = card.querySelector("[data-remove-button");
                removeBtn.addEventListener('click', async () => {
                    radioTrackCardContainer.removeChild(card);
                })
                    
                radioTrackCardContainer.append(card);
            });
        })

        console.log(playlistTracks);
    }


});