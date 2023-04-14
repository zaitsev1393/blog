import { createElement } from "../utils/dom-utils.js";

export const Post = (options) => createElement("div", options);

export const addPost = (anchor, elem) => anchor.appendChild(elem);
