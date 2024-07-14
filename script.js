async function getWeather() {
    const city = document.getElementById('cityInput').value;
    if (!city) {
        alert('Bitte geben Sie eine Stadt ein!');
        return;
    }

    try {
        // Koordinaten der Stadt ermitteln
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?city=${city}&format=json`);
        const geocodeData = await geocodeResponse.json();
        
        if (!geocodeData.length) {
            alert('Stadt nicht gefunden!');
            return;
        }

        const { lat, lon } = geocodeData[0];

        // Wetterdaten abrufen
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe/Berlin`);
        const weatherData = await weatherResponse.json();

        if (!weatherData || !weatherData.daily) {
            alert('Keine Wetterdaten gefunden!');
            return;
        }

        displayWeatherTrend(weatherData.daily);
        displayWeatherRadar(weatherData.daily);
    } catch (error) {
        console.error('Fehler beim Abrufen der Wetterdaten:', error);
        alert('Fehler beim Abrufen der Wetterdaten!');
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
