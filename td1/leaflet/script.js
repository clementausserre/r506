// Initialisation de la map
var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Options pour la récupération de la position
var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

// Récupère la position
navigator.geolocation.getCurrentPosition(successToGetPosition, errorToGetPosition, options);

function successToGetPosition(pos) {
    var cord = pos.coords;

    L.marker([cord.latitude, cord.longitude]).addTo(map);
    map.setView([cord.latitude, cord.longitude], 13);
    console.log("Marqueur placé !");
}

function errorToGetPosition() {
    alert("Géolocalisation non supportée");
}

// Date
function getDate(pos) {
    const date = new Date(pos.timestamp);
    return date.toLocaleString();
}

// Fonction qui récupère les coordonnées d'une ville via l'API d'OpenStreetMap
async function getCoordinates(city) {
    const url = `https://nominatim.openstreetmap.org/search?q=${city}&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        console.log(city, lat, lon);

        L.marker([lat, lon]).addTo(map).bindPopup(city).openPopup();
    } else {
        console.log("Ville " + city + " non trouvée");
    }
}

getCoordinates("Nice");