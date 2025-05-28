// location-service/index.js
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
app.use(express.json());

const sequelize = new Sequelize(
  process.env.DB_NAME || 'creathr_location',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false
  }
);

const Creator = sequelize.define('Creator', {
  name: { type: DataTypes.STRING, allowNull: false },
  location: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: false
  }
});

app.post('/creators', async (req, res) => {
  const { name, latitude, longitude } = req.body;
  const location = { type: 'Point', coordinates: [longitude, latitude] };
  try {
    const creator = await Creator.create({ name, location });
    res.status(201).json(creator);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create creator.', details: err });
  }
});

app.post('/search', async (req, res) => {
  const { latitude, longitude, radius = 5000 } = req.body; // radius in meters
  try {
    const creators = await sequelize.query(
      `SELECT *, ST_Distance(location, ST_MakePoint(:lng, :lat)::geography) AS distance
       FROM "Creators"
       WHERE ST_DWithin(location::geography, ST_MakePoint(:lng, :lat)::geography, :radius)
       ORDER BY distance ASC`,
      {
        model: Creator,
        mapToModel: true,
        replacements: { lat: latitude, lng: longitude, radius }
      }
    );
    res.json(creators);
  } catch (err) {
    res.status(500).json({ error: 'Search failed.', details: err });
  }
});

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Location service running on port ${PORT}`));
});
