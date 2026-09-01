const express = require('express');
const router = express.Router();

const push = require('../../push/push');

// Item Model
const Item = require('../../models/Item');

// @route   GET api/items
// @desc    Get All Items
// @access  Public
router.get('/', async (req, res) => {
  const items = await Item.find().sort({ date: 1 }); // Oldest at the top
  res.json(items);
});

// @route   GET api/items/:id
// @desc    Get one Item
// @access  Public
router.get('/:id', async (req, res) => {
  const item = await Item.findById(req.params.id);
  res.json(item);
});

// @route   POST api/items
// @desc    Create new Item
// @access  Public
router.post('/', async (req, res) => {
  const newItem = new Item({
    title: req.body.title,
    ingredients: req.body.ingredients,
    description: req.body.description,
    recipeType: req.body.recipeType,
    username: req.body.username,
    pictures: [],
  });

  const item = await newItem.save();
  console.log('Item added; sending push');
  push.sendPushForEachToRecipe(
    `Ein neues Rezept (id: ${item._id}) wurde von ${item.username} erstellt. `,
    item._id,
  );
  res.json(item);
});

// @route   Patch/Update one item
// @desc    Update an item
// @access  Public
router.patch('/:id', async (req, res) => {
  const oldItem = await Item.findById(req.params.id);

  if (req.body.username !== oldItem.username) {
    return res.status(405).json({ success: false, error: 'Not allowed' });
  }

  const updatedDoc = await Item.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      ingredients: req.body.ingredients,
      description: req.body.description,
      recipeType: req.body.recipeType,
      username: req.body.username,
      pictures: oldItem.pictures,
    },
    { new: true },
  );
  res.send(updatedDoc);
});

// @route   DELETE api/items/:id
// @desc    Delete item
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const oldItem = await Item.findById(req.params.id);
    if (req.body.username !== oldItem.username) {
      return res.status(405).json({ success: false, error: 'Not allowed' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(`ERROR: \n${err}\n`);
    res.status(500).json({ success: false, error: err });
  }
});

router.patch('/addimage/:id', async (req, res) => {
  if (!req.body.imageName) {
    return res
      .status(401)
      .json({ success: false, error: 'No imageName provided' });
  }

  console.log('Patching addimage/:id');
  const oldItem = await Item.findById(req.params.id);
  const pictures = (oldItem.pictures || []).concat(req.body.imageName);

  const updatedDoc = await Item.findByIdAndUpdate(
    req.params.id,
    { pictures },
    { new: true },
  );
  res.send(updatedDoc);
});

module.exports = router;
