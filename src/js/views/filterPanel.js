import { urgency, category } from "../consts.js";
import { extractClosestNodeFromPath } from "../helper-functions.js";

const findUrgencyTargetBtn = (event, callback) => {
  const targetButton =
    event.target.tagName === "BUTTON"
      ? event.target
      : extractClosestNodeFromPath(event, "button");

  if (!targetButton) return;

  switch (targetButton.id) {
    case urgency.LOW:
      targetButton.classList.toggle("filter-btn-selected");
      callback("urgency", 0);
      break;
    case urgency.MEDIUM:
      targetButton.classList.toggle("filter-btn-selected");
      callback("urgency", 1);
      break;
    case urgency.HIGH:
      targetButton.classList.toggle("filter-btn-selected");
      callback("urgency", 2);
      break;
    case category.PERSONAL:
      targetButton.classList.toggle("filter-btn-selected");
      callback("category", 0);
      break;
    case category.ACADEMIC:
      targetButton.classList.toggle("filter-btn-selected");
      callback("category", 1);
      break;
    case category.SOCIAL:
      targetButton.classList.toggle("filter-btn-selected");
      callback("category", 2);
      break;
    default:
      break;
  }
};

const bindFilterUpdate = (callback) => {
  document
    .querySelector("#urgency-filter")
    .addEventListener("click", (event) =>
      findUrgencyTargetBtn(event, callback)
    );
  document
    .querySelector("#category-filter")
    .addEventListener("click", (event) =>
      findUrgencyTargetBtn(event, callback)
    );
};

const bindCheckBoxUpdate = (callback) => {
  document
    .querySelector("#not-completed-check-box")
    .addEventListener("change", (event) => callback(event.target.checked));
};

const bindSearchBoxUpdate = (callback) => {
  let timeOutID = undefined;
  document.querySelector("#search-input").addEventListener("input", (event) => {
    clearTimeout(timeOutID);
    timeOutID = setTimeout(() => callback(event.target.value), 300);
  });
  document
    .querySelector("#search-input")
    .addEventListener("change", (event) => {
      clearTimeout(timeOutID);
      timeOutID = setTimeout(() => callback(event.target.value), 300);
    });
};

const bindClearSearchBtn = () => {
  document.querySelector("#clear-btn").addEventListener("click", () => {
    document.querySelector("#search-input").value = "";
  });
};

export default {
  bindFilterUpdate,
  bindCheckBoxUpdate,
  bindSearchBoxUpdate,
  bindClearSearchBtn,
};
