import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import stationMapping from './station_mapping.json' assert { type: 'json' };
import { MongoClient } from 'mongodb'
import xml2js from 'xml2js';
import { parse } from 'csv-parse/sync';

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

const url = 'mongodb://127.0.0.1:27017/';
const client = new MongoClient(url);
const dbName = 'Labo3';

await client.connect();
console.log('Connected successfully to server');
let db = client.db(dbName);
await db.createCollection('stations');
client.close();

app.use(express.static('public'))
app.use(express.static('node_modules/leaflet/dist'))

// a enlever :
async function fetchHistoricalWeather(stationId, year, month, day) {
  const url = `https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=${stationId}&Year=${year}&Month=${month}&Day=${day}&timeframe=1&submit=%20Download+Data`;
  const data = await fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error fetching historical weather data: ${response.statusText}`);
      }
      return response.text();
    })
    .catch(error => console.error('Error:', error));
  return data;
}

// Routes pour les pages HTML :
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'vues/accueil.html'));
});
app.get('/info_journaliere', (req, res) => {
  res.sendFile(path.join(__dirname, 'vues/info_journaliere.html'));
});
app.get('/previsions_meteo', (req, res) => {
  res.sendFile(path.join(__dirname, 'vues/previsions_meteo.html'));
});
app.get('/carte', (req, res) => {
  res.sendFile(path.join(__dirname, 'vues/carte.html'));
});

// Routes pour les données
// a enlever :
app.get('/api/history', async (req, res) => {
  const { stationId, year, month, day } = req.query;
  try {
    const data = await fetchHistoricalWeather(stationId, year, month, day);
    res.send(data);
  } catch (error) {
    // alert("Une erreur est survenue.");
    res.status(500).send(error.message);
  }
});

app.get('/station_mapping', (req, res) => {
  if (stationMapping) {
    res.json(stationMapping);
  } else {
    res.status(500).send('Les données du fichier station_mapping.json ne sont pas disponibles.');
  }
});

app.get('/stations', async (req, res) => {
  try {
    await client.connect();
    console.log('Connected successfully to server');
    let db = client.db(dbName);
    let collection = db.collection('stations');
    let stations = await collection.find({}).toArray()
    client.close();
    res.json(stations);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/stationsInventories', async (req, res) => {
  try {
    await client.connect();
    console.log('Connected successfully to server');
    let db = client.db(dbName);
    let collection = db.collection('stationsInventories');
    let stations = await collection.find({}).toArray()
    client.close();
    res.json(stations);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// GET PRÉVISION D'UNE STATION : http://localhost:3000/previsions/ab-52
app.get('/previsions/:stationId', async (req, res) => {
  const { stationId } = req.params;
  try {
    const data = await fetchPrevisions(stationId);
    res.json(data);
  } catch (error) {
    alert("Une erreur est survenue.");
    res.status(500).send(error.message);
  }
});

async function fetchPrevisions(stationId) {
  const rss_feed = `https://meteo.gc.ca/rss/city/${stationId}_f.xml`;
  const response = await fetch(rss_feed);
  if (!response.ok) throw new Error(`Error fetching weather forecast data: ${response.statusText}`);

  const xml = await response.text();
  const json = await parseXML(xml)
  const formattedData = formatPrevisions(json);
  return formattedData;
}

function parseXML(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function formatPrevisions(json) {
  const feed = json.feed;
  const entries = feed.entry.map(entry => ({
    title: entry.title,
    updated: entry.updated,
    category: entry.category ? entry.category.$.term : null,
    summary: entry.summary._
  }));

  const relatedLink = feed.link.find(link => link.$.rel === 'related').$.href;

  return {
    title: feed.title,
    link: relatedLink,
    updated: feed.updated,
    entries: entries
  };
}

// GET PRÉVISION TOUTES LES STATIONS : http://localhost:3000/previsions
app.get('/previsions', async (req, res) => {
  try {
    const allData = await fetchAllPrevisions();
    res.json(allData);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const stationss = ['ab-52', 'ab-50', 'nl-16', 'nb-36', 'ns-19', 'on-77', 'on-137', 'qc-147', 'on-118', 'qc-133', 'sk-32', 'sk-40', 'nl-24', 'on-143', 'bc-74', 'bc-85', 'mb-38'];
async function fetchAllPrevisions() {
  const promises = stationss.map(stationId => fetchPrevisions(stationId));
  const results = await Promise.all(promises);
  return results;
}

// GET HISTORIQUE D'UNE STATION : http://localhost:3000/history?stationId=1865&year=2000&month=10&day=10
app.get('/history', async (req, res) => {
  const { stationId, year, month, day } = req.query;
  try {
    const data = await fetchHistoricalWeather2(stationId, year, month, day);
    res.json(data);
  } catch (error) {
    alert("Une erreur est survenue.");
    res.status(500).send(error.message);
  }
});

async function fetchHistoricalWeather2(stationId, year, month, day) {
  const url = `https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=${stationId}&Year=${year}&Month=${month}&Day=${day}&timeframe=1&submit=%20Download+Data`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching historical weather data: ${response.statusText}`);
  }
  const csv = await response.text();
  const records = parse(csv, { columns: true, skip_empty_lines: true });
  const formattedData = formatHistoricalData(records);
  return formattedData;
}

function formatHistoricalData(records) {
  const stationName = records[0]["Station Name"];
  const climateID = records[0]["Climate ID"];

  const data = records.map(record => ({
    dateTime: record["Date/Time (LST)"],
    temperatureCelsius: parseFloat(record["Temp (°C)"]),
    dewPointTempCelsius: parseFloat(record["Dew Point Temp (°C)"]),
    relativeHumidityPercent: parseFloat(record["Rel Hum (%)"]),
    windDirectionDegrees: parseFloat(record["Wind Dir (10s deg)"]),
    windSpeedKmh: parseFloat(record["Wind Spd (km/h)"]),
    visibilityKm: parseFloat(record["Visibility (km)"]),
    stationPressureKpa: parseFloat(record["Stn Press (kPa)"]),
    windChill: parseFloat(record["Wind Chill"]),
    weather: record["Weather"]
  }));

  return {
    stationName,
    climateID,
    data
  };
}


app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});