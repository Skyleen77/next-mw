module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^next/server$': '<rootDir>/__mocks__/nextServerMock.js',
  },
};
