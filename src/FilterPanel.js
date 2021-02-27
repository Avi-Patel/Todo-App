class FilterPanel {
  constructor(filterData, filterHandlers) {
    this.props = {
      filterData,
      filterHandlers,
    };

    this.DOMElements = {
      urgencyFilter: document.querySelector("#urgencyFilter"),
      categoryFilter: document.querySelector("#categoryFilter"),
      notCompletedCheckBox: document.querySelector("#notCompletedCheckBox"),
      searchInput: document.querySelector("#searchInput"),
      clearBtn: document.querySelector("#clearBtn"),
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
      updateFilter(
        event,
        this.props.filterData.urgencyFilterMask,
        this.urgencyFilterIds
      )
    );
    this.DOMElements.categoryFilter.addEventListener("click", (event) =>
      updateFilter(
        event,
        this.props.filterData.categoryFilterMask,
        this.categoryFilterIds
      )
    );
    this.DOMElements.notCompletedCheckBox.addEventListener("change", (event) =>
      this.alterNotCompletedCheckBox(event.target.checked)
    );
    this.DOMElements.searchInput.addEventListener("input", (event) => {
      clearTimeout(data.timeOutID);
      data.timeOutID = setTimeout(
        (event) => this.updateSearchedText(event.target.value),
        500
      );
    });
    this.DOMElements.clearBtn.addEventListener("click", () => {
      this.DOMElements.searchInput.value = "";
      this.updateSearchedText("");
    });
  };

  updateSearchedText = (searchedText) => {
    this.props.filterData.searchedText = searchedText;
    this.props.filterHandlers.setFilterData(this.props.filterData);
  };

  alterNotCompletedCheckBox = (isChecked) => {
    this.props.filterData.notCompletedCheckBox = isChecked;
    this.props.filterHandlers.setFilterData(this.props.filterData);
  };

  updateFilter = (event, filterMask, filterIds) => {
    const newFilterMask = [...filterMask];

    let anyThingChanged = true;
    const targetButton =
      event.target.tagName === "BUTTON"
        ? event.target
        : extractClosestNodeFromPath(event, "button");

    if (!targetButton) return;

    switch (targetButton.id) {
      case filterIds[0]:
        newFilterMask[0] ^= 1;
        changeBtnStyle(targetButton, dataFilter[0]);
        break;
      case filterIds[1]:
        newFilterMask[1] ^= 1;
        changeBtnStyle(targetButton, dataFilter[1]);
        break;
      case filterIds[2]:
        newFilterMask[2] ^= 1;
        changeBtnStyle(targetButton, dataFilter[2]);
        break;
      default:
        anyThingChanged = false;
    }
    if (anyThingChanged) {
      if (filterIds[0] === this.categoryFilterIds[0]) {
        this.props.filterData.urgencyFilterMask = newFilterMask;
      } else {
        this.props.filterData.categoryFilterMask = newFilterMask;
      }
      this.props.filterHandlers.setFilterData(this.props.filterData);
    }
  };
  extractClosestNodeFromPath = (event, type) => event.target.closest(type);
  changeBtnStyle = (target, selected) => {
    if (selected) {
      target.style.backgroundColor = "rgb(45, 45, 45)";
      target.style.boxShadow = "0px 0px 4px 2px white";
    } else {
      target.style.backgroundColor = "black";
      target.style.boxShadow = "";
    }
  };
}
