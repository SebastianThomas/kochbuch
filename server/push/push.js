const push = require('web-push');

const Subscription = require('../models/Subscription');
const pushKeys = require('../config/pushKeys');

const configured = Boolean(
  pushKeys.vapIDKeys.publicKey && pushKeys.vapIDKeys.privateKey,
);

if (configured) {
  push.setVapidDetails(
    process.env.PUSH_SUBJECT || 'mailto:kochbuch-push@sthomas.ch',
    pushKeys.vapIDKeys.publicKey,
    pushKeys.vapIDKeys.privateKey,
  );
} else {
  console.log('Push notifications disabled (PUSH_PUBLIC_KEY / PUSH_PRIVATE_KEY missing).');
}

// A subscription the browser no longer honors (expired/unsubscribed) fails
// with a 404/410 from the push service - drop it so we stop retrying it.
const sendOrForget = (sub, payload) =>
  push.sendNotification(sub, payload).catch(async (err) => {
    if (err.statusCode === 404 || err.statusCode === 410) {
      await Subscription.deleteOne({ endpoint: sub.endpoint });
      console.log('Successfully deleted subscription.');
    } else {
      console.log('Push failed:', err.message || err);
    }
  });

const broadcast = async (payload) => {
  if (!configured) return;
  const subs = await Subscription.find();
  return Promise.all(subs.map((sub) => sendOrForget(sub, payload)));
};

module.exports = {
  sendPush: (pushSub, payload) => {
    if (!configured) {
      return Promise.reject(new Error('Push notifications are not configured.'));
    }
    const parsedPushSub = JSON.parse(pushSub);
    return sendOrForget(parsedPushSub, payload);
  },
  sendPushForEach: (payload) => broadcast(payload),
  sendPushForEachToRecipe: (payload, recipeId) =>
    broadcast(`${payload}%%${recipeId}%%recipe`),
  sendPushForEachToUser: (payload, username) =>
    broadcast(`${payload}||${username}||user`),
  sendPushForEachToImage: (payload, filename) =>
    broadcast(`${payload}||${filename}||image`),
};
