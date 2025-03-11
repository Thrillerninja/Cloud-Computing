module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest', // Use babel-jest to transform JavaScript files
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(is-ip|ip-regex|other-dependency)/)" // Transform the 'is-ip' module and its dependencies
  ],
};
