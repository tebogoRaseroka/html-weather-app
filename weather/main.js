
    const API_KEY = '6ff762344c8d4cbd9864cddb01be9e6e'; // Replace with your OpenWeatherMap API key

    let currentTimezoneOffset = 0;

    function updateTime() {
      const now = new Date(Date.now() + currentTimezoneOffset * 1000);
      let hours = now.getUTCHours();
      const minutes = now.getUTCMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      document.querySelector('.current-day .time').textContent = `${hours}:${minutes} ${ampm}`;
    }

    async function fetchWeather(city) {
      // Get current weather
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      const currentData = await currentRes.json();

      // Get hourly forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
      );
      const forecastData = await forecastRes.json();

      return { current: currentData, forecast: forecastData };
    }

    function updateCurrentWeather(data) {
      currentTimezoneOffset = data.timezone;
      updateTime();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const now = new Date(Date.now() + currentTimezoneOffset * 1000);
      document.getElementById('current-day-name').textContent = dayNames[now.getUTCDay()];
      let icon = '☀️';
      if (data.weather[0].main === 'Clouds') icon = '☁️';
      if (data.weather[0].main === 'Rain') icon = '🌧';
      if (data.weather[0].main === 'Clear') icon = '☀️';
      if (data.weather[0].main === 'Snow') icon = '❄️';
      document.getElementById('current-temp').innerHTML = `${Math.round(data.main.temp)}°C <span>${icon}</span>`;
      document.getElementById('real-feel').textContent = `Real Feel: ${Math.round(data.main.feels_like)}°C`;
      document.getElementById('wind').textContent = `Wind: ${Math.round(data.wind.speed)} km/h`;
      document.getElementById('pressure').textContent = `Pressure: ${data.main.pressure} hPa`;
      document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    }

    function generateHourlyForecast(forecastData) {
      const hoursContainer = document.querySelector('.forecast .hours');
      hoursContainer.innerHTML = '';
      // OpenWeatherMap gives 3-hour intervals, so we interpolate for 24 hours
      let slots = [];
      for (let i = 0; i < 8; i++) {
        const item = forecastData.list[i];
        slots.push(item);
      }
      for (let i = 0; i < slots.length - 1; i++) {
        const item = slots[i];
        const nextItem = slots[i + 1];
        for (let j = 0; j < 3; j++) {
          const dt = new Date((item.dt + forecastData.city.timezone + j * 3600) * 1000);
          let hour = dt.getUTCHours();
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour % 12 || 12;
          // Interpolate temp
          const temp = Math.round(item.main.temp + ((nextItem.main.temp - item.main.temp) * (j / 3)));
          // Use icon from current slot
          let icon = '☀️';
          if (item.weather[0].main === 'Clouds') icon = '☁️';
          if (item.weather[0].main === 'Rain') icon = '🌧';
          if (item.weather[0].main === 'Clear') icon = '☀️';
          if (item.weather[0].main === 'Snow') icon = '❄️';
          const weatherText = item.weather[0].main;

          const div = document.createElement('div');
          div.className = 'hour';
          div.innerHTML = `${displayHour}:00 ${ampm}<br/>${icon} ${weatherText}<br/>${temp}°C`;
          hoursContainer.appendChild(div);
        }
      }
      // Add last slot
      const lastItem = slots[slots.length - 1];
      const dt = new Date((lastItem.dt + forecastData.city.timezone) * 1000);
      let hour = dt.getUTCHours();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      let icon = '☀️';
      if (lastItem.weather[0].main === 'Clouds') icon = '☁️';
      if (lastItem.weather[0].main === 'Rain') icon = '🌧';
      if (lastItem.weather[0].main === 'Clear') icon = '☀️';
      if (lastItem.weather[0].main === 'Snow') icon = '❄️';
      const weatherText = lastItem.weather[0].main;
      const div = document.createElement('div');
      div.className = 'hour';
      div.innerHTML = `${displayHour}:00 ${ampm}<br/>${icon} ${weatherText}<br/>${Math.round(lastItem.main.temp)}°C`;
      hoursContainer.appendChild(div);
    }

    async function updateWeather(city) {
      try {
        const { current, forecast } = await fetchWeather(city);
        updateCurrentWeather(current);
        generateHourlyForecast(forecast);
      } catch (e) {
        alert('City not found or API error.');
      }
    }

    // Initial load (default city)
    updateWeather('Nairobi');
    setInterval(updateTime, 1000);

    // Search functionality
    document.getElementById('search-btn').addEventListener('click', () => {
      const city = document.getElementById('city-input').value;
      if (city) updateWeather(city);
    });

    document.getElementById('city-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const city = document.getElementById('city-input').value;
        if (city) updateWeather(city);
      }
    });
