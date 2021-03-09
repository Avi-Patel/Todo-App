import { validateTodoForFilter } from "./filterValidationOnTodo.js";
import { todoActions, INVALID_POSITION } from "./constants.js";

export class Controller {
  constructor(view, model) {
    this.model = model;
    this.view = view;

    this.view.updateHeaderDate();
    // this.view.bindInitialisation(this.handleInitialisation);
    this.view.bindActionOnUnload(this.handleUnloadEvent);
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

  handleUnloadEvent = () => {
    this.model.storeTodos();
  };

  uuid = () => {
    const currentMilliSeconds = new Date().valueOf();
    return currentMilliSeconds;
  };

  createTodoObject = (title, urgency, category) => {
    return {
      ID: this.uuid(),
      date: new Date().toLocaleString(),
      title,
      urgency,
      category,
      completed: false,
    };
  };

  handleAddTodo = (
    title,
    urgency = urgency.LOW,
    category = category.PERSONAL
  ) => {
    const todo = this.createTodoObject(title, urgency, category);
    this.model.addTodo(todo).then((addedSuccessFully) => {
      if (addedSuccessFully) {
        this.view.resetValuesInCreateTodoBox();
      }
    });
  };

  handleFilterUpdate = ({ urgencyOrCategory, type }) => {
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
    }
    const updatedTodos = this.model.getCurrentlySelected().map((id) => {
      const index = this.model.findIndexById(id);
      const todoAtIndex = this.model.getTodo(index);
      return { ...todoAtIndex, completed: !todoAtIndex.completed };
    });

    this.model.toggleCompletionInBulk(updatedTodos);
  };

  clearSelection = () => {
    this.model.removeCurrentlySelectedIds();
  };

  deleteSelectedTodos = () => {
    return (
      this.model.getCurrentlySelected().length === 0 ||
      this.model.deleteTodoInBulk()
    );
  };

  handleUndo = () => {
    const position = this.model.getPosition();
    const actionsHistory = this.model.getActionsHistory();
    if (position === INVALID_POSITION) {
      return;
    }

    switch (actionsHistory[position].actionType) {
      case todoActions.EDIT:
        this.model.onEdit(actionsHistory[position], true);
        break;
      case todoActions.CREATE:
        this.model.onCreate(actionsHistory[position], true);
        break;
      case todoActions.DELETE:
        this.model.onDelete(actionsHistory[position], true);
        break;
      default:
    }
  };
  handleRedo = () => {
    const position = this.model.getPosition();
    const actionsHistory = this.model.getActionsHistory();
    if (position === actionsHistory.length - 1) {
      return;
    }

    switch (actionsHistory[position + 1].actionType) {
      case todoActions.EDIT:
        this.model.onEdit(actionsHistory[position + 1], false);
        break;
      case todoActions.CREATE:
        this.model.onDelete(actionsHistory[position + 1], false);
        break;
      case todoActions.DELETE:
        this.model.onCreate(actionsHistory[position + 1], false);
        break;
      default:
    }
  };
}
