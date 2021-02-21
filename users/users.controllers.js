const fs = require('fs');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const dotenv = require('dotenv');
const Avatar = require('avatar-builder');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');

const User = require('./User');

dotenv.config();
const PORT = process.env.port || 3000;

async function createUser(req, res) {
  try {
    const { body } = req;
    const hashedPassword = await bcrypt.hash(body.password, 14);

    const emailExists = await User.findOne({
      email: body.email,
    });
    if (emailExists) {
      return res.status(409).send({ message: 'Email in use' });
    }

    const avatarName = Date.now();
    Avatar.builder(
      Avatar.Image.roundedRectMask(
        Avatar.Image.compose(
          Avatar.Image.randomFillStyle(),
          Avatar.Image.shadow(Avatar.Image.margin(Avatar.Image.cat(), 8), {
            blur: 5,
            offsetX: 2.5,
            offsetY: -2.5,
            color: 'rgba(0,0,0,0.7)',
          }),
        ),
        28,
      ),
      128,
      128,
    )
      .create(body.email)
      .then(buffer => fs.writeFileSync(`tmp/${avatarName}.png`, buffer));

    await imagemin([`tmp/${avatarName}.png`], {
      destination: 'public/images',
      plugins: [
        imageminPngquant({
          quality: [0.6, 0.8],
        }),
      ],
    });

    const user = await User.create({
      ...body,
      avatarURL: `http://localhost:${PORT}/images/${avatarName}.png`,
      password: hashedPassword,
    });

    const { email, subscription, avatarURL } = user;
    res.status(201).json({
      user: {
        email: email,
        subscription: subscription,
        avatarURL: avatarURL,
      },
    });
  } catch (error) {
    res.status(400).send(error);
  }
}

function validateUser(req, res, next) {
  const validationRules = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    subscription: Joi.string().default('free'),
  });

  const validationResult = validationRules.validate(req.body);

  if (validationResult.error) {
    return res.status(400).send(validationResult.error.message);
  }

  next();
}

async function login(req, res) {
  const {
    body: { email, password },
  } = req;

  const user = await User.findOne({
    email,
  });
  if (!user) {
    return res.status(401).send('Email or password is wrong');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).send('Email or password is wrong');
  }

  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
  );

  await User.findByIdAndUpdate(user._id, { token: token });
  return res.status(200).json({
    token: token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
}

async function authorize(req, res, next) {
  const authorizationHeader = req.get('Authorization');
  if (!authorizationHeader) {
    return res.status(401).send({
      message: 'Not authorized',
    });
  }
  const token = authorizationHeader.replace('Bearer ', '');

  try {
    const payload = await jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = payload;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).send({
        message: 'Not authorized',
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).send(error);
  }
}

async function logout(req, res) {
  try {
    const { _id } = req.user;
    await User.findById(_id);
    await User.findByIdAndUpdate(_id, { token: '' });
    res.status(204).send('No content');
  } catch (error) {
    res.status(401).send({
      message: 'Not authorized',
    });
  }
}

async function getUser(req, res) {
  const { email, subscription } = req.user;
  res.json({
    email: email,
    subscription: subscription,
  });
}

function validateUserSubscription(req, res, next) {
  const validationRules = Joi.object({
    subscription: Joi.string().valid('free', 'pro', 'premium').required(),
  });

  const validationResult = validationRules.validate(req.body);

  if (validationResult.error) {
    return res.status(400).send(validationResult.error.message);
  }

  next();
}

async function updateUserSubscription(req, res) {
  try {
    const { _id } = req.user;
    const { subscription } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { subscription },
      {
        new: true,
      },
    );

    if (!updatedUser) res.status(400).send('User is not found');
    res.json({
      email: updatedUser.email,
      subscription: updatedUser.subscription,
    });
  } catch (error) {
    res.status(400).send(error);
  }
}

async function updateAvatar(req, res) {
  try {
    const { _id } = req.user;
    const { filename } = req.file;
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { avatarURL: `http://localhost:${PORT}/images/${filename}` },
      {
        new: true,
      },
    );

    if (!updatedUser) res.status(400).send('User is not found');
    res.json({
      avatarURL: updatedUser.avatarURL,
    });
  } catch (error) {
    res.status(400).send(error);
  }
}
module.exports = {
  createUser,
  validateUser,
  login,
  authorize,
  logout,
  getUser,
  validateUserSubscription,
  updateUserSubscription,
  updateAvatar,
};
