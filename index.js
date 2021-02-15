// Init express server
// Connect middlewares
// Declare routes
// Connect to db
// Listen on port

const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const contactsRoutes = require('./contacts/contacts.routes');
const usersRoutes = require('./users/users.routes');

dotenv.config();
const PORT = process.env.port || 3000;

function start() {
  const app = initServer();
  connectMiddlewares(app);
  declareRoutes(app);
  connectToDb();
  listen(app);
}

function initServer() {
  return express();
}

function connectMiddlewares(app) {
  app.use(express.json());
  app.use(cors({ origin: '*' }));
  app.use(logger('dev'));
}

function declareRoutes(app) {
  app.use('/api/contacts', contactsRoutes);
  app.use('', usersRoutes);
}

async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database connection successful');
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
}

function listen(app) {
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

start();
