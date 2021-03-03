import { urgency, category, filterNames } from "../constants.js";
import { extractClosestNodeFromPath } from "../helper-functions.js";

const findFilterTypeAndLevel = (event) => {
  const targetButton =
    event.target.tagName === "BUTTON"
      ? event.target
      : extractClosestNodeFromPath(event, "button");

  if (!targetButton) return;

  switch (targetButton.id) {
    case urgency.LOW:
      targetButton.classList.toggle("filter-btn-selected");
      return { urgencyOrCategory: filterNames.URGENCY, type: urgency.LOW };

    case urgency.MEDIUM:
      targetButton.classList.toggle("filter-btn-selected");
      return { urgencyOrCategory: filterNames.URGENCY, type: urgency.MEDIUM };

    case urgency.HIGH:
      targetButton.classList.toggle("filter-btn-selected");
      return { urgencyOrCategory: filterNames.URGENCY, type: urgency.HIGH };

    case category.PERSONAL:
      targetButton.classList.toggle("filter-btn-selected");
      return {
        urgencyOrCategory: filterNames.CATEGORY,
        type: category.PERSONAL,
      };

    case category.ACADEMIC:
      targetButton.classList.toggle("filter-btn-selected");
      return {
        urgencyOrCategory: filterNames.CATEGORY,
        type: category.ACADEMIC,
      };

    case category.SOCIAL:
      targetButton.classList.toggle("filter-btn-selected");
      return {
        urgencyOrCategory: filterNames.CATEGORY,
        type: category.SOCIAL,
      };
    default:
  }
};

const bindFilterUpdate = (callback) => {
  document
    .querySelector("#urgency-filter")
    .addEventListener("click", (event) => {
      const isTypeAndLevelFound = findFilterTypeAndLevel(event);
      console.log(isTypeAndLevelFound);
      if (isTypeAndLevelFound) {
        callback(isTypeAndLevelFound);
      }
    });
  document
    .querySelector("#category-filter")
    .addEventListener("click", (event) => {
      const isTypeAndLevelFound = findFilterTypeAndLevel(event);
      if (isTypeAndLevelFound) {
        callback(isTypeAndLevelFound);
      }
    });
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
