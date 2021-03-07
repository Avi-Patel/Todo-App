import { validateTodoForFilter } from "./filterValidationOnTodo.js";
import {
  todoActions,
  urgency,
  category,
  INVALID_POSITION,
} from "./constants.js";

export class Controller {
  constructor(view, model) {
    this.model = model;
    this.view = view;

    this.view.updateHeaderDate();
    // this.view.bindInitialisation(this.handleInitialisation);
    this.view.bindActionOnUnload(this.handleActionOnUnload);
    this.view.bindUndo(this.handleUndo);
    this.view.bindRedo(this.handleRedo);
    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindFilterUpdate(this.handleFilterUpdate);
    this.view.bindCheckBoxUpdate(this.handleCheckBoxUpdate);
    this.view.bindSearchBoxUpdate(this.handleSearchBoxUpdate);
    this.view.bindClearSearchBtn();
    this.view.bindToggleCompletionOfSelection(this.toggleBulkCompletion);
    this.view.bindClearSelection(this.clearSelection);
    this.view.bindDeleteSelectedTodos(this.deleteSelectedTodos);

    this.model.bindStateChangeHandler(this.render);

    this.callbacksForTodo = {
      handleCompletionToggle: this.handleCompletionToggle,
      handleSelectionToggle: this.handleSelectionToggle,
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
    const filteredTodos = todos.filter((todo) =>
      validateTodoForFilter(todo, filterData)
    );
    // console.log(filteredTodos);
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

  handleInitialisation = () => {
    this.model.fetchTodos();
  };

  handleActionOnUnload = () => {
    this.model.storeTodos();
  };

  uuid = () => {
    const currentMilliSeconds = new Date().valueOf();
    return currentMilliSeconds;
  };

  createTodoObject = ({ counter, title, urgency, category }) => {
    return {
      ID: this.uuid(),
      date: new Date().toLocaleString(),
      title: title,
      urgency: urgency,
      category: category,
      completed: false,
    };
  };

  handleAddTodo = (
    title,
    urgency = urgency.LOW,
    category = category.PERSONAL
  ) => {
    const todo = this.createTodoObject({
      counter: this.model.getCounter(),
      title,
      urgency,
      category,
    });
    this.model.addTodo(todo);
  };

  handleFilterUpdate = ({ urgencyOrCategory, type }) => {
    console.log(urgencyOrCategory, type);
    this.model.updateFilter(urgencyOrCategory, type);
  };

  handleCheckBoxUpdate = (isChecked) => {
    this.model.updateCheckBoxStatus(isChecked);
  };

  handleSearchBoxUpdate = (searchInput) => {
    this.model.updateSearchedInput(searchInput);
  };

  handleEditTodo = (updatedTodo) => {
    this.model.updateTodo(updatedTodo);
  };

  handleCompletionToggle = (id) => {
    const index = this.model.findIndexById(id);
    const todoAtIndex = this.model.getTodo(index);
    const updatedTodo = { ...todoAtIndex, completed: !todoAtIndex.completed };
    this.model.updateTodo(updatedTodo);
  };

  handleSelectionToggle = (id) => {
    this.model.toggleIdFromSelected(id);
  };

  handleDeleteTodo = (id) => {
    this.model.deleteTodo(id);
  };

  toggleBulkCompletion = () => {
    if (this.model.getCurrentlySelected().length === 0) {
      return true;
    } else {
      this.model.toggleCompletionInBulk();
    }
  };

  clearSelection = () => {
    this.model.removeCurrentlySelectedIds();
  };

  deleteSelectedTodos = () => {
    if (this.model.getCurrentlySelected().length === 0) {
      return true;
    } else {
      this.model.deleteTodoInBulk();
    }
  };

  handleUndo = () => {
    const position = this.model.getPosition();
    const actions = this.model.getActions();
    if (position === INVALID_POSITION) {
      return;
    }

    switch (actions[position].command) {
      case todoActions.EDIT:
        this.model.onEdit(actions[position], true);
        break;
      case todoActions.CREATE:
        this.model.onCreate(actions[position], true);
        break;
      case todoActions.DELETE:
        this.model.onDelete(actions[position], true);
        break;
      default:
    }
  };
  handleRedo = () => {
    const position = this.model.getPosition();
    const actions = this.model.getActions();
    if (position === actions.length - 1) {
      return;
    }

    switch (actions[position + 1].command) {
      case todoActions.EDIT:
        this.model.onEdit(actions[position + 1], false);
        break;
      case todoActions.CREATE:
        this.model.onDelete(actions[position + 1], false);
        break;
      case todoActions.DELETE:
        this.model.onCreate(actions[position + 1], false);
        break;
      default:
    }
  };
}
