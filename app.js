import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 5000;
const router = express.Router();

// app.get('/', async (req, res) => {
//   const { stationId } = req.query;
//   const { year } = req.query;
//   const { month } = req.query;
//   const { day } = req.query;
//   if (!stationId) {
//     return res.status(400).send({ error: 'stationId is required' });
//   }
//   if (!year) {
//     return res.status(400).send({ error: 'year is required' });
//   }
//   if (!month) {
//     return res.status(400).send({ error: 'month is required' });
//   }
//   if (!day) {
//     return res.status(400).send({ error: 'day is required' });
//   }

//   try {
//     const response = await fetch(`https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=${stationId}&Year=${year}Month=${month}&Day=${day}&timeframe=1&submit=%20Download+Data`);
//     if (!response.ok) {
//       throw new Error(`Error fetching data: ${response.statusText}`);
//     }

//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// });

const fetchHistoricalWeather = async (stationId, year, month, day) => {
  const url = `https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=${stationId}&Year=${year}&Month=${month}&Day=${day}&timeframe=1&submit=%20Download+Data`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching historical weather data: ${response.statusText}`);
  }
  const data = await response.text();
  return data; // parser csv
};

const getHistoricalWeather = async (req, res) => {
  const { stationId, year, month, day } = req.query;
  try {
    const data = await fetchHistoricalWeather(stationId, year, month, day);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch historical weather data' });
  }
};

router.get('/', getHistoricalWeather);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// app.get('/', (req, res) => {
//   res.send('Test')
// });

// npm start
// http://localhost:5000/