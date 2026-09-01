const express = require('express');
const router = express.Router();

const Subscription = require('../../models/Subscription');
const push = require('../../push/push');

router.post('/', async (req, res) => {
  if (!req.body.pushSub) {
    return res.status(400).json({ err: 'Push Subscription not sent' });
  }

  const parsedPushSub = JSON.parse(req.body.pushSub);
  await new Subscription(parsedPushSub).save();

  try {
    await push.sendPush(
      req.body.pushSub,
      'Sie bekommen jetzt Benachrichtigungen. ',
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});

module.exports = router;
