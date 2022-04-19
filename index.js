const axios = require('axios');
const mysql = require('mysql2');

const STATION_ID = "IROTTE197"
const FORMAT = "json"
const UNITS = "e"
const API_KEY = "16f9d63ff4ba413fb9d63ff4ba113fd5"

const BASE_URL = "https://api.weather.com/v2/pws/observations/"

console.log("Started the program")

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'daveleron',
    password: 'a$EQ4d8V#k',
    database: 'weatherstation'
});

function gatherData() {
    let built_url = BASE_URL + `current?stationId=${STATION_ID}&format=${FORMAT}&units=${UNITS}&apiKey=${API_KEY}`
    axios.get(built_url).then( res => {
    let observationObject = res.data.observations[0]
    let imperialObject = observationObject.imperial
    let celsius = ((imperialObject.temp - 32) * (5/9))
    let dewpoint = ((imperialObject.dewpt - 32) * (5/9))
    let heatindex = ((imperialObject.heatIndex - 32) * (5/9))
    let windChill = ((imperialObject.windChill - 32) * (5/9))

    connection.query(
        'INSERT INTO `measurement` (`station_id`, `neighbourhood`, `country`, `longitude`, `latitude`, `solar_radiation`, `uv_index`, `wind_direction`, `humidity`, `temperature`, `temperature_index`, `dewpoint`, `wind_chill`, `wind_speed`, `wind_gust`, `air_pressure`, `precipitation_rate`, `precipitation_total`, `elevation`, `measure_date`)' +
        ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [observationObject.stationID, observationObject.neighborhood, observationObject.country, observationObject.lon, observationObject.lat,
                observationObject.solarRadiation, observationObject.uv, observationObject.winddir, observationObject.humidity, Math.round((celsius + Number.EPSILON) * 100) / 100,
                Math.round((heatindex + Number.EPSILON) * 100) / 100, Math.round((dewpoint + Number.EPSILON) * 100) / 100, Math.round((windChill + Number.EPSILON) * 100) / 100, imperialObject.windSpeed, imperialObject.windGust,
                imperialObject.pressure, imperialObject.precipRate, imperialObject.precipTotal, imperialObject.elev, observationObject.obsTimeLocal],
        function(err, results) {
            console.log(results);
        }
    );
})
}

setInterval(gatherData, 5000)


