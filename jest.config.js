const config = {
  globalSetup: "./test/setup.ts",
  globalTeardown: "./test/teardown.ts",
  verbose: true,
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  preset: "ts-jest/presets/default-esm",
  rootDir: "src",
  transform: {},
}

export default config
