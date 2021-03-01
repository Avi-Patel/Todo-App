import {
  changeFilterBtnStyle,
  extractClosestNodeFromPath,
} from "./helper-functions.js";

export class FilterPanel {
  constructor({ filterHandlers, urgency, category }) {
    this.filterData = {
      urgencyFilterMask: [0, 0, 0],
      categoryFilterMask: [0, 0, 0],
      notCompletedCheckBox: false,
      searchedText: "",
    };
    this.timeOutID = undefined;
    this.filterHandlers = filterHandlers;

    this.DOMElements = {
      urgencyFilter: document.querySelector("#urgency-filter"),
      categoryFilter: document.querySelector("#category-filter"),
      notCompletedCheckBox: document.querySelector("#not-completed-check-box"),
      searchInput: document.querySelector("#search-input"),
      clearBtn: document.querySelector("#clear-btn"),
    };
    this.urgencyFilterIds = [urgency.LOW, urgency.MEDIUM, urgency.HIGH];
    this.categoryFilterIds = [
      category.PERSONAL,
      category.ACADEMIC,
      category.SOCIAL,
    ];

    this.setFilterPanelEventHandlers();
  }

  setFilterPanelEventHandlers = () => {
    this.DOMElements.urgencyFilter.addEventListener("click", (event) =>
      this.updateFilter(
        event,
        this.filterData.urgencyFilterMask,
        this.urgencyFilterIds
      )
    );
    this.DOMElements.categoryFilter.addEventListener("click", (event) =>
      this.updateFilter(
        event,
        this.filterData.categoryFilterMask,
        this.categoryFilterIds
      )
    );
    this.DOMElements.notCompletedCheckBox.addEventListener("change", (event) =>
      this.alterNotCompletedCheckBox(event.target.checked)
    );
    this.DOMElements.searchInput.addEventListener("input", (event) => {
      clearTimeout(this.timeOutID);
      this.timeOutID = setTimeout(
        () => this.updateSearchedText(event.target.value),
        500
      );
    });
    this.DOMElements.clearBtn.addEventListener("click", () => {
      this.DOMElements.searchInput.value = "";
      this.updateSearchedText("");
    });
  };

  updateSearchedText = (searchedText) => {
    this.filterData.searchedText = searchedText;
    this.filterHandlers();
  };

  alterNotCompletedCheckBox = (isChecked) => {
    this.filterData.notCompletedCheckBox = isChecked;
    this.filterHandlers();
  };

  updateFilter = (event, filterMask, filterIds) => {
    let anyThingChanged = true;
    const targetButton =
      event.target.tagName === "BUTTON"
        ? event.target
        : extractClosestNodeFromPath(event, "button");

    if (!targetButton) return;

    switch (targetButton.id) {
      case filterIds[0]:
        filterMask[0] ^= 1;
        changeFilterBtnStyle(targetButton, filterMask[0]);
        break;
      case filterIds[1]:
        filterMask[1] ^= 1;
        changeFilterBtnStyle(targetButton, filterMask[1]);
        break;
      case filterIds[2]:
        filterMask[2] ^= 1;
        changeFilterBtnStyle(targetButton, filterMask[2]);
        break;
      default:
        anyThingChanged = false;
    }
    if (anyThingChanged) {
      this.filterHandlers();
    }
  };
}
