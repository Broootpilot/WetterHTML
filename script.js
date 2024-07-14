document.addEventListener('DOMContentLoaded', (event) => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoordinates(latitude, longitude);
            getLocationName(latitude, longitude);
        }, error => {
            console.error('Fehler bei der Standortermittlung:', error);
            alert('Standortermittlung fehlgeschlagen!');
        });
    } else {
        alert('Geolocation wird von diesem Browser nicht unterstützt.');
    }
});

async function getWeatherByCity() {
    const city = document.getElementById('cityInput').value;
    if (!city) {
        alert('Bitte geben Sie eine Stadt ein!');
        return;
    }

    try {
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?city=${city}&format=json`);
        const geocodeData = await geocodeResponse.json();
        
        if (!geocodeData.length) {
            alert('Stadt nicht gefunden!');
            return;
        }

        const { lat, lon } = geocodeData[0];
        getWeatherByCoordinates(lat, lon);
        document.getElementById('locationName').textContent = city;
    } catch (error) {
        console.error('Fehler bei der Geocodierung:', error);
        alert('Fehler bei der Geocodierung!');
    }
}

async function getWeatherByCoordinates(latitude, longitude) {
    try {
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&hourly=temperature_2m,precipitation,weathercode&timezone=Europe/Berlin`);
        const weatherData = await weatherResponse.json();

        if (!weatherData || !weatherData.daily) {
            alert('Keine Wetterdaten gefunden!');
            return;
        }

        displayWeatherTrend(weatherData.daily);
        displayWeatherRadar(weatherData.daily);
        displayWeatherWarnings(weatherData.daily);
        displayHourlyForecast(weatherData.hourly);
    } catch (error) {
        console.error('Fehler beim Abrufen der Wetterdaten:', error);
        alert('Fehler beim Abrufen der Wetterdaten!');
    }
}

async function getLocationName(latitude, longitude) {
    try {
        const locationResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const locationData = await locationResponse.json();

        if (locationData && locationData.address) {
            document.getElementById('locationName').textContent = locationData.address.city || locationData.address.town || locationData.address.village || 'Unbekannter Standort';
        } else {
            document.getElementById('locationName').textContent = 'Standort konnte nicht ermittelt werden';
        }
    } catch (error) {
        console.error('Fehler bei der Standortermittlung:', error);
        document.getElementById('locationName').textContent = 'Fehler bei der Standortermittlung';
    }
}

function displayWeatherTrend(daily) {
    const weatherTrend = document.getElementById('weatherTrend');
    weatherTrend.innerHTML = '';

    daily.time.forEach((date, index) => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'weatherDay';
        dayDiv.innerHTML = `
            <h3>${date}</h3>
            <p>Max: ${daily.temperature_2m_max[index]}°C</p>
            <p>Min: ${daily.temperature_2m_min[index]}°C</p>
            <p>Niederschlag: ${daily.precipitation_sum[index]}mm</p>
        `;
        weatherTrend.appendChild(dayDiv);
    });
}

function displayWeatherRadar(daily) {
    const weatherRadar = document.getElementById('weatherRadar');
    weatherRadar.innerHTML = '';

    daily.time.forEach((date, index) => {
        const radarDiv = document.createElement('div');
        radarDiv.className = 'weatherDay';
        radarDiv.innerHTML = `
            <h3>${date}</h3>
            <p>Niederschlag: ${daily.precipitation_sum[index]}mm</p>
        `;
        weatherRadar.appendChild(radarDiv);
    });
}

function displayWeatherWarnings(daily) {
    const weatherWarnings = document.getElementById('weatherWarnings');
    weatherWarnings.innerHTML = '';

    const hasWarnings = daily.weathercode.some(code => code >= 60); // Beispielhafter Check für Wetterwarnungen

    if (hasWarnings) {
        daily.weathercode.forEach((code, index) => {
            if (code >= 60) { // Beispielhafter Schwellenwert für Warnungen
                const warningDiv = document.createElement('div');
                warningDiv.className = 'weatherWarning';
                warningDiv.innerHTML = `
                    <h3>${daily.time[index]}</h3>
                    <p>Warnung: Sturm oder Unwetter</p>
                `;
                weatherWarnings.appendChild(warningDiv);
            }
        });
    } else {
        weatherWarnings.innerHTML = '<p>Aktuell gibt es keine Warnungen o.ä.</p>';
    }
}

function displayHourlyForecast(hourly) {
    const hourlyForecast = document.getElementById('hourlyForecast');
    hourlyForecast.innerHTML = '';

    // Begrenze die stündliche Vorhersage auf die nächsten 24 Stunden
    hourly.time.slice(0, 24).forEach((time, index) => {
        const hourDiv = document.createElement('div');
        hourDiv.className = 'weatherHour';
        hourDiv.innerHTML = `
            <h3>${new Date(time).getHours()}:00</h3>
            <p>Temp: ${hourly.temperature_2m[index]}°C</p>
            <p>Niederschlag: ${hourly.precipitation[index]}mm</p>
        `;
        hourlyForecast.appendChild(hourDiv);
    });
}
