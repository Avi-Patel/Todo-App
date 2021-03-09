//analytics manage the data about #totaltodos and #completed todos which are shown on the view.
class Analytics {
  constructor() {
    this.completedTodos = 0;
    this.totalTodos = 0;
  }
  setCompletedTodos = (completedTodos) => (this.completedTodos = completedTodos); //

  setTotalTodos = (totalTodos) => (this.totalTodos = totalTodos);

  getCompletedTodos = () => this.completedTodos;
  getTotalTodos = () => this.totalTodos;
}

export class AnalyticsUpdater {
  constructor() {
    this.analytics = new Analytics();
  }
  updateCounts = (todo) => {
    if (todo.completed) {
      this.analytics.setCompletedTodos(this.analytics.getCompletedTodos() + 1);
    }
    this.analytics.setTotalTodos(this.analytics.getTotalTodos() + 1);
  };

  resetCounts = () => {
    this.analytics.setCompletedTodos(0);
    this.analytics.setTotalTodos(0);
  };

  updateAnalyticsOnView = () => {
    document.querySelector("#percentage-text").textContent =
      this.analytics.getCompletedTodos() === 0
        ? "0 %"
        : Math.round((this.analytics.getCompletedTodos() / this.analytics.getTotalTodos()) * 100) +
          " %";
    document.querySelector(
      "#ratio-text"
    ).textContent = `${this.analytics.getCompletedTodos()} / ${this.analytics.getTotalTodos()}`;
  };
}
