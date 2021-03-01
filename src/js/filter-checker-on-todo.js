export const checkWithFilters = (todo, filterData) => {
  //collecting all consitions's true/false value
  const notAnyUrgencyApplied = filterData.urgencyFilterMask.every(
    (element) => element === 0
  );
  const notAnyCategoryApplied = filterData.categoryFilterMask.every(
    (element) => element === 0
  );
  const checked = filterData.notCompletedCheckBox;

  const containSearchedWord =
    filterData.searchedText === "" ||
    todo.title.toLowerCase().indexOf(filterData.searchedText) + 1;

  return (
    (filterData.urgencyFilterMask[todo.urgency] === 1 ||
      notAnyUrgencyApplied) &&
    (filterData.categoryFilterMask[todo.category] === 1 ||
      notAnyCategoryApplied) &&
    ((checked && !todo.completed) || !checked) &&
    containSearchedWord
  );
};
