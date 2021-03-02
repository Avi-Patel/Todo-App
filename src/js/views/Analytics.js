//analytics manage the data about #totaltodos and #completed todos which are their on view at any time.
class Analytics {
  constructor() {
    this.numberOfCompletedTodos = 0;
    this.numberOfTotalTodos = 0;
  }

  incrementNumberOfCompletedTodos = (value) =>
    (this.numberOfCompletedTodos += value);

  incrementNumberOfTotalTodos = (value) => (this.numberOfTotalTodos += value);

  setNumberOfCompletedTodos = (numberOfCompletedTodos) =>
    (this.numberOfCompletedTodos = numberOfCompletedTodos);

  setNumberOfTotalTodos = (numberOfTotalTodos) =>
    (this.numberOfTotalTodos = numberOfTotalTodos);

  getNumberOfCompletedTodos = () => this.numberOfCompletedTodos;
  getNumberOfTotalTodos = () => this.numberOfTotalTodos;
}

export class AnalyticsUpdater {
  constructor() {
    this.analytics = new Analytics();
  }
  updateCounts = (todo) => {
    if (todo.completed) {
      this.analytics.incrementNumberOfCompletedTodos(1);
    }
    this.analytics.incrementNumberOfTotalTodos(1);
  };

  resetCounts = () => {
    this.analytics.setNumberOfCompletedTodos(0);
    this.analytics.setNumberOfTotalTodos(0);
  };

  updateAnalyticsOnView = () => {
    document.querySelector("#percentage-text").textContent =
      this.analytics.getNumberOfCompletedTodos() === 0
        ? "0 %"
        : Math.round(
            (this.analytics.getNumberOfCompletedTodos() /
              this.analytics.getNumberOfTotalTodos()) *
              100
          ) + " %";
    document.querySelector(
      "#ratio-text"
    ).textContent = `${this.analytics.getNumberOfCompletedTodos()} / ${this.analytics.getNumberOfTotalTodos()}`;
  };
}
