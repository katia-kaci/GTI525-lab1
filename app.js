import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import test from './station_mapping.json' assert { type: 'json' }; // a revoir

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(express.static('public'))

// Lire et parser le fichier station_mapping.json
const jsonFilePath = path.join(__dirname, 'station_mapping.json');
let stationMappingData;
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Erreur lors de la lecture du fichier station_mapping.json:', err);
    return;
  }
  try {
    stationMappingData = JSON.parse(data);
  } catch (parseErr) {
    console.error('Erreur lors du parsing du fichier station_mapping.json :', parseErr);
  }
});

// Fetch les deux APIs
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

async function fetchPrevisions(rss_feed) {
  const data = await fetch(rss_feed)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error fetching weather forecast data: ${response.statusText}`);
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

// Routes pour les données
app.get('/station_mapping', (req, res) => {
  //possible que ce soit pas la bonne facon de faire mais ca marche pour l'instant.
  // console.log(test);
  if (test) {
    res.json(test);
  } else {
    res.status(500).send('Les données du fichier station_mapping.json ne sont pas disponibles.');
  }
  // if (stationMappingData) {
  //   res.json(stationMappingData);
  // } else {
  //   res.status(500).send('Les données du fichier station_mapping.json ne sont pas disponibles.');
  // }
});

app.get('/api-history', async (req, res) => {
  const { stationId, year, month, day } = req.query;
  try {
    const data = await fetchHistoricalWeather(stationId, year, month, day);
    res.send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/api-previsions', async (req, res) => {
  const { rss_feed } = req.query;
  try {
    const data = await fetchPrevisions(rss_feed);
    res.send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});