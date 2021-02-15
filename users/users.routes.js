const { Router } = require('express');
const userControllers = require('./users.controllers');

const router = Router();

router.post(
  '/auth/register',
  userControllers.validateUser,
  userControllers.createUser,
);
router.post('/auth/login', userControllers.validateUser, userControllers.login);
router.post('/auth/logout', userControllers.authorize, userControllers.logout);
router.get(
  '/users/current',
  userControllers.authorize,
  userControllers.getUser,
);
router.patch(
  '/users/current',
  userControllers.authorize,
  userControllers.validateUserSubscription,
  userControllers.updateUserSubscription,
);

module.exports = router;
