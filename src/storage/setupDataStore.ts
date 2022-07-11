import * as MongoDB from "mongodb"

import MongoDAOFactory from "./daos/MongoDAOFactory.js"
import { QuickenDAO } from "./storage.types.js"

let quickenDAO: QuickenDAO

export default async function setupDataStore(isDevelopment: boolean) {
  let mongoClientOptions: MongoDB.MongoClientOptions

  if (!isDevelopment) {
    throw new Error("Not configured yet for production.")
  } else {
    mongoClientOptions = {
      authMechanism: "SCRAM-SHA-256",
      ssl: false,
      authSource: "admin",
    }
  }

  const dbURI = process.env.MIGW_DB_URI
  const dbName = process.env.MIGW_NS

  if (dbURI && dbName) {
    const mongoFactory = new MongoDAOFactory()
    await mongoFactory.createConnection(dbURI, dbName, mongoClientOptions)
    quickenDAO = mongoFactory.createQuickenDAO()
  } else {
    throw new Error(
      "Cannot start server. Missing data store configuration parameters.",
    )
  }
}

export { quickenDAO }
