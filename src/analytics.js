import { queriedElements, data } from "/src/localDataAndElements.js";

export const updateCountsForRemovedToDo = (toDo) => {
  if (toDo.completed) {
    data.countCompleted--;
  }
  data.totalCount--;
};

export const updateAnalytics = () => {
  queriedElements.percentageText.textContent =
    data.totalCount === 0 ? "0 %" : Math.round((data.countCompleted / data.totalCount) * 100) + " %";
  queriedElements.ratioText.textContent = `${data.countCompleted} / ${data.totalCount}`;
};
