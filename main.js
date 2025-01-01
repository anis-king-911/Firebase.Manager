// import useFetch from "./utils/useFetch.js";

// import FirebaseDatabase from "./firebaseApi.js";
// import { FirebaseManager } from "./firebaseApi.js";
import FirebaseManager from "./FirebaseManager/index.js";
import { FirebaseConfig } from "./FirebaseManager/firebaseConfig.js";

const { FirebaseDatabase } = new FirebaseManager();
const db = new FirebaseDatabase(FirebaseConfig, "FirebaseApi");

/* use this to insert data */
/* https://dummyjson.com/ */

/* info source */
/* https://github.com/bajankristof/nedb-promises/blob/master/src/Datastore.js */
/* https://npmtrends.com/dexie-vs-diskdb-vs-lokijs-vs-lowdb-vs-nedb-vs-nedb-promise-vs-node-json-db-vs-pouchdb-vs-tingodb-vs-warehouse */
/* https://github.com/dexie/Dexie.js */
/* https://dexie.org/docs/Tutorial/Getting-started */
/*  */
/*  */

const inp = document.querySelector("input");
const btn = document.querySelector("button");

btn.addEventListener("click", async event => {
  // const api = "https://dummyjson.com/todos?limit=3&skip=3";
  // const data = await useFetch(api);
  // 
  // const response = await db.insertMulti(data.todos);
  // console.log(response);

  const data = await db.loadAll();
  console.log(data);
});