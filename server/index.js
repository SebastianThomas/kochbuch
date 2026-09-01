const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config({ quiet: true });

const items = require('./routes/api/items');
const users = require('./routes/api/users');
const images = require('./routes/api/images');
const icons = require('./routes/api/icons');
const send = require('./routes/api/send');
const subscribe = require('./routes/api/subscribe');

const app = express();

app.use(express.json());
app.use(cors());

// DB Config
const db = process.env.MONGO_URI;

//Connect to DB
mongoose
  .connect(db)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

// Use routes
app.use('/api/items', items);
app.use('/api/users', users);
app.use('/api/images', images);
app.use('/api/icons', icons);

app.use('/api/send', send);
app.use('/api/subscribe', subscribe);

// Handle production
if (process.env.NODE_ENV === 'production') {
  const publicDir = path.join(__dirname, 'public');
  app.use(express.static(publicDir));

  // Handle Single Page Application (catch-all, after every other route/asset)
  app.use((req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
