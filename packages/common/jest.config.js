/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    "**/src/**/*.spec.ts",
    "**/src/**/*.test.ts"
    ],
    moduleNameMapper: {
        "@patchworkdev/common/(.*)": "<rootDir>/src/$1"
    }
};

