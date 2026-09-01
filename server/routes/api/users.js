const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const push = require('../../push/push');

// User Model
const User = require('../../models/User');

const hashPassword = (password) => bcrypt.hash(password, 10);

// Replace `oldUser`'s mutable fields with `patch`, save, and respond. Keeps
// the "username must not change" guard the old callback code had.
const applyUserPatch = async (res, oldUser, patch) => {
  if (patch.username !== oldUser.username) {
    return res
      .status(405)
      .json({ success: false, error: 'The username has changed..?' });
  }

  const updatedDoc = await User.findByIdAndUpdate(oldUser._id, patch, {
    new: true,
  });
  return res.status(200).json(updatedDoc);
};

// @route   GET api/users
// @desc    Get All Users
// @access  Public
router.get('/', async (req, res) => {
  const users = await User.find().sort({ date: 1 }); // Oldest at the top
  res.json(users);
});

// @route   GET api/users/:id
// @desc    Get one User
// @access  Public
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

// @route   POST api/users/login
// @desc    Check username/password and return the user
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log(`Login try for ${username}`);

    const user = await User.findOne({ username });
    const match = user && (await bcrypt.compare(password, user.password));

    if (!match) {
      console.log(`Login try for ${username} failed`);
      return res.status(401).json({ message: 'No user found' });
    }

    console.log(`Login try for ${username} successfull`);
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// @route   POST api/users
// @desc    Create new User
// @access  Public
router.post(
  '/',
  body('username').notEmpty().withMessage('Username is required!'),
  body('password1').notEmpty().withMessage('Password1 is required!'),
  body('password2').custom((value, { req }) => value === req.body.password1)
    .withMessage('Passwords do not match!'),
  async (req, res) => {
    const { username, password1, password2, description, favorites } =
      req.body;

    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length) {
      console.log(errors);
      return res.status(400).json({ success: false, errors });
    }

    const exists = await User.exists({ username });
    if (exists) {
      return res.status(400).json({
        success: false,
        errors: `There is already a user with the username ${username}; please try an other one!`,
      });
    }

    try {
      const newUser = new User({
        username,
        password: await hashPassword(password1),
        description,
        favorites,
      });

      const user = await newUser.save();
      push.sendPushForEachToUser(
        `Der Benutzer ${user.username} hat sich registriert! Herzlich Willkommen!`,
        user.username,
      );
      return res.status(201).json(user);
    } catch (err) {
      return res.status(500).json({ success: false, errors: err });
    }
  },
);

router.patch('/:id', async (req, res) => {
  if (req.body.password1 !== req.body.password2) {
    return res
      .status(405)
      .json({ success: false, err: 'The two passwords do not match!' });
  }

  const oldUser = await User.findById(req.params.id);
  await applyUserPatch(res, oldUser, {
    username: oldUser.username,
    password: await hashPassword(req.body.password1),
    description: req.body.description,
    favorites: oldUser.favorites,
  });
});

router.patch('/:id/password', async (req, res) => {
  if (req.body.password1 !== req.body.password2) {
    return res
      .status(405)
      .json({ success: false, err: 'The two passwords do not match!' });
  }

  const oldUser = await User.findById(req.params.id);
  await applyUserPatch(res, oldUser, {
    username: oldUser.username,
    password: await hashPassword(req.body.password1),
    description: oldUser.description,
    favorites: oldUser.favorites,
  });
});

router.patch('/:id/description', async (req, res) => {
  const oldUser = await User.findById(req.params.id);
  await applyUserPatch(res, oldUser, {
    username: oldUser.username,
    password: oldUser.password,
    description: req.body.description,
    favorites: oldUser.favorites,
  });
});

router.patch('/favorite/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const recipeId = req.body.recipeId.toString();

    if (user.favorites.includes(recipeId)) {
      return res.status(400).json({
        success: false,
        err: `${recipeId} is already a favourite!`,
      });
    }

    const favorites = user.favorites
      .concat(recipeId)
      .filter((el) => el !== '');

    const updatedDoc = await User.findByIdAndUpdate(
      user._id,
      { favorites },
      { new: true },
    );
    return res.status(200).json({ success: true, user: updatedDoc });
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
});

router.patch('/removeFavorite/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const recipeId = req.body.recipeId.toString();

    if (!user.favorites.includes(recipeId)) {
      console.log(
        `${req.params.id}'s favorites do not include ${recipeId}`,
      );
      return res.status(400).json({
        success: false,
        err: `${recipeId} is not a favorite!`,
      });
    }

    const favorites = user.favorites.filter(
      (el) => el !== recipeId && el !== '',
    );

    const updatedDoc = await User.findByIdAndUpdate(
      user._id,
      { favorites },
      { new: true },
    );
    return res.status(200).json({ success: true, user: updatedDoc });
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
});

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(`ERROR: \n${err}\n`);
    res.json({ success: false });
  }
});

module.exports = router;
