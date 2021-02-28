import { data, queriedElements } from "/src/localDataAndElements.js";

export const checkWithFilter = (toDoItem) => {
  //collecting all consitions's true/false value
  const notAnyUrgencyApplied = data.urgencyFilter.every(
    (element) => element === 0
  );
  const notAnyCategoryApplied = data.categoryFilter.every(
    (element) => element === 0
  );
  const checked = queriedElements.notCompletedCheckBox.checked;

  return (
    (data.urgencyFilter[toDoItem.urgency] === 1 || notAnyUrgencyApplied) &&
    (data.categoryFilter[toDoItem.category] === 1 || notAnyCategoryApplied) &&
    ((checked && !toDoItem.completed) || !checked)
  );
};

export const containSearchedWord = (searchedText, title) =>
  searchedText === "" || title.toLowerCase().indexOf(searchedText) + 1;
