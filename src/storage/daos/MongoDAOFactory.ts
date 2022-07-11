import * as MongoDB from "mongodb"

import { DAOFactory, QuickenDAO } from "../storage.types.js"
import MongoQuickenDAO from "./MongoQuickenDAO.js"

export default class MongoDAOFactory implements DAOFactory {
  dbConnection: MongoDB.MongoClient

  async createConnection(
    dbURI: string,
    dbName: string,
    mongoClientOptions: MongoDB.MongoClientOptions,
  ) {
    try {
      this.dbConnection = await MongoDB.MongoClient.connect(
        dbURI,
        mongoClientOptions,
      )
      this.dbConnection.db(dbName)
    } catch (error) {
      console.error(error)
    }
  }

  createQuickenDAO(): QuickenDAO {
    const mongoQuickenDAO = new MongoQuickenDAO()
    mongoQuickenDAO.injectDB(this.dbConnection)
    return mongoQuickenDAO
  }
}

// public static DRIVER = MongoDB.MongoClient
// public static URI = process.env.MONGO_URI
