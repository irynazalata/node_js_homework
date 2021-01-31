const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const contactsRoutes = require('./routes/contacts.routes');

const PORT = process.env.port || 3000;

class Server {
  start() {
    this.server = express();
    this.initMiddlewares();
    this.initRoutes();
    this.listen();
  }
  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(cors({ origin: '*' }));
    this.server.use(logger('dev'));
  }
  initRoutes() {
    this.server.use('/api/contacts', contactsRoutes);
  }
  listen() {
    this.server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  }
}

const server = new Server();
server.start();
