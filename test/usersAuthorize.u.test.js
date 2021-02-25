const dotenv = require('dotenv');
const { authorize } = require('../users/users.controllers');
const User = require('../users/User');

describe('Should test authorize middleware', () => {
  let responseMock;
  let nextMock;

  beforeAll(() => {
    dotenv.config();
    jest.mock('../users/User');
    const response = {
      test: 'data',
    };
    User.findById = jest.fn(() => Promise.resolve(response));
  });

  beforeEach(() => {
    responseMock = {
      status: jest.fn(() => {
        return {
          send: jest.fn(),
        };
      }),
    };
    nextMock = jest.fn();
  });

  it('check the number of calls and arguments when no token', async function () {
    const requestMock = {
      get: jest.fn(),
    };

    authorize(requestMock, responseMock, nextMock);
    expect(responseMock.status.mock.calls.length).toBe(1);
    expect(responseMock.status.mock.calls[0][0]).toBe(401);

    const sendMock = responseMock.status.mock.results[0].value.send;
    expect(sendMock.mock.calls.length).toBe(1);
    expect(sendMock.mock.calls[0][0].message).toBe('Not authorized');
  });
  it('check the number of calls and arguments when token is not valid', function () {
    const requestMock = {
      get: jest.fn(() => '4hf6ewljdft48iodfklsjg'),
    };
    process.env.JWT_SECRET = 'test-secret';

    authorize(requestMock, responseMock, nextMock);

    expect(responseMock.status.mock.calls.length).toBe(1);
    expect(responseMock.status.mock.calls[0][0]).toBe(401);

    const sendMock = responseMock.status.mock.results[0].value.send;

    expect(sendMock.mock.calls.length).toBe(1);
    expect(sendMock.mock.calls[0][0].message).toBe('jwt malformed');
  });
  it('check the number of calls and arguments when token is valid', async () => {
    const requestMock = {
      get: jest.fn(
        () =>
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDJmZjhkYWU3YThjODExNDQ1NTI5OTciLCJpYXQiOjE2MTQyOTY0NDN9.W64iZhe4S3LdP16JTgNVE87yS6EhwQT3_u3H5Za1uSE',
      ),
    };

    await authorize(requestMock, responseMock, nextMock);
    expect(nextMock.mock.calls.length).toBe(1);
  });
});
