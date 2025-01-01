import { initializeApp } from "firebase-app";
import { getDatabase, ref, child, push, set, get, remove, update } from "firebase-database";

import GenerateUUID from "../utils/useGenerators.js";
import usePagination from "../utils/usePagination.js";
const { keys: getKeys, values: getValues, entries: getEntries } = Object;

class DataFormatting {
  constructor(params) {
    return getEntries(params || {})
      .map(([key, value]) => (
        { key, ...value }
      ))
  }
}

export class FirebaseDatabase {
  constructor(FirebaseConfig, DatabaseReference = "", DefaultDataOptions = {}) {
    if (typeof FirebaseConfig !== "object") {
      throw new Error("FirebaseConfig must be an object.");
    }
    if (typeof DatabaseReference !== "string") {
      throw new Error("DatabaseReference must be a string.");
    }

    const firebaseApp = initializeApp(FirebaseConfig);
    const database = getDatabase(firebaseApp);

    this.dbRef = ref(database, DatabaseReference);

    this.DefaultDataOptions = {
      identifierWord: DefaultDataOptions.identifierWord || "_id",
      identifierMethod: DefaultDataOptions.identifierMethod || "crypto uuid",
    };

    this.DEFAULT_PAGINATION = {
      limit: 10, page: 1,
    };

    // DefaultDataOptions = {
    //   identifierWord: "_id" || "_key",
    //   identifierMethod: "self push" || "crypto uuid",
    // }
    // 
    // this.DEFAULT_PAGINATION = {
    //   limit: 10, page: 1
    // }
  }

  async getReference(key) {
    try {
      if (typeof key !== "string") throw new Error("Key must be a string.");
      const loadOne = await this.loadOne(key);

      if (!loadOne) throw new Error(`No data found for key: ${key}`);
      const dbKey = loadOne.key;
      const dbChild = child(this.dbRef, dbKey);

      return dbChild;
    } catch (error) {

      console.log(error);
      console.error("Error in getReference:", error.message);
      throw error;
    }
  }
  async getIdentifier(word, method) {
    try {
      const dbPush = await push(this.dbRef);
      const dbUuid = GenerateUUID();

      const Word = ["_key", "_id"].includes(word) ? word : "_id";
      const Method = method === "self push"
        ? dbPush.key
        : method === "crypto uuid"
        ? dbUuid : dbUuid;

      return { Word, Method };
    } catch (error) {

      console.log(error);
      console.error("Error in `getIdentifier`:", error.message);
      throw error;
    }
  }
  async generateIdentifier(method) {
    return
  }

  /* CRUD Operations */

  /* -------------------------------------------------------------- */
  async load(DEFAULT_PAGINATION = this.DEFAULT_PAGINATION) {
    try {
      const { limit, page } = DEFAULT_PAGINATION;

      if (typeof limit !== "number" || typeof page !== "number") {
        throw new Error("Pagination parameters must be numbers.");
      }

      const dbGet = await get(this.dbRef);
      const dbVal = await dbGet.val();

      const dbList = new DataFormatting(dbVal) || [];
      return usePagination(dbList, page, limit);
    } catch (error) {

      console.log(error);
      console.error("Error in `load`:", error.message);
      throw error;
    }
  }
  /* -------------------------------------------------------------- */
  async loadAll() {
    try {
      const dbGet = await get(this.dbRef);
      const dbVal = await dbGet.val();

      return new DataFormatting(dbVal) || [];
    } catch (error) {

      console.log(error);
      console.error("Error in `loadAll`:", error.message);
      throw error;
    }
  }
  /* -------------------------------------------------------------- */
  /* will be replaced with `find` */
  // async loadOne(key) { // this will be defined as "find"
  //   try {
  //     if (typeof key !== "string") throw new Error("Key must be a string.");
  //     
  //     const dbChild = child(this.dbRef, key);
  //     const dbGet = await get(dbChild);
  //     
  //     return (await dbGet.val()) || null;
  //   } catch (error) {
  //     
  //     console.log(error);
  //     console.error("Error in loadOne:", error.message);
  //     throw error;
  //   }
  //   
  //   const dbChild = child(this.dbRef, key);
  //   const dbGet = await get(dbChild);
  //   const dbVal = await dbGet.val();
  //   
  //   return dbVal || [];
  // }
  /* -------------------------------------------------------------- */
  async insertOne(object) {
    try {
      if (typeof object !== "object" || object === null) {
        throw new Error("`InsertOne` requires a non-null object.");
      }

      const { Word, Method } = await this.getIdentifier(
        this.DefaultDataOptions.identifierWord,
        this.DefaultDataOptions.identifierMethod
      );

      const dbKey = child(this.dbRef, Method);
      const data = { [Word]: Method, ...object };
      await set(dbKey, data);

      return { [Word]: Method, ...data };
    } catch (error) {

      console.log(error);
      console.error("Error in `insertOne`:", error.message);
      throw error;
    }
  }
  /* -------------------------------------------------------------- */
  async insertMulti(array) {
    try {
      if (!Array.isArray(array)) {
        throw new Error("`InsertMulti` requires an array of objects.");
      }

      const results = [];
      for (const object of array) {
        results.push(await this.insertOne(object));
      }

      return results;
    } catch (error) {

      console.log(error);
      console.error("Error in `insertMulti`:", error.message);
      throw error;
    }
  }
  /* -------------------------------------------------------------- */
  async removeOne(key) {
    try {
      // if (typeof key !== "string") throw new Error("Key must be a string.");

      const dbChild = await this.getReference(key);
      await remove(dbChild);

      return { success: true, key };
    } catch (error) {

      console.log(error);
      console.error("Error in `removeOne`:", error.message);
      throw error;
    }
  }
  /* -------------------------------------------------------------- */
  async removeMulti(keys) {
    try {
      if (!Array.isArray(keys)) throw new Error("Keys must be an array.");

      const results = [];
      for (const key of keys) {
        // if (typeof key !== "string") throw new Error("Key must be a string.");
        results.push(await this.removeOne(key));
      }

      return results;
    } catch (error) {

      console.log(error);
      console.error("Error in `removeMulti`:", error.message);
      throw error;
    }
  }
  /* -------------------------------------------------------------- */
  async updateOne(key, newObject) {
    try {
      if (typeof key !== "string") throw new Error("Key must be a string.");
      if (typeof newObject !== "object" || newObject === null) {
        throw new Error("`UpdateOne` requires a non-null object.");
      }

      const dbChild = await this.getReference(key);
      await update(dbChild, newObject);
      
      return { success: true, key, updated: newObject };
    } catch (error) {

      console.log(error);
      console.error("Error in `updateOne`:", error.message);
      throw error;
    }
  }
  /* -------------------------------------------------------------- */
  async updateMulti(keys, newObjects) {
    try {
      if (!Array.isArray(keys) || !Array.isArray(newObjects)) {
        throw new Error("Keys and newObjects must be arrays.");
      }
      if (keys.length !== newObjects.length) {
        throw new Error("Keys and newObjects arrays must have the same length.");
      }

      const results = [];
      for (let i = 0; i < keys.length; i++) {
        results.push(await this.updateOne(keys[i], newObjects[i]));
      }

      return results;
    } catch (error) {

      console.log(error);
      console.error("Error in `updateMulti`:", error.message);
      throw error;
    }
  }
  /* -------------------------------------------------------------- */
}

export default FirebaseDatabase;