export const validateTodo = (todo, filterData) => {
  //collecting all consitions's true/false value
  const noUrgencyApplied = filterData.urgencyFilterMask.every(
    (element) => !element
  );
  const noCategoryApplied = filterData.categoryFilterMask.every(
    (element) => !element
  );
  const isChecked = filterData.notCompletedCheckBox;

  const isSatifiesSearchText =
    filterData.searchedText === "" ||
    todo.title.toLowerCase().indexOf(filterData.searchedText) + 1;

  return (
    (filterData.urgencyFilterMask[todo.urgency] === 1 || noUrgencyApplied) &&
    (filterData.categoryFilterMask[todo.category] === 1 || noUrgencyApplied) &&
    ((isChecked && !todo.completed) || !isChecked) &&
    isSatifiesSearchText
  );
};
