const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');

const forecastItemsContainer = document.querySelector('.forecast-items-container');

const apiKey = '1c1a18c4cbcf9e089a586a23cc157943';

searchBtn.addEventListener('click', () => {
  if (cityInput.value.trim() !== '') {
    updateWeatherInfo(cityInput.value);
    cityInput.value = '';
    cityInput.blur();
  }
});

cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && cityInput.value.trim() !== '') {
    updateWeatherInfo(cityInput.value);
    cityInput.value = '';
    cityInput.blur();
  }
});

async function getFetchData(endpoint, city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=metric`;
  const response = await fetch(apiUrl);
  return response.json();
}

function getWeatherIcon(id) {
  if (id <= 232) return 'thunderstorm.svg';
  if (id <= 321) return 'drizzle.svg';
  if (id <= 531) return 'rain.svg';
  if (id <= 622) return 'snow.svg';
  if (id <= 781) return 'atmosphere.svg';
  if (id === 800) return 'clear.svg';
  return 'clouds.svg';
}

function getCurrentDate() {
  const currentDate = new Date();
  const options = {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  };
  return currentDate.toLocaleDateString('en-GB', options);
}

async function updateWeatherInfo(city) {
  const weatherData = await getFetchData('weather', city);

  if (weatherData.cod !== 200) {
    showDisplaySection(notFoundSection);
    return;
  }

  displayWeatherData(weatherData);
  await updateForecastsInfo(city);

  showDisplaySection(weatherInfoSection);
}

function displayWeatherData(weatherData) {
  const {
    name: country,
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed }
  } = weatherData;

  countryTxt.textContent = country;
  tempTxt.textContent = `${Math.round(temp)} °C`;
  conditionTxt.textContent = main;
  humidityValueTxt.textContent = `${humidity}%`;
  windValueTxt.textContent = `${speed} m/s`;
  currentDateTxt.textContent = getCurrentDate();

  weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;
}

async function updateForecastsInfo(city) {
  const forecastsData = await getFetchData('forecast', city);

  const timeTaken = '12:00:00';
  const todayDt = new Date().toISOString().split('T')[0];

  forecastItemsContainer.innerHTML = '';

  forecastsData.list.forEach((forecastWeather) => {
    if (
      forecastWeather.dt_txt.includes(timeTaken) &&
      !forecastWeather.dt_txt.includes(todayDt)
    ) {
      createForecastCard(forecastWeather, city);
    }
  });
}

function createForecastCard(weatherData, city) {
  const {
    dt_txt: date,
    weather: [{ id, main }],
    main: { temp, humidity },
    wind: { speed }
  } = weatherData;

  const dateTaken = new Date(date);
  const options = { day: '2-digit', month: 'short' };
  const dateResult = dateTaken.toLocaleDateString('en-US', options);

  const card = document.createElement('div');
  card.className = 'forecast-item';
  card.innerHTML = `
    <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
    <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img" />
    <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
  `;

  card.addEventListener('click', () => {
    // Show forecast data in main panel
    countryTxt.textContent = city;
    tempTxt.textContent = `${Math.round(temp)} °C`;
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = `${humidity}%`;
    windValueTxt.textContent = `${speed} m/s`;
    currentDateTxt.textContent = dateResult;
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;
  });

  forecastItemsContainer.appendChild(card);
}

function showDisplaySection(section) {
  [weatherInfoSection, searchCitySection, notFoundSection].forEach(
    (sec) => (sec.style.display = 'none')
  );
  section.style.display = 'flex';
}
