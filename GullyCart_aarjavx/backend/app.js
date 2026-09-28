require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { sendError } = require('./controllers/helpers');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'gullycart-api' });
});

app.use((error, _request, response, _next) => sendError(error, response));

module.exports = app;