import { checkWithFilters } from "./filter-checker-on-todo.js";

class controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.view.updateHeaderDate();
    this.view.bindUndo(this.handleUndo);
    this.view.bindRedo(this.handleRedo);
    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindFilterUpdate(this.handleFilterUpdate);
    this.view.bindCheckBoxUpdate(this.handleCheckBoxUpdate);
    this.view.bindSearchBoxUpdate(this.handleSearchBoxUpdate);
  }

  render = (todos, filterData) => {
    const filteredTodos = todos.filter((todo) =>
      checkWithFilters(todo, filterData)
    );
    this.view(filteredTodos);
    filteredTodos.forEach((todo) =>
      this.view.analyticsUpdater.updateCounts(todo)
    );
    this.view.analyticsUpdater.updateAnalyticsOnView();
  };
}

// updateHeaderDate,
//   bindUndo,
//   bindRedo,
//   analyticsUpdater,
//   displayTodos,
//   bindAddTodo: createTodo.bindAddTodo,
//   bindFilterUpdate: filterPanel.bindFilterUpdate,
//   bindCheckBoxUpdate: filterPanel.bindCheckBoxUpdate,
//   bindSearchBoxUpdate: filterPanel.bindSearchBoxUpdate,
