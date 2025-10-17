/**
 * Weather App JavaScript
 * This script handles all the functionality of the weather application
 * including API calls, weather data processing, and UI updates.
 */

// API and DOM Elements Configuration
const apiKey = "f188143dfbf22611aa2d03760f3bc699"; // OpenWeather API key
const searchBtn = document.getElementById("searchBtn");    // Search button element
const cityInput = document.getElementById("cityInput");    // City input field
const weatherInfo = document.getElementById("weatherInfo"); // Weather display container
const errorMsg = document.getElementById("errorMsg");      // Error message display

let currentTemp = null; // Store current temperature globally

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  } else {
    errorMsg.textContent = "✏️ Please enter a city name.";
  }
});

/**
 * Fetches weather data from OpenWeather API
 * Handles API calls and error cases
 * @param {string} city - Name of the city to get weather for
 */
async function getWeather(city) {
  // Construct API URL with city name, API key, and metric units
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("City not found");
    }

    const data = await response.json();
    displayWeather(data);
    errorMsg.textContent = ""; // clear error if success
  } catch (error) {
    if (error.message === "City not found") {
      errorMsg.textContent = "🔍 City not found. Please check the spelling and try again.";
    } else {
      errorMsg.textContent = "⚠️ Unable to fetch weather data. Please try again later.";
    }
    weatherInfo.innerHTML = "";
  }
}

/**
 * Determines the appropriate weather icon based on weather condition code
 * @param {number} weatherId - The weather condition code from OpenWeather API
 * @param {string} description - The weather description text
 * @returns {string} The appropriate weather emoji icon
 */
function getWeatherIcon(weatherId, description) {
  // Reference: https://openweathermap.org/weather-conditions
  if (weatherId >= 200 && weatherId < 300) return '⛈️'; // Thunderstorm
  if (weatherId >= 300 && weatherId < 400) return '🌧️'; // Drizzle
  if (weatherId >= 500 && weatherId < 600) {
    if (weatherId === 511) return '🌨️'; // Freezing rain
    return weatherId < 504 ? '🌧️' : '🌊'; // Rain (heavy rain gets waves)
  }
  // Enhanced snow conditions
  if (weatherId >= 600 && weatherId < 700) {
    switch(weatherId) {
      case 600: return '🌨️'; // light snow
      case 601: return '❄️'; // snow
      case 602: return '❄️❄️'; // heavy snow
      case 611: return '🌧️❄️'; // sleet
      case 612: return '🌧️❄️'; // light sleet
      case 613: return '🌧️❄️❄️'; // heavy sleet
      case 615: return '🌧️❄️'; // light rain and snow
      case 616: return '🌧️❄️❄️'; // rain and snow
      case 620: return '🌨️'; // light shower snow
      case 621: return '🌨️❄️'; // shower snow
      case 622: return '🌨️❄️❄️'; // heavy shower snow
      default: return '❄️';
    }
  }
  if (weatherId >= 700 && weatherId < 800) {
    if (weatherId === 781) return '🌪️'; // Tornado
    return '🌫️'; // Atmosphere (mist, fog, etc)
  }
  if (weatherId === 800) return '☀️'; // Clear sky
  if (weatherId === 801) return '🌤️'; // Few clouds
  if (weatherId === 802) return '⛅'; // Scattered clouds
  if (weatherId === 803) return '🌥️'; // Broken clouds
  if (weatherId === 804) return '☁️'; // Overcast clouds
  return '🌈'; // Default fallback
}

/**
 * Generates additional weather indicators based on various weather parameters
 * @param {number} temp - Temperature in Celsius
 * @param {number} windSpeed - Wind speed in m/s
 * @param {number} humidity - Humidity percentage
 * @param {number} weatherId - Weather condition code
 * @returns {string} Space-separated string of weather emoji indicators
 */
function getExtraWeatherEmoji(temp, windSpeed, humidity, weatherId) {
  let emojis = []; // Array to store weather indicator emojis
  
  // Temperature based emojis
  if (temp > 30) emojis.push('🌡️');
  if (temp < 0) {
    emojis.push('🥶');
    if (temp < -20) emojis.push('❄️'); // Extra cold indicator
  }
  
  // Wind based emoji
  if (windSpeed > 10) {
    if (weatherId >= 600 && weatherId < 700) {
      emojis.push('🌬️❄️'); // Blowing snow
    } else if (windSpeed > 20) {
      emojis.push('🌪️'); // Very strong winds
    } else {
      emojis.push('💨');
    }
  }
  
  // Special handling for extreme locations
  if (temp < -15 && windSpeed > 15) {
    emojis.push('⚠️'); // Extreme condition warning
    emojis.push('🏔️'); // Mountain/extreme altitude indicator
  }
  
  // Snow accumulation indicator
  if (weatherId >= 600 && weatherId < 700) {
    if (temp < -10) emojis.push('🏔️'); // Heavy snow accumulation
    if (windSpeed > 15) emojis.push('⚠️'); // Blizzard warning
  }
  
  // Humidity based emoji
  if (humidity > 80) {
    if (temp < 0) {
      emojis.push('🧊'); // High humidity in freezing conditions - ice risk
    } else {
      emojis.push('💧');
    }
  }
  
  return emojis.join(' ');
}

/**
 * Displays the weather information in the UI
 * Updates the DOM with weather data including:
 * - City name
 * - Temperature (with C/F toggle)
 * - Weather description and icons
 * - Humidity and wind information
 * @param {Object} data - Weather data from OpenWeather API
 */
function displayWeather(data) {
  // Destructure weather data from API response
  const { name } = data;                           // City name
  const { temp, humidity } = data.main;            // Temperature and humidity
  const { description, id: weatherId } = data.weather[0];  // Weather description and ID
  const { speed } = data.wind;                     // Wind speed
  currentTemp = temp; // Store current temperature

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
        <button class="temp-toggle" title="Toggle °F/°C">Change in °F</button>
      </p>
    </div>
    <p>${description}</p>
    <p>💧 Humidity: ${humidity}%</p>
    <p>🌬 Wind: ${speed} m/s</p>`;

  // Setup temperature toggle functionality
  const tempValue = document.querySelector('.temp-value');
  const tempUnit = document.querySelector('.temp-unit');
  const tempToggle = document.querySelector('.temp-toggle');
  let isCelsius = true;

  tempToggle.addEventListener('click', () => {
    if (isCelsius) {
      // Convert to Fahrenheit
      const fahrenheit = Math.round((currentTemp * 9/5) + 32);
      tempValue.textContent = fahrenheit;
      tempUnit.textContent = 'F';
      tempToggle.textContent = 'Chnage in °C';
      tempValue.style.color = '#4CAF50';
    } else {
      // Convert back to Celsius
      tempValue.textContent = Math.round(currentTemp);
      tempUnit.textContent = 'C';
      tempToggle.textContent = 'Change in °F';
      tempValue.style.color = 'white';
    }
    isCelsius = !isCelsius;
  });
}
