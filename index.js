
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// Store shortened URLs in memory
const urls = [];
let nextId = 1;

// Create a short URL
app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url;

  if (typeof originalUrl !== 'string') {
    return res.json({ error: 'invalid url' });
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(originalUrl);
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }

  if (
    !['http:', 'https:'].includes(parsedUrl.protocol) ||
    !parsedUrl.hostname ||
    (!parsedUrl.hostname.includes('.') &&
      parsedUrl.hostname !== 'localhost')
  ) {
    return res.json({ error: 'invalid url' });
  }

  const shortUrl = nextId++;

  urls.push({
    original_url: originalUrl,
    short_url: shortUrl
  });

  return res.json({
    original_url: originalUrl,
    short_url: shortUrl
  });
});

// Redirect to the original URL
app.get('/api/shorturl/:short_url', function (req, res) {
  const id = Number(req.params.short_url);

  const foundUrl = urls.find(function (item) {
    return item.short_url === id;
  });

  if (!foundUrl) {
    return res.status(404).json({ error: 'URL not found' });
  }

  return res.redirect(foundUrl.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
