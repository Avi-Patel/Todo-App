import { urgency, category } from "./constants.js";
export const validateTodoForFilter = (todo, filterData) => {
  console.log(todo, filterData);
  //collecting all consitions's true/false value
  const noUrgencyApplied = !(
    filterData.urgencyFilterMask[urgency.LOW] ||
    filterData.urgencyFilterMask[urgency.MEDIUM] ||
    filterData.urgencyFilterMask[urgency.HIGH]
  );
  const noCategoryApplied = !(
    filterData.categoryFilterMask[category.PERSONAL] ||
    filterData.categoryFilterMask[category.ACADEMIC] ||
    filterData.categoryFilterMask[category.SOCIAL]
  );
  console.log(noUrgencyApplied, noCategoryApplied);
  const isChecked = filterData.notCompletedCheckBox;

  const isSatifiesSearchText =
    filterData.searchedText === "" ||
    todo.title.toLowerCase().indexOf(filterData.searchedText) + 1;
  console.log(filterData.urgencyFilterMask[todo.urgency]);
  return (
    (filterData.urgencyFilterMask[todo.urgency] || noUrgencyApplied) &&
    (filterData.categoryFilterMask[todo.category] || noCategoryApplied) &&
    ((isChecked && !todo.completed) || !isChecked) &&
    isSatifiesSearchText
  );
};
