import { init } from "./app.js";
import { postService } from "./data-access/post.service.js";
import { getById } from "./utils/dom-utils.js";
import { log } from "./utils/logger.js";

document.addEventListener("DOMContentLoaded", function () {
  init().then(async ({ app, db }) => {
    renderPosts(await postService.getAll());
  });
  initColorButton();
  getById("home").onclick = () => {
    getById("post").classList.add("hidden");
    getById("posts").classList.remove("hidden");
  };
});

const toggleColorMode = () => {
  let colorMode = localStorage.getItem("colorMode");
  document.body.classList.remove(colorMode);
  colorMode = colorMode === "dark" ? "light" : "dark";
  localStorage.setItem("colorMode", colorMode);
  document.body.classList.add(colorMode);
};

const initColorButton = () => {
  const colorMode = localStorage.getItem("colorMode");
  document.body.classList.add(colorMode);
  getById("color-toggle").onclick = () => toggleColorMode();
};

function renderPosts(posts) {
  const postsContainer = getById("posts");
  for (let key in posts) {
    const post = posts[key];
    const path = "posts/" + key;
    const blogPost = document.createElement("blog-post");
    blogPost.setAttribute("title", post.title);
    blogPost.setAttribute(
      "date",
      new Date(post.createdAt).toDateString("yyyy-MM-dd")
    );
    blogPost.setAttribute("description", post.description);
    blogPost.onclick = () => navigate(path, post);
    postsContainer.appendChild(blogPost);
  }
}

function navigate(path, payload) {
  log("Navigating to " + path, payload);
  const postContainer = getById("post");
  postContainer.innerHTML = "";
  const postsContainer = getById("posts");
  postsContainer.classList.add("hidden");
  postContainer.classList.remove("hidden");
  let postPage = document.createElement("blog-post-page");
  postPage.setAttribute("title", payload.title);
  postPage.setAttribute("date", new Date(payload.createdAt).toDateString());
  postPage.setAttribute("description", payload.description);
  postContainer.appendChild(postPage);
}
