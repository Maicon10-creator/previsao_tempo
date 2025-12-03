const API_KEY = "31c7889709bc0630fa5ff6639d9cec00";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const themeBtn = document.getElementById("themeBtn");

const statusEl = document.getElementById("status");
const weatherSection = document.getElementById("weatherSection");

const iconEl = document.getElementById("icon");
const locationEl = document.getElementById("location");
const descriptionEl = document.getElementById("description");
const temperatureEl = document.getElementById("temperature");
const humidityEl = document.getElementById("humidity");

const forecastEl = document.getElementById("forecast");

// =============================
// EVENTO: BUSCAR CIDADE
// =============================
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) {
        statusEl.textContent = "Digite uma cidade.";
        return;
    }
    fetchWeather(city);
});

// =============================
// EVENTO: USAR GEOLOCALIZAÇÃO
// =============================
geoBtn.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(
        pos => {
            const { latitude, longitude } = pos.coords;
            fetchWeatherGeo(latitude, longitude);
        },
        () => alert("Não foi possível obter localização.")
    );
});

// =============================
// EVENTO: TROCAR TEMA
// =============================
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
});

// =============================
// BUSCA POR NOME DA CIDADE
// =============================
async function fetchWeather(city) {
    statusEl.textContent = "Buscando...";

    const currentURL = 
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`;

    const forecastURL =
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`;

    const [currentRes, forecastRes] = await Promise.all([
        fetch(currentURL),
        fetch(forecastURL)
    ]);

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    if (current.cod !== 200) {
        statusEl.textContent = "Cidade não encontrada!";
        return;
    }

    renderCurrent(current);
    renderForecast(forecast.list);
}

// =============================
// BUSCA POR GEOLOCALIZAÇÃO
// =============================
async function fetchWeatherGeo(lat, lon) {
    const currentURL =
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;

    const forecastURL =
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;

    const [currentRes, forecastRes] = await Promise.all([
        fetch(currentURL),
        fetch(forecastURL)
    ]);

    renderCurrent(await currentRes.json());
    renderForecast((await forecastRes.json()).list);
}

// =============================
// EXIBIR CLIMA ATUAL
// =============================
function renderCurrent(data) {
    weatherSection.classList.remove("hidden");

    iconEl.textContent = getIcon(data.weather[0].main);
    locationEl.textContent = `${data.name}, ${data.sys.country}`;
    descriptionEl.textContent = data.weather[0].description;
    temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
    humidityEl.textContent = `Umidade: ${data.main.humidity}%`;

    statusEl.textContent = "Atualizado ✔";
}

// =============================
// EXIBIR PREVISÃO 5 DIAS
// =============================
function renderForecast(list) {
    const daily = {};

    list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!daily[date]) daily[date] = item;
    });

    const days = Object.values(daily).slice(0, 5);

    forecastEl.innerHTML = "";
    const labels = [];
    const temps = [];
    const hums = [];

    days.forEach(day => {
        const card = document.createElement("div");
        card.className = "card";

        const dt = new Date(day.dt_txt);
        labels.push(dt.toLocaleDateString("pt-BR"));
        temps.push(day.main.temp);
        hums.push(day.main.humidity);

        card.innerHTML = `
            <h4>${dt.toLocaleDateString("pt-BR")}</h4>
            <p>${getIcon(day.weather[0].main)}</p>
            <p>${Math.round(day.main.temp)}°C</p>
            <p>Umidade: ${day.main.humidity}%</p>
        `;

        forecastEl.appendChild(card);
    });

    renderCharts(labels, temps, hums);
}

// =============================
// ÍCONES DO CLIMA
// =============================
function getIcon(cond) {
    const icons = {
        Clear: "☀️",
        Clouds: "☁️",
        Rain: "🌧️",
        Thunderstorm: "⛈️",
        Drizzle: "🌦️",
        Snow: "❄️",
        Mist: "🌫️",
    };
    return icons[cond] || "🌡️";
}

// =============================
// GRÁFICOS
// =============================
let tempChart, humidityChart;

function renderCharts(labels, temps, hums) {
    if (tempChart) tempChart.destroy();
    if (humidityChart) humidityChart.destroy();

    const ctx1 = document.getElementById("tempChart");
    const ctx2 = document.getElementById("humidityChart");

    tempChart = new Chart(ctx1, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Temperatura (°C)",
                data: temps,
                borderWidth: 2
            }]
        }
    });

    humidityChart = new Chart(ctx2, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Umidade (%)",
                data: hums,
                borderWidth: 2
            }]
        }
    });
}
