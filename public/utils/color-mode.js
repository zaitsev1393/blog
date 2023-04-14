import { getById } from "./dom-utils.js";

const toggleColorMode = () => {
  let colorMode = localStorage.getItem("colorMode");
  document.body.classList.remove(colorMode);
  colorMode = colorMode === "dark" ? "light" : "dark";
  localStorage.setItem("colorMode", colorMode);
  document.body.classList.add(colorMode);
};

export const initColorButton = () => {
  const colorMode = localStorage.getItem("colorMode");
  document.body.classList.add(colorMode);
  getById("color-toggle").onclick = () => toggleColorMode();
};
