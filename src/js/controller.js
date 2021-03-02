import { checkWithFilters } from "./filter-checker-on-todo.js";
import { commands } from "./consts.js";

export class Controller {
  constructor(view, model) {
    this.model = model;
    this.view = view;
    // console.log(this.view);
    this.view.updateHeaderDate();
    this.view.bindUndo(this.handleUndo);
    this.view.bindRedo(this.handleRedo);
    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindFilterUpdate(this.handleFilterUpdate);
    this.view.bindCheckBoxUpdate(this.handleCheckBoxUpdate);
    this.view.bindSearchBoxUpdate(this.handleSearchBoxUpdate);
    this.view.bindClearSearchBtn();
    this.view.bindToggleCompletionOfSelection(
      this.handleTogglingOfCompletionOfSelection
    );
    this.view.bindClearSelection(this.handleClearSelection);
    this.view.bindDeleteSelectedTodos(this.handleDelectionOfSelectedTodods);

    this.model.bindStateChangeHandler(this.render);

    this.callbacksForTodo = {
      handleAlteringCompletion: this.handleAlteringCompletion,
      handleTogglingFromSelected: this.handleTogglingFromSelected,
      handleDeleteTodo: this.handleDeleteTodo,
      handleEditTodo: this.handleEditTodo,
    };

    this.render(
      this.model.allTodos,
      this.model.currentlySelected,
      this.model.filterData
    );
  }

  render = (todos, currentlySelectedIds, filterData) => {
    console.log(this.callbacksForTodo);
    const filteredTodos = todos.filter((todo) =>
      checkWithFilters(todo, filterData)
    );
    this.view.analyticsUpdater.resetCounts();
    this.view.displayTodos(
      filteredTodos,
      currentlySelectedIds,
      this.callbacksForTodo
    );
    filteredTodos.forEach((todo) =>
      this.view.analyticsUpdater.updateCounts(todo)
    );
    this.view.analyticsUpdater.updateAnalyticsOnView();
  };

  createTodoObject = ({ counter, title, urgency, category }) => ({
    ID: counter,
    date: new Date().toLocaleString(),
    title: title,
    urgency: urgency,
    category: category,
    completed: false,
  });

  handleAddTodo = (title, urgency, category) => {
    const todo = this.createTodoObject({
      counter: this.model.getCounter(),
      title,
      urgency,
      category,
    });
    this.model.addTodo(todo);
  };

  handleFilterUpdate = (urgencyOrCategory, index) => {
    this.model.updateFilter(urgencyOrCategory, index);
  };

  handleCheckBoxUpdate = (isChecked) => {
    this.model.updateCheckBoxStatus(isChecked);
  };

  handleSearchBoxUpdate = (searchInput) => {
    this.model.updateSearchedInput(searchInput);
  };

  handleEditTodo = (todo) => {
    const index = this.model.getIndexInTodos(todo.ID);
    this.model.replaceTodoAtAnyIndex(index, todo);
  };

  handleAlteringCompletion = (id) => {
    const index = this.model.getIndexInTodos(id);
    const todo = { ...this.model.getTodo(index) };
    todo.completed = !todo.completed;
    this.model.replaceTodoAtAnyIndex(index, todo);
  };

  handleTogglingFromSelected = (id) => {
    this.model.toggleIdFromSelected(id);
  };

  handleDeleteTodo = (id) => {
    this.model.deleteTodo(id);
  };

  handleTogglingOfCompletionOfSelection = () => {
    if (this.model.getCurrentlySelected().length === 0) {
      return true;
    } else {
      this.model.toggleCompletionInBulk();
    }
  };

  handleClearSelection = () => {
    this.model.removeCurrentlySelectedIds();
  };

  handleDelectionOfSelectedTodods = () => {
    if (this.model.getCurrentlySelected().length === 0) {
      return true;
    } else {
      this.model.deleteTodoInBulk();
    }
  };

  handleUndo = () => {
    const position = this.model.getPosition();
    const actions = this.model.getActions();
    if (position === -1) return;
    console.log(position);

    switch (actions[position].command) {
      case commands.EDIT:
        this.model.onEdit(actions[position], true);
        break;
      case commands.CREATE:
        this.model.onCreate(actions[position], true);
        break;
      case commands.DELETE:
        this.model.onDelete(actions[position], true);
        break;
      default:
        break;
    }
  };
  handleRedo = () => {
    const position = this.model.getPosition();
    const actions = this.model.getActions();
    if (position === actions.length - 1) return;
    console.log(position);
    switch (actions[position + 1].command) {
      case commands.EDIT:
        this.model.onEdit(actions[position + 1], false);
        break;
      case commands.CREATE:
        this.model.onDelete(actions[position + 1], false);
        break;
      case commands.DELETE:
        this.model.onCreate(actions[position + 1], false);
        break;
      default:
        break;
    }
  };
}
