const crypto = require('crypto');
const path = require('path');

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const multer = require('multer');

const BUCKET_NAME = 'icons';
const bucket = () =>
  new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: BUCKET_NAME,
  });

const upload = multer({ storage: multer.memoryStorage() });

const streamToBucket = (file) =>
  new Promise((resolve, reject) => {
    const filename = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
    const uploadStream = bucket().openUploadStream(filename, {
      contentType: file.mimetype,
    });
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => resolve({ filename }));
    uploadStream.end(file.buffer);
  });

// @route   GET api/icons
// @desc    Get All Images
// @access  Public
router.get('/', async (req, res) => {
  const files = await bucket().find().toArray();
  res.status(200).send(files);
});

// @route   GET api/icons/icon/:id
// @desc    Get one Image
// @access  Public
router.get('/icon/:id', async (req, res) => {
  console.log(req.params.id);
  let objectId;
  try {
    objectId = new mongoose.Types.ObjectId(req.params.id);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const [file] = await bucket().find({ _id: objectId }).toArray();
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  if (!(file.contentType || '').includes('png')) {
    return res.status(400).json({ error: 'File is not an image!' });
  }

  res.set('Content-Type', file.contentType);
  bucket()
    .openDownloadStream(objectId)
    .on('error', () => res.status(500).end())
    .pipe(res);
});

// @route   GET api/icons/icon/name/:filename
// @desc    Get one Image
// @access  Public
router.get('/icon/name/:filename', async (req, res) => {
  console.log(req.params.filename);
  const [file] = await bucket().find({ filename: req.params.filename }).toArray();
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  if (!(file.contentType || '').includes('png')) {
    return res.status(400).json({ error: 'File is not an image!' });
  }

  res.set('Content-Type', file.contentType);
  bucket()
    .openDownloadStreamByName(req.params.filename)
    .on('error', () => res.status(500).end())
    .pipe(res);
});

router.post('/', upload.single('file'), async (req, res) => {
  const file = await streamToBucket(req.file);
  console.log('Posted');
  res.json({ file });
});

module.exports = router;
