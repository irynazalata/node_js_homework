const path = require('path');
const { Router } = require('express');
const multer = require('multer');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const userControllers = require('./users.controllers');

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp');
  },
  filename: function (req, file, cb) {
    const { ext } = path.parse(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

async function minifyAvatar(req, res, next) {
  const files = await imagemin(
    [`${req.file.destination}/${req.file.filename}`],
    {
      destination: 'public/images',
      plugins: [
        imageminJpegtran(),
        imageminPngquant({
          quality: [0.6, 0.8],
        }),
      ],
    },
  );
  next();
}

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
router.patch(
  '/users/avatars',
  userControllers.authorize,
  upload.single('avatar'),
  minifyAvatar,
  userControllers.updateAvatar,
);

module.exports = router;
