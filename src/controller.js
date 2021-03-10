import { validateTodoForFilter } from "./filterValidationOnTodo.js";
import { todoActions, INVALID_POSITION } from "./constants.js";
import { View } from "./view.js";
import { Model } from "./model.js";

export class Controller {
  constructor() {
    this.handlerConfig = {
      DOMUnloadHandler: this.handleUnloadEvent,
      createTodo: this.handleCreateTodo,
      undoRedoHandlers: {
        undo: this.handleUndo,
        redo: this.handleRedo,
      },
      filterPanelHandlers: {
        updateFilter: this.handleFilterUpdate,
        updateCheckBox: this.handleCheckBoxUpdate,
        updateSearchedText: this.handleSearchUpdate,
      },
      selectionHandlers: {
        clearSelection: this.clearSelection,
        toggleBulkCompletion: this.toggleBulkCompletion,
        deleteSelectedTodos: this.deleteSelectedTodos,
      },
    };

    this.callbacksForTodo = {
      handleCompletionToggle: this.handleCompletionToggle,
      handleSelectionToggle: this.handleSelectionToggle,
      handleDeleteTodo: this.handleDeleteTodo,
      handleEditTodo: this.handleEditTodo,
    };

    this.view = new View(this.handlerConfig);
    this.model = new Model(this.render);
  }

  render = (todos, currentlySelectedIds, filterData) => {
    const filteredTodos = todos.filter((todo) => validateTodoForFilter(todo, filterData));
    this.view.analyticsUpdater.resetCounts();
    this.view.displayTodos(filteredTodos, currentlySelectedIds, this.callbacksForTodo);
    filteredTodos.forEach((todo) => this.view.analyticsUpdater.updateCounts(todo));
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

  // handle default here
  createTodoObject = (title, urgency = urgency.LOW, category = category.PERSONAL) => {
    return {
      ID: this.uuid(),
      date: new Date().toLocaleString(),
      title,
      urgency,
      category,
      completed: false,
    };
  };

  handleCreateTodo = (title, urgency, category) => {
    const todo = this.createTodoObject(title, urgency, category);
    this.model.addTodo(todo).then((addedSuccessFully) => {
      if (addedSuccessFully) {
        this.view.resetValuesInCreateTodoBox();
      }
    });
  };

  handleFilterUpdate = ({ type, level }) => {
    this.model.updateFilter(type, level);
  };

  handleCheckBoxUpdate = (isChecked) => {
    this.model.updateCheckBoxStatus(isChecked);
  };

  handleSearchUpdate = (searchInput) => {
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
    return this.model.getCurrentlySelected().length === 0 || this.model.deleteTodoInBulk();
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
