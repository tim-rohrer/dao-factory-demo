import * as MongoDB from "mongodb"

import { jest } from "@jest/globals"

import { QuickenParsedResultDTO } from "../../quicken/quicken.types.js"
import MongoQuickenDAO from "./MongoQuickenDAO.js"

const mongoQuickenDAO = new MongoQuickenDAO()
let connection: MongoDB.MongoClient

async function setupDatabaseDAO() {
  try {
    const uri = process.env.MONGO_URI
    if (uri === undefined) throw new Error("Test failed to setup")
    connection = await MongoDB.MongoClient.connect(uri)
    connection.db("test").collection("quicken")
    mongoQuickenDAO.injectDB(connection)
  } catch (error) {
    let errorMessage = "Unknown error"
    if (error instanceof Error) {
      errorMessage = error.message
    }
    throw new Error(errorMessage)
  }
}

async function deleteDatabaseData() {
  await connection.db("test").collection("quicken").deleteMany({})
}

beforeAll(async () => {
  await setupDatabaseDAO()
})
afterAll(async () => {
  await connection.close()
})
beforeEach(async () => {
  await deleteDatabaseData()
})
afterEach(async () => {
  jest.resetAllMocks()
})

test("addImport returns a date", async () => {
  const timeStamp = new Date()
  const importFields = {
    createdTimestamp: timeStamp,
    data: "test",
  } as unknown as QuickenParsedResultDTO

  const result = await mongoQuickenDAO.addImport(importFields)

  expect(result.val).toEqual(timeStamp)
})

test("getImport returns data", async () => {
  const timeStamp = new Date()
  const importFields = {
    createdTimestamp: timeStamp,
    data: "test",
  } as unknown as QuickenParsedResultDTO
  await mongoQuickenDAO.addImport(importFields)

  const result = await mongoQuickenDAO.getImport(timeStamp)

  expect(result.ok).toBe(true)
  expect(result.val).toEqual({
    createdTimestamp: timeStamp,
    data: "test",
  })
})

test("getImport returns null if timeStamp not found", async () => {
  const timeStamp = new Date()
  const ts2 = new Date("2021-09-01")
  const importFields = {
    createdTimestamp: timeStamp,
    data: "test",
  } as unknown as QuickenParsedResultDTO
  await mongoQuickenDAO.addImport(importFields)

  const result = await mongoQuickenDAO.getImport(ts2)

  expect(result.val).toBe(null)
})

test("removeImport success returns true", async () => {
  const timeStamp = new Date()
  const importFields = {
    createdTimestamp: timeStamp,
    data: "test",
  } as unknown as QuickenParsedResultDTO
  await mongoQuickenDAO.addImport(importFields)

  const result = await mongoQuickenDAO.removeImport(timeStamp)

  expect(result.ok).toBe(true)
  expect(result.val).toBe(true)
  expect((await mongoQuickenDAO.quicken.find().toArray()).length).toBe(0)
})

test("removeImport not found returns false", async () => {
  const timeStamp = new Date()
  const importFields = {
    createdTimestamp: timeStamp,
    data: "test",
  } as unknown as QuickenParsedResultDTO
  await mongoQuickenDAO.addImport(importFields)

  const result = await mongoQuickenDAO.removeImport(new Date("2021-09-11"))

  expect(result.ok).toBe(true)
  expect(result.val).toBe(false)
  expect((await mongoQuickenDAO.quicken.find().toArray()).length).toBe(1)
})
