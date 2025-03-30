document.addEventListener('DOMContentLoaded', () => {
    const auth = new SpotifyAuth();
    const api = new SpotifyAPI(auth.getAccessToken());
    const lastRecs = new LastfmAPIRecs();

    const logoutButton = document.getElementById('logout-button');
    const backButton = document.getElementById('back-button');
    const profilePic = document.getElementById('profile-pic');
    const searchInput = document.querySelector("[data-search]");
    const scrollRows = document.querySelectorAll('.row');
    

    // templates
    const trackCardTemplate = document.querySelector("[data-track-card-template]");
    const radioTrackCardTemplate = document.querySelector("[data-radio-track-template]");
    const artistCoverTemplate = document.querySelector("[data-artist-cover-template");
    const recentTrackTemplate = document.querySelector("[data-recent-card]");
    const trackCardContainer = document.querySelector("[data-track-container]");
    const radioTrackCardContainer = document.querySelector("[data-radio-track-container");

    // containers
    const recentsContainer = document.getElementById('recents');
    const followingContainer = document.getElementById('following');

    
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

        // display followed artists
        api.getFollowing().then(response => {
            response.artists.items.forEach(artist => {
                const artistCover = artistCoverTemplate.content.cloneNode(true).children[0];
                const artistPic = artistCover.querySelector("[data-artist-image]");
                const artistName = artistCover.querySelector("[data-artist-name]");

                artistPic.src = artist.images[0].url;
                artistName.innerHTML = artist.name;

                // handle click
                artistCover.addEventListener('click', async () => {

                })

                followingContainer.append(artistCover);
            })
        })

        recents = await api.getRecentlyPlayed();
        following = await api.getFollowing();
        console.log(following);
        console.log(recents);


    }

    // Handles clicking of a searched track
    async function handleTrackSelect(id) {
        api.getTrack(id).then(track => {
            switchDisplay('radio');
            populateRadioPlaylist(track);
        });
        
    }

    // Create image, title, and song content for playlist
    async function populateRadioPlaylist(track) {
        const coverImg = document.getElementById('playlist-cover-container');
        const playlistTitle = document.getElementById('playlist-title');
        const coverSrc = `${track.album.images[0]?.url}`;
        const radioName = `Playlist based on "${track.name}"`;
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

    backButton.addEventListener('click', async () => {
        switchDisplay('main');
        window.location.reload();
    })


    // allow scrolling for rows
    scrollRows.forEach(function(row) {
        row.addEventListener('wheel', function(e) {
          if (e.deltaY !== 0) {
            e.preventDefault();
            this.scrollLeft += e.deltaY;
          }
        }, { passive: false });
      });
});