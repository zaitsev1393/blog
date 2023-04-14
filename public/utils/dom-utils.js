import { log } from "./logger.js";

export const getByClassName = (className) =>
  document.getElementsByClassName(className)[0] || {};

export const getById = (id) => document.getElementById(id) || {};

export const createElement = (tag, options) => {
  const elem = document.createElement(tag);
  for (let key in options) {
    if (key === "classList") {
      options[key].forEach((className) => elem.classList.add(className));
    }
    elem[key] = options[key];
  }
  log("elem: ", elem, options);
  return elem;
};
