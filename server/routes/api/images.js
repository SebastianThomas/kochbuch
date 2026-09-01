const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const path = require('path');

const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

const push = require('../../push/push');

// DB Config
const db = process.env.MONGO_URI;

//Connect to DB
mongoose.set('useUnifiedTopology', true);

const conn = mongoose.createConnection(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Init gfs
let gfs;

conn.once('open', () => {
  //Init gfs
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('images');
});

// Create storage engine
const storage = new GridFsStorage({
  url: db,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          reject(err);
        } else {
          const filename =
            buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename,
            bucketName: 'images',
          };
          resolve(fileInfo);
        }
      });
    });
  },
});
const upload = multer({ storage });

// @route   GET api/images
// @desc    Get All Images
// @access  Public
router.get('/', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: 'Error while Grid().files.find().toArray()' });
    } else {
      return res.status(200).send(files);
    }
  });
});

// @route   GET api/images/:id
// @desc    Get one Image
// @access  Public
router.get('/image/:id', (req, res) => {
  gfs.files.findOne({ _id: req.params.id }, (err, file) => {
    if (err)
      return res
        .status(500)
        .json({ error: 'Fehler in Grid().files.findOne()' });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    } else {
      // Check if file is image
      if (
        file.contentType.includes('image') ||
        file.contentType.includes('img')
      ) {
        const readstream = gfs.createReadStream(file.id);
        readstream.pipe(res);
      } else {
        return res.status(400).json({ error: 'File is not an image!' });
      }
    }
  });
});

// @route   GET api/images/image/name/:filename
// @desc    Get one Image
// @access  Public
router.get('/image/name/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (err)
      return res
        .status(500)
        .json({ error: 'Fehler in Grid().files.findOne()' });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    } else {
      // Check if file is image
      if (
        file.contentType.includes('image') ||
        file.contentType.includes('img')
      ) {
        const readstream = gfs.createReadStream(file._id);
        readstream.pipe(res);
      } else {
        return res.status(400).json({ error: 'File is not an image!' });
      }
    }
  });
});

router.post('/', upload.single('file'), (req, res) => {
  push.sendPushForEachToImage(
    `Ein neues Bild (Name: ${req.file.filename}) wurde hochgeladen. `,
    req.file.filename,
  );
  res.json({ file: req.file });
});

module.exports = router;
