// Initialisation de la map
var map = L.map('map').setView([51.505, -0.09], 5);

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

var marker, precisionCircle;

function successToGetPosition(pos) {
    var coords = pos.coords;
    var precision = coords.accuracy;

    if (marker) {
        marker.setLatLng([coords.latitude, coords.longitude]);
    } else {
        marker = L.marker([coords.latitude, coords.longitude]).addTo(map).bindPopup("Vous êtes ici").openPopup();
    }

    if (precisionCircle) {
        precisionCircle.setLatLng([coords.latitude, coords.longitude]).setRadius(precision);
    } else {
        precisionCircle = L.circle([coords.latitude, coords.longitude], {
            radius: precision,
            color: 'blue',
            fillColor: '#a0c4ff',
            fillOpacity: 0.3
        }).addTo(map);
    }

    map.setView([coords.latitude, coords.longitude], 5);
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

        return [lat, lon];
    } else {
        console.log("Ville " + city + " non trouvée");
        return null;
    }
}

let pathCoords = [];

async function addPoint(city) {
    const coords = await getCoordinates(city);
    if (coords) {
        pathCoords.push(coords);
        L.marker(coords).addTo(map).bindPopup(city);
        return coords;
    }
    return null;
}

function drawLineBetween(point1, point2) {
    if (point1 && point2) {
        L.polyline([point1, point2], {
            color: 'green',
            weight: 4,
            opacity: 0.7
        }).addTo(map);

        map.fitBounds([point1, point2]);
    }
}

addPoint("Nice").then(nice => {
    addPoint("Marseille").then(marseille => {
        drawLineBetween(nice, marseille);
    });
});

// Triangle des Bermudes
var triangle1 = L.polygon([
    [32.3078, -64.7505],
    [25.7617, -80.1918],
    [18.4655, -66.1057]
], {color: 'red', fillColor: 'lightred', fillOpacity: 0.4}).addTo(map);