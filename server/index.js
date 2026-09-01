const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const passport = require('passport');
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
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

// Passport Config
require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use('/api/items', items);
app.use('/api/users', users);
app.use('/api/images', images);
app.use('/api/icons', icons);

app.use('/api/send', send);
app.use('/api/subscribe', subscribe);

// Handle production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(__dirname + '/public/'));

  // Handle Single Page Application
  app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
