import {
  getDatabase,
  ref,
  get,
  push,
  set,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";
import { init } from "../app.js";
import { log } from "../utils/logger.js";

const Refs = {
  Posts: "posts",
};

async function getDb() {
  return (await init()).db;
}

const update = (path, payload, db = database) => set(ref(db, path), payload);

async function getPostsRef() {
  return ref(await getDb(), Refs.Posts);
}

async function create(body) {
  return new Promise(async (resolve, reject) => {
    set(push(await getPostsRef()), { ...body, createdAt: Date.now() });
    resolve();
  });
}
function remove() {}
function getById(id) {}
function getAll() {
  return new Promise(async (resolve, reject) => {
    const snapshot = await get(await getPostsRef());
    if (snapshot.exists()) {
      resolve(snapshot.val());
    } else {
      reject({ message: "No data available" });
    }
  });
}

export const postService = {
  update,
  create,
  remove,
  getById,
  getAll,
};

window.postService = postService;
