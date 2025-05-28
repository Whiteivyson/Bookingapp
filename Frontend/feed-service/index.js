// feed-service/index.js
const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const sequelize = new Sequelize(
  process.env.DB_NAME || 'creathr_feed',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false
  }
);

const Portfolio = sequelize.define('Portfolio', {
  id: { type: DataTypes.UUID, primaryKey: true },
  creatorId: DataTypes.UUID,
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  s3Url: DataTypes.STRING,
  fileType: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { timestamps: false });

app.get('/feed', async (req, res) => {
  const { page = 1, limit = 10, userId } = req.query;
  const offset = (page - 1) * limit;

  try {
    const feedItems = await Portfolio.findAll({
      order: [
        ['likes', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ page: parseInt(page), feed: feedItems });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feed.', details: err });
  }
});

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Feed service running on port ${PORT}`));
});
