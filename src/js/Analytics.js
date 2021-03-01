//analytics manage the data about #totaltodos and #completed todos which are their on view at any time.
class Analytics {
  constructor() {
    this.numberOfCompletedTodos = 0;
    this.numberOfTotalTodos = 0;
  }

  incrementNumberOfCompletedTodos = (value) =>
    (this.numberOfCompletedTodos += value);

  incrementNumberOfTotalTodos = (value) => (this.numberOfTotalTodos = value);

  setNumberOfCompletedTodos = (numberOfCompletedTodos) =>
    (this.numberOfCompletedTodos = numberOfCompletedTodos);

  setNumberOfTotalTodos = (numberOfTotalTodos) =>
    (this.numberOfTotalTodos = numberOfTotalTodos);

  getNumberOfCompletedTodos = () => this.numberOfCompletedTodos;
  getNumberOfTotalTodos = () => this.numberOfTotalTodos;
}

export class AnalyticsUpdater {
  constructor() {
    this.DOMElements = {
      percentageText: document.querySelector("#percentage-text"),
      ratioText: document.querySelector("#ratio-text"),
    };
    this.analytics = new Analytics();
  }
  updateCountsForRemovedTodo = (todo) => {
    if (todo.completed) {
      this.analytics.incrementNumberOfCompletedTodos(-1);
    }
    this.analytics.incrementNumberOfTotalTodos(-1);
  };
  updateCountsForAddedTodo = (todo) => {
    if (todo.completed) {
      this.analytics.incrementNumberOfCompletedTodos(1);
    }
    this.analytics.incrementNumberOfTotalTodos(1);
  };

  updateAnalyticsOnView = () => {
    this.DOMElements.percentageText.textContent =
      this.analytics.getNumberOfCompletedTodos() === 0
        ? "0 %"
        : Math.round(
            (this.analytics.getNumberOfCompletedTodos() /
              this.analytics.getNumberOfTotalTodos()) *
              100
          ) + " %";
    this.DOMElements.ratioText.textContent = `${this.analytics.getNumberOfCompletedTodos()} / ${this.analytics.getNumberOfTotalTodos()}`;
  };
}
