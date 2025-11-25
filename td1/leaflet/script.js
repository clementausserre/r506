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

var marker, precisionCircle;

let maPosition;

function successToGetPosition(pos) {
    var coords = pos.coords;
    var precision = coords.accuracy;

    maPosition = [coords.latitude, coords.longitude];

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

let cityCache = {};

async function addPoint(city) {
    if (cityCache[city]) {
        console.log("Coordonnées récupérées depuis le cache :", city, cityCache[city]);
        L.marker(cityCache[city]).addTo(map).bindPopup(city);
        return cityCache[city];
    }

    const coords = await getCoordinates(city);
    if (coords) {
        cityCache[city] = coords;
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

// Triangle des Bermudes
var triangle1 = L.polygon([
    [32.3078, -64.7505],
    [25.7617, -80.1918],
    [18.4655, -66.1057]
], {color: 'red', fillColor: 'lightred', fillOpacity: 0.4}).addTo(map);

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function afficherLimiteMetropole() {
    fetch('metropole.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: {
                color: 'blue',
                weight: 3,
                fillOpacity: 0.1
            }
        }).addTo(map);
    });
}

function afficherTrajetGPS() {
    const url = `https://router.project-osrm.org/route/v1/driving/${cityCache["Nice"][1]},${cityCache["Nice"][0]};${cityCache["Marseille"][1]},${cityCache["Marseille"][0]}?overview=full&geometries=geojson`;

    fetch(url)
    .then(res => res.json())
    .then(data => {
        const route = data.routes[0].geometry;
        L.geoJSON(route, { color: 'red', weight: 4 }).addTo(map);
    });
}

function trajetGpsMapBox() {
    const token = "pk.eyJ1IjoiY3YwNiIsImEiOiJjajg2MmpzYjcwbWdnMzNsc2NzM2l4eW0yIn0.TfDJipR5II7orUZaC848YA";
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${cityCache["Nice"][1]},${cityCache["Nice"][0]};${cityCache["Monaco"][1]},${cityCache["Monaco"][0]}?geometries=geojson&access_token=${token}`;

    fetch(url)
    .then(res => res.json())
    .then(data => {
        const route = data.routes[0].geometry;
        L.geoJSON(route, { color: 'purple', weight: 4 }).addTo(map);
    });
}

async function init() {
    try {
        const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, options)
        );
        successToGetPosition(pos);
    } catch (err) {
        errorToGetPosition(err);
    }

    await addPoint("Nice");
    await addPoint("Marseille");
    await addPoint("Monaco");

    drawLineBetween(cityCache["Nice"], cityCache["Marseille"]);

    let distance = getDistance(maPosition[0], maPosition[1], cityCache["Marseille"][0], cityCache["Marseille"][1]);
    marker.bindPopup(`Vous êtes ici<br>Distance Marseille : ${distance.toFixed(2)} km`).openPopup();

    afficherLimiteMetropole();
    afficherTrajetGPS();
    trajetGpsMapBox();
}

init();
