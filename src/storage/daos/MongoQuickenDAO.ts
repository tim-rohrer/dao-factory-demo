import * as MongoDB from "mongodb"
import { Err, Ok } from "ts-results-es"

import { QuickenParsedResultDTO } from "../../quicken/quicken.types.js"
import { DAOActionResult, DatabaseDAO, QuickenDAO } from "../storage.types.js"

export default class MongoQuickenDAO implements QuickenDAO, DatabaseDAO {
  quicken: MongoDB.Collection<QuickenParsedResultDTO>

  injectDB(conn: MongoDB.MongoClient): void {
    if (this.quicken) return
    try {
      this.quicken = conn.db("test").collection("quicken")
    } catch (error) {
      console.error(
        `Unable to establish collection handles in MongoDB Quicken Import DAO: ${error}`,
      )
      throw error
    }
  }

  public async addImport(
    importFields: QuickenParsedResultDTO,
  ): DAOActionResult<Date, Error> {
    try {
      await this.quicken.insertOne(importFields, {
        writeConcern: { w: "majority" },
      })
      return Ok(importFields.createdTimestamp)
    } catch (error) {
      if (String(error).includes("E11000 duplicate key error")) {
        return Err(
          new Error(
            "This information cannot be duplicated in the database.",
          ),
        )
      }
      return Err(
        new Error(
          "Unknown error attempting to create database record.",
        ),
      )
    }
  }

  public async getImport(
    date: Date,
  ): DAOActionResult<QuickenParsedResultDTO | null, Error> {
    try {
      const quickenData = await this.quicken.findOne(
        {
          createdTimestamp: date,
        },
        {
          projection: { _id: 0 },
        },
      )
      return Ok(quickenData)
    } catch (error) {
      return Err(
        new Error(
          `Unknown error attempting to retrieve database record for ${date}`,
        ),
      )
    }
  }

  public async removeImport(
    date: Date,
  ): DAOActionResult<boolean, Error> {
    try {
      const removalResult = await this.quicken.deleteOne({
        createdTimestamp: date,
      })
      return Ok(removalResult.deletedCount === 0 ? false : true)
    } catch (error) {
      let errorMessage = "Unknown error"
      if (error instanceof Error) {
        errorMessage = error.message
      }
      return Err(
        new Error(
          `Problem with database operation: ${errorMessage}`,
        ),
      )
    }
  }
}
