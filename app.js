import express from 'express';

const app = express();
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Test')
});

// npm start
// http://localhost:5000/