import { urgency, category, filterNames, urgencyOptions, categoryOptions } from "../constants.js";
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
    targetButton.classList.toggle("filter-btn-selected");
    return {
      type: urgencyOptions.includes(targetButton.id) ? filterNames.URGENCY : filterNames.CATEGORY,
      level: targetButton.id,
    };
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
