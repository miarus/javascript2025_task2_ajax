// Last.fm API tiedot, muuttujat ja vakiot ensin, helpottaa mahdollisia muutoksia kun alussa. const eli eivät muutu

const apiKey = '5eb82707ca81ce89456ff031fe9e485f';
const apiBaseUrl = 'https://ws.audioscrobbler.com/2.0/';

// DOM elementit. globaalit, let ei const koska alustetaan myöhemm. DOM-muuttujat hyvä listata alussa koodia, joita koodi käyttää
let artistInput;
let searchButton;
let artistsList;
let albumsContainer;
let albumDetailContainer;

// Tapahtumankuuntelijat. koodin käynnistää, suoritetaan kun sivu latautunut
document.addEventListener('DOMContentLoaded', function() {  //DOm elementtien valinta, klikkaukset ja näppäinpainelluksset
    // Valitse DOM elementit vasta kun DOM on latautunut
    artistInput = document.getElementById('artistInput');
    searchButton = document.getElementById('searchButton');
    artistsList = document.getElementById('artistsList');
    albumsContainer = document.getElementById('albumsContainer');
    albumDetailContainer = document.getElementById('albumDetailContainer');
    
    // Lataa suositut artistit sivun latautuessa. sovelluksen alustaminen
    fetchTopArtists();
    
    // Lisää haku-painikkeen tapahtumankuuntelija
    searchButton.addEventListener('click', searchArtist);
    
    // Lisää Enter-näppäimen toiminto hakukenttään
    artistInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchArtist();
        }
    });
    // LISÄÄ TÄHÄN:
    // Lisää koti-painikkeen toiminnallisuus
    const homeButton = document.getElementById('homeButton');
    homeButton.addEventListener('click', function(e) {
        e.preventDefault(); // Estä linkin normaali toiminta
        
        // Tyhjennä hakukenttä
        artistInput.value = '';
        
        // Lataa suositut artistit
        fetchTopArtists();
        
        // Tyhjennä albumit ja albumin tiedot
        albumsContainer.innerHTML = '<p class="album-instructions">Valitse artisti nähdäksesi albumit</p>';
        albumDetailContainer.innerHTML = '<p class="detail-instructions">Valitse albumi nähdäksesi tiedot</p>';
    });



});


//päätoiminnallisuudet- funktiot
// Hae suositut artistit,,ettei ole ihan tyhjä ruutu alkuun , kutsuu displayArtistia (alla)
function fetchTopArtists() {  //A. ensin haetaan artistit
    // Näytä latausviesti
    artistsList.innerHTML = '<li class="artist-loading">Ladataan artisteja...</li>';
    
    // Tee API-kutsu suosituille artisteille
    const url = `${apiBaseUrl}?method=chart.gettopartists&api_key=${apiKey}&format=json&limit=10`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Verkkovirhe');
            }
            return response.json();
        })
        .then(data => {
            displayArtists(data.artists.artist);
        })
        .catch(error => {
            console.error('Virhe artistien hakemisessa:', error);
            artistsList.innerHTML = '<li class="error">Virhe ladattaessa artisteja</li>';
        });
}

// Näytä artistit listassa, klikattavana, muttaa api saadun datalistan käyttöliittymäksi
function displayArtists(artists) {  //B. näytetään artistit
    artistsList.innerHTML = '';
    
    artists.forEach(artist => {  //luodaan jokaiselle artistille oma elementti
        const listItem = document.createElement('li');
        listItem.textContent = artist.name;
        listItem.addEventListener('click', () => {   //kun klikataan...
            // Merkitse valittu artisti
            document.querySelectorAll('#artistsList li').forEach(item => {
                item.classList.remove('selected');
            });
            listItem.classList.add('selected');
            
            // Hae ja näytä artistin albumit
            fetchArtistAlbums(artist.name);
        });
        artistsList.appendChild(listItem);
    });
}

// Hae artistia hakutoiminnolla, kutsuu myös funktiota displayArtist
function searchArtist() {  //C. haku täsä
    const searchTerm = artistInput.value.trim();
    
    if (searchTerm === '') {
        return;
    }
    
    // Näytä latausviesti
    artistsList.innerHTML = '<li class="artist-loading">Haetaan artisteja...</li>';
    
    // Tee API-kutsu artistin hakuun
    const url = `${apiBaseUrl}?method=artist.search&artist=${encodeURIComponent(searchTerm)}&api_key=${apiKey}&format=json&limit=10`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Verkkovirhe');
            }
            return response.json();
        })
        .then(data => {
            if (data.results.artistmatches.artist.length > 0) {
                displayArtists(data.results.artistmatches.artist);
            } else {
                artistsList.innerHTML = '<li class="no-results">Artisteja ei löytynyt</li>';
            }
        })
        .catch(error => {
            console.error('Virhe artistien hakemisessa:', error);
            artistsList.innerHTML = '<li class="error">Virhe hakutoiminnossa</li>';
        });
}

// Hae artistin albumit, kutsuu myös displayAlbums
function fetchArtistAlbums(artistName) {  //D. valitun albumien haku tässä 
    // Näytä latausviesti
    albumsContainer.innerHTML = '<p class="album-loading">Ladataan albumeita...</p>';
    albumDetailContainer.innerHTML = '<p class="detail-instructions">Valitse albumi nähdäksesi tiedot</p>';
    
    // Tee API-kutsu artistin albumeille
    const url = `${apiBaseUrl}?method=artist.gettopalbums&artist=${encodeURIComponent(artistName)}&api_key=${apiKey}&format=json&limit=12`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Verkkovirhe');
            }
            return response.json();
        })
        .then(data => {
            if (data.topalbums && data.topalbums.album.length > 0) {
                displayAlbums(data.topalbums.album);
            } else {
                albumsContainer.innerHTML = '<p class="no-results">Albumeita ei löytynyt</p>';
            }
        })
        .catch(error => {
            console.error('Virhe albumien hakemisessa:', error);
            albumsContainer.innerHTML = '<p class="error">Virhe ladattaessa albumeita</p>';
        });
}

// Näytä albumit artistilta kuvina ja tietoina
function displayAlbums(albums) {  //E. albumien näyttö
    albumsContainer.innerHTML = '';
    
    albums.forEach(album => {
        // Tarkista onko albumilla kuva
        const imageUrl = album.image[3]['#text'] || 'placeholder.jpg';
        
        // Luo albumi-kortti
        const albumCard = document.createElement('div');
        albumCard.className = 'album-card';
        albumCard.innerHTML = `
            <img src="${imageUrl}" alt="${album.name}" class="album-image">
            <div class="album-info">
                <div class="album-title">${album.name}</div>
                <div class="album-tracks">Kappaleita: ?</div>
            </div>
        `;
        
        // Lisää klikkaustapahtuma albumin tietojen näyttämiseen
        albumCard.addEventListener('click', () => {
            // Merkitse valittu albumi
            document.querySelectorAll('.album-card').forEach(card => {
                card.classList.remove('selected');
            });
            albumCard.classList.add('selected');
            
            // Hae ja näytä albumin tiedot
            fetchAlbumInfo(album.artist.name, album.name);
        });
        
        albumsContainer.appendChild(albumCard);
    });
}

// Hae albumin tarkat tiedot, kappaleet, kestot
function fetchAlbumInfo(artistName, albumName) {  // F. albumin tietojen haku
    // Näytä latausviesti
    albumDetailContainer.innerHTML = '<p class="detail-loading">Ladataan albumin tietoja...</p>';
    
    // Tee API-kutsu albumin tiedoille
    const url = `${apiBaseUrl}?method=album.getinfo&artist=${encodeURIComponent(artistName)}&album=${encodeURIComponent(albumName)}&api_key=${apiKey}&format=json`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Verkkovirhe');
            }
            return response.json();
        })
        .then(data => {
            if (data.album) {
                displayAlbumDetails(data.album);
            } else {
                albumDetailContainer.innerHTML = '<p class="no-results">Albumin tietoja ei löytynyt</p>';
            }
        })
        .catch(error => {
            console.error('Virhe albumin tietojen hakemisessa:', error);
            albumDetailContainer.innerHTML = '<p class="error">Virhe ladattaessa albumin tietoja</p>';
        });
}

// Näytä albumin tarkat tiedot, kutsuu formatDurationia
function displayAlbumDetails(album) {  //  G. albumin tietojen näyttö
    // Tarkista onko albumilla kappaleita
    if (!album.tracks || !album.tracks.track) {
        albumDetailContainer.innerHTML = '<p class="no-results">Kappalelistaa ei ole saatavilla</p>';
        return;
    }
    
    // Varmista että kappaleet ovat array-muodossa (Last.fm API palauttaa yhden kappaleen objektina)
    const tracks = Array.isArray(album.tracks.track) ? album.tracks.track : [album.tracks.track];
    
    // Luo HTML-sisältö. elementtien muunto html muotoon ja käyttäjä näkee ne silloin
    let html = `
        <div class="album-header">
            <h3>${album.name}</h3>
            <p>Artisti: ${album.artist}</p>
            ${album.wiki ? `<p>Julkaistu: ${album.wiki.published || 'Tuntematon'}</p>` : ''}
        </div>
        <h4>Kappaleet:</h4>
        <ul class="track-list">
    `;
    
    // Lisää kappaleet
    tracks.forEach((track, index) => {
        html += `
            <li class="track-item">
                <span class="track-number">${index + 1}.</span>
                <span class="track-name">${track.name}</span>
                <span class="track-duration">${formatDuration(track.duration)}</span>
            </li>
        `;
    });
    
    html += '</ul>';
    
    // Lisää wiki-tiedot jos saatavilla
    if (album.wiki && album.wiki.summary) {
        const summary = album.wiki.summary.replace(/<a href=".*?">.*?<\/a>/g, '');
        html += `
            <div class="album-description">
                <h4>Tietoa albumista:</h4>
                <p>${summary}</p>
            </div>
        `;
    }
    
    albumDetailContainer.innerHTML = html;
}

// Apufunktiot. Muotoile kappaleen kesto (sekunneista muotoon mm:ss)
function formatDuration(duration) {
    if (!duration || duration === '0') {  //tarkistetaan onko kestoa lainkaan, jos puuttuu tai o, palautetaan -
        return '-';
    }
    
    const minutes = Math.floor(duration / 60000) || Math.floor(duration / 60) || 0;
    const seconds = Math.floor((duration % 60000) / 1000) || Math.floor(duration % 60) || 0;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}