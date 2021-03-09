import { urgency, category, filterNames } from "../constants.js";
import { extractClosestNodeFromPath } from "../helper-functions.js";

export class FilterPanel {
  constructor(filterPanelHandlers) {
    this.filterPanelHandlers = filterPanelHandlers;

    this.applyDOMEventListeners();
  }

  findFilterTypeAndLevel = (event) => {
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

  applyDOMEventListeners = () => {
    document.querySelector("#urgency-filter").addEventListener("click", (event) => {
      const filterTypeAndLevel = this.findFilterTypeAndLevel(event);
      if (filterTypeAndLevel) {
        this.filterPanelHandlers.updateFilter(filterTypeAndLevel);
      }
    });
    document.querySelector("#category-filter").addEventListener("click", (event) => {
      const filterTypeAndLevel = this.findFilterTypeAndLevel(event);
      if (filterTypeAndLevel) {
        this.filterPanelHandlers.updateFilter(filterTypeAndLevel);
      }
    });

    document
      .querySelector("#not-completed-check-box")
      .addEventListener("change", (event) =>
        this.filterPanelHandlers.updateCheckBox(event.target.checked)
      );

    let timeOutID = undefined;
    document.querySelector("#search-input").addEventListener("input", (event) => {
      clearTimeout(timeOutID);
      timeOutID = setTimeout(
        () => this.filterPanelHandlers.updateSearchedText(event.target.value),
        300
      );
    });
    document.querySelector("#search-input").addEventListener("change", (event) => {
      clearTimeout(timeOutID);
      timeOutID = setTimeout(
        () => this.filterPanelHandlers.updateSearchedText(event.target.value),
        300
      );
    });
    document.querySelector("#clear-btn").addEventListener("click", () => {
      document.querySelector("#search-input").value = "";
    });
  };
}
