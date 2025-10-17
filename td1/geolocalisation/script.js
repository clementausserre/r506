// OPTIONS
var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

// Date
function getDate(pos) {
    const date = new Date(pos.timestamp);
    return date.toLocaleString();
}

// GET POSITION
document.getElementById("btnCurrent").addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(successToGetPosition, errorToGetPosition, options);
});

function successToGetPosition(pos) {
    var cord = pos.coords;

    const content = `
Latitude  : ${cord.latitude}   
Longitude : ${cord.longitude}
Altitude  : ${cord.altitude ?? "Non disponible"} m
Précision : ${cord.accuracy} m
Vitesse   : ${cord.speed ?? "Non disponible"} m/s
Date      : ${getDate(pos)}
    `;

    document.getElementById("current").textContent = content;
}

function errorToGetPosition() {
    document.getElementById("current").textContent = "Géolocalisation non supportée.";
}

// WATCH POSITION

document.getElementById("btnWatch").addEventListener('click', () => {
    navigator.geolocation.watchPosition(successToWatchPosition, errorToWatchPosition, options);
});

target = {
  latitude: 0,
  longitude: 0,
};

function successToWatchPosition(pos) {
    var cord = pos.coords;

    const content = `
Latitude  : ${cord.latitude}   
Longitude : ${cord.longitude}
Altitude  : ${cord.altitude ?? "Non disponible"} m
Précision : ${cord.accuracy} m
Vitesse   : ${cord.speed ?? "Non disponible"} m/s
Date      : ${getDate(pos)}
    `;

    document.getElementById("watch").textContent = content;
}

function errorToWatchPosition() {
    document.getElementById("watch").textContent = "Géolocalisation non supportée.";
}