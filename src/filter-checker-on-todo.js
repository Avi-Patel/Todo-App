export const filterCheckerOnTodo = (filterData) => {
  return {
    checkWithFilter: (todoItem) => {
      //collecting all consitions's true/false value
      const notAnyUrgencyApplied = filterData.urgencyFilterMask.every(
        (element) => element === 0
      );
      const notAnyCategoryApplied = filterData.categoryFilterMask.every(
        (element) => element === 0
      );
      const checked = filterData.notCompletedCheckBox;

      return (
        (filterData.urgencyFilterMask[todoItem.urgency] === 1 ||
          notAnyUrgencyApplied) &&
        (filterData.categoryFilterMask[todoItem.category] === 1 ||
          notAnyCategoryApplied) &&
        ((checked && !todoItem.completed) || !checked)
      );
    },

    containSearchedWord: (title) =>
      filterData.searchedText === "" ||
      title.toLowerCase().indexOf(filterData.searchedText) + 1,
  };
};
