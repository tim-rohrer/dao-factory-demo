import * as dotenv from "dotenv"
dotenv.config({ debug: true, path: "./.env" })

import setupStore from "./storage/setupDataStore.js"

const env = process.env.NODE_ENV || "development"
const isDevelopment = env === "development"

try {
  await setupStore(isDevelopment)
} catch (error) {
  console.error(error)
}
