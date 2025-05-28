// portfolio-service/index.js
const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Configure Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'creathr_portfolios',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false
  }
);

// Define Portfolio model
const Portfolio = sequelize.define('Portfolio', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  s3Url: DataTypes.STRING,
  fileType: DataTypes.STRING
});

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json());

// GET all portfolios
app.get('/portfolios', async (req, res) => {
  const portfolios = await Portfolio.findAll();
  res.json(portfolios);
});

// GET one portfolio by ID
app.get('/portfolios/:id', async (req, res) => {
  const portfolio = await Portfolio.findByPk(req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });
  res.json(portfolio);
});

// POST upload portfolio item
app.post('/portfolios', upload.single('file'), async (req, res) => {
  const { title, description, creatorId } = req.body;
  const file = req.file;
  const key = `portfolios/${uuidv4()}-${file.originalname}`;

  try {
    const uploadResult = await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    }).promise();

    const portfolio = await Portfolio.create({
      creatorId,
      title,
      description,
      s3Url: uploadResult.Location,
      fileType: file.mimetype
    });

    res.status(201).json({ message: 'Uploaded successfully.', portfolio });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed.', details: err });
  }
});

// DELETE a portfolio by ID
app.delete('/portfolios/:id', async (req, res) => {
  const portfolio = await Portfolio.findByPk(req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  const key = portfolio.s3Url.split('/').slice(-2).join('/');
  await s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET, Key: key }).promise();
  await portfolio.destroy();

  res.json({ message: 'Portfolio deleted successfully.' });
});

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Portfolio service running on port ${PORT}`));
});
