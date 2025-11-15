

// API and DOM Elements Configuration

const apiKey = "f188143dfbf22611aa2d03760f3bc699";


const searchBtn = document.getElementById("searchBtn");

const cityInput = document.getElementById("cityInput");

const weatherInfo = document.getElementById("weatherInfo");

const errorMsg = document.getElementById("errorMsg");

let currentTemp = null; 

// Handle search with accessibility, validation, and loading state
searchBtn.addEventListener("click", () => {

  const city = cityInput.value.trim().replace(/[^a-zA-Z\s]/g,""); 

  if (city.length) {

    weatherInfo.innerHTML = `<div class="loading"></div>`;

    errorMsg.textContent = "";

    cityInput.setAttribute("aria-invalid", "false");

    getWeather(city);

  } else {

    errorMsg.textContent = "✏️ Please enter a valid city name.";

    errorMsg.setAttribute("aria-live", "assertive");

    cityInput.setAttribute("aria-invalid", "true");

    cityInput.focus();

  }

});

/**
 * Fetch weather data from OpenWeather API
 * Includes API error handling and network fallback
 */
async function getWeather(city) {

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {

    const response = await fetch(url);

    if (!response.ok) throw new Error("City not found");

    const data = await response.json();

    displayWeather(data);

    errorMsg.textContent = ""; // clear error if success

  } catch (error) {

    weatherInfo.innerHTML = "";

    if (error.message === "City not found") {

      errorMsg.textContent = "🔍 City not found. Please check the spelling and try again.";

    } else {

      errorMsg.textContent = "⚠️ Unable to fetch weather data. Please try again later.";

    }


    errorMsg.setAttribute("aria-live", "assertive");

    cityInput.focus();
  }
}

/**
 * Returns weather emoji icon
 */
function getWeatherIcon(weatherId, description) {

  if (weatherId >= 200 && weatherId < 300) return '⛈️';

  if (weatherId >= 300 && weatherId < 400) return '🌧️';


  if (weatherId >= 500 && weatherId < 600) {

    if (weatherId === 511) return '🌨️';

    return weatherId < 504 ? '🌧️' : '🌊';

  }

  if (weatherId >= 600 && weatherId < 700) {
    switch(weatherId) {
      case 600: return '🌨️';
      case 601: return '❄️';
      case 602: return '❄️❄️';
      case 611: case 612: case 613: return '🌧️❄️';
      case 615: case 616: return '🌧️❄️';
      case 620: return '🌨️';
      case 621: return '🌨️❄️';
      case 622: return '🌨️❄️❄️';
      default: return '❄️';
    }
  }
  if (weatherId >= 700 && weatherId < 800) {
    if (weatherId === 781) return '🌪️';
    return '🌫️';
  }
  if (weatherId === 800) return '☀️';
  if (weatherId === 801) return '🌤️';
  if (weatherId === 802) return '⛅';
  if (weatherId === 803) return '🌥️';
  if (weatherId === 804) return '☁️';
  return '🌈';
}

/**
 * Extra weather emoji for visual cues
 */
function getExtraWeatherEmoji(temp, windSpeed, humidity, weatherId) {

  const emojis = [];
  if (temp > 30) emojis.push('🌡️');

  if (temp < 0) {

    emojis.push('🥶');

    if (temp < -20) emojis.push('❄️');

  }

  if (windSpeed > 10) {
    if (weatherId >= 600 && weatherId < 700) {

      emojis.push('🌬️❄️');

    } else if (windSpeed > 20) {

      emojis.push('🌪️');

    } else {

      emojis.push('💨');

    }

  }

  if (temp < -15 && windSpeed > 15) {

    emojis.push('⚠️','🏔️');

  }

  if (weatherId >= 600 && weatherId < 700) {

    if (temp < -10) emojis.push('🏔️');

    if (windSpeed > 15) emojis.push('⚠️');

  }

  if (humidity > 80) {

    emojis.push(temp < 0 ? '🧊' : '💧');

  }

  return emojis.join(' ');
}

/**
 * Updates UI with weather info and temperature toggle
 */
function displayWeather(data) {

  const { name } = data;

  const { temp, humidity } = data.main;

  const { description, id: weatherId } = data.weather[0];

  const { speed } = data.wind;

  currentTemp = temp;


  const mainWeatherIcon = getWeatherIcon(weatherId, description);
  
  const extraWeatherEmojis = getExtraWeatherEmoji(temp, speed, humidity, weatherId);

  weatherInfo.innerHTML = `
    <h2>${name}</h2>
    <div class="weather-icon-container">
      <span class="main-weather-icon">${mainWeatherIcon}</span>
      <span class="extra-weather-icons">${extraWeatherEmojis}</span>
    </div>
    <div class="temperature-container">
      <p class="temp-display">
        <span class="temp-value">${Math.round(temp)}</span>°<span class="temp-unit">C</span>
        <button class="temp-toggle" title="Toggle °F/°C">Change to °F</button>
      </p>
    </div>
    <p class="description">${description}</p>
    <p>💧 Humidity: ${humidity}%</p>
    <p>🌬 Wind: ${speed} m/s</p>`;

  // Accessibility update
  weatherInfo.setAttribute("aria-live", "polite");

  // Setup temperature toggle
  
  const tempValue = document.querySelector('.temp-value');
  
  const tempUnit = document.querySelector('.temp-unit');
  
  const tempToggle = document.querySelector('.temp-toggle');
  
  let isCelsius = true;

  tempToggle.addEventListener('click', () => {
    if (isCelsius) {
  
      const fahrenheit = Math.round((currentTemp * 9/5) + 32);
  
      tempValue.textContent = fahrenheit;
  
      tempUnit.textContent = 'F';
  
      tempToggle.textContent = 'Change to °C';
  
      tempValue.style.color = '#4CAF50';
  
    } else {
  
      tempValue.textContent = Math.round(currentTemp);
  
      tempUnit.textContent = 'C';
  
      tempToggle.textContent = 'Change to °F';
  
      tempValue.style.color = 'white';
  
    }
  
    isCelsius = !isCelsius;
  
  });
}

