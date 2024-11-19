import type {Config} from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    testPathIgnorePatterns: ['/node_modules/'],
    setupFiles: ['<rootDir>/jest.setup.ts'],
    moduleDirectories: ['node_modules', 'src'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
        '^@models/(.*)$': '<rootDir>/src/models/$1',
        '^@routes/(.*)$': '<rootDir>/src/routes/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
    },
    collectCoverage: true, // Enable coverage collection
    coverageDirectory: 'coverage', // Directory where Jest should output its coverage files
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}', // Specify the glob patterns Jest uses to detect test files
        '!src/**/*.d.ts', // Ignore TypeScript declaration files
    ],
};

export default config;