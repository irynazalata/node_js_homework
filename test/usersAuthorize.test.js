const { authorize } = require('../users/users.controllers');
const User = {
  userId: '123',
  subscription: 'free',
  email: 'anna16@gmail.com',
  password: '$2a$14$4Wo.NWBTwGrSgvYcf3sU2.apO9FoJAy0KaFWxOBMQOokxZiNoaRH6',
  avatarURL: 'http://localhost:3000/images/1613762383576.jpg',
  token: '12345678',
  findById(id) {
    if (this.userId === id) {
      return this;
    }
  },
};

describe('Unit testing user authorization', function () {
  let req, res, next, jwt, payload, Authorization;
  beforeEach(() => {
    req = { Authorization };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(data => data),
    };
    next = jest.fn();
    req.get = jest.fn();
    token = 1;
    jwt = {};
    jwt.verify = jest.fn();
    payload = { userId: '123' };
  });

  it('check the number of calls and arguments when no token', async function () {
    const result = await authorize(req, res, next);
    const authorizationHeader = req.Authorization;
    expect(authorizationHeader).toBeUndefined();
    expect(result).toHaveProperty('message', 'Not authorized');
    expect(next).toHaveBeenCalledTimes(0);
  });
  it('check the number of calls and arguments when token is not valid', async function () {
    const result = await authorize(req, res, next);
    const authorizationHeader = 'Bearer 11111111';
    const token = authorizationHeader.replace('Bearer ', '');
    const { userId } = payload;
    const user = User.findById(userId);
    expect(token).not.toEqual(User.token);
    expect(!user).toBeFalsy();
    expect(result).toHaveProperty('message', 'Not authorized');
    expect(next).toHaveBeenCalledTimes(0);
  });
  it('check the number of calls and arguments when token is not valid', async function () {
    const result = await authorize(req, res, next);
    const authorizationHeader = 'Bearer 12345678';
    const token = authorizationHeader.replace('Bearer ', '');
    const { userId } = payload;
    const user = User.findById(userId);
    expect(user).toBeTruthy();
    expect(token).toBe(User.token);
    expect(next).toHaveBeenCalledTimes(0);
  });
});
