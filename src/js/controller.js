import { validateTodo } from "./filterValidationOnTodo.js";
import { todoActions, urgency, category } from "./consts.js";

export class Controller {
  constructor(view, model) {
    this.model = model;
    this.view = view;

    this.view.updateHeaderDate();
    this.view.bindUndo(this.handleUndo);
    this.view.bindRedo(this.handleRedo);
    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindFilterUpdate(this.handleFilterUpdate);
    this.view.bindCheckBoxUpdate(this.handleCheckBoxUpdate);
    this.view.bindSearchBoxUpdate(this.handleSearchBoxUpdate);
    this.view.bindClearSearchBtn();
    this.view.bindToggleCompletionOfSelection(this.toggleCompletionOfSelection);
    this.view.bindClearSelection(this.clearSelection);
    this.view.bindDeleteSelectedTodos(this.deleteSelectedTodos);

    this.model.bindStateChangeHandler(this.render);

    this.callbacksForTodo = {
      handleTodoToggle: this.handleTodoToggle,
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
    const filteredTodos = todos.filter((todo) =>
      validateTodo(todo, filterData)
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

  createTodoObject = ({ counter, title, urgency, category }) => {
    if (!urgency) {
      urgency = 0;
    }
    if (!category) {
      category = 0;
    }

    return {
      ID: counter,
      date: new Date().toLocaleString(),
      title: title,
      urgency: urgency,
      category: category,
      completed: false,
    };
  };

  handleAddTodo = (title, urgency, category) => {
    const todo = this.createTodoObject({
      counter: this.model.getCounter(),
      title,
      urgency,
      category,
    });
    this.model.addTodo(todo);
  };

  handleFilterUpdate = (urgencyOrCategory, level) => {
    let index = 0;
    if (level === urgency.MEDIUM || level === category.ACADEMIC) {
      index = 1;
    }
    if (level == urgency.HIGH || level === category.SOCIAL) {
      index = 2;
    }
    this.model.updateFilter(urgencyOrCategory, index);
  };

  handleCheckBoxUpdate = (isChecked) => {
    this.model.updateCheckBoxStatus(isChecked);
  };

  handleSearchBoxUpdate = (searchInput) => {
    this.model.updateSearchedInput(searchInput);
  };

  handleEditTodo = (todo) => {
    const index = this.model.findIndexById(todo.ID);
    this.model.replaceTodoAtAnyIndex(index, todo);
  };

  handleTodoToggle = (id) => {
    const index = this.model.findIndexById(id);
    const todoAtIndex = this.model.getTodo(index);
    const updatedTodo = { ...todoAtIndex, completed: !todoAtIndex.completed };
    this.model.replaceTodoAtAnyIndex(index, updatedTodo);
  };

  handleTogglingFromSelected = (id) => {
    this.model.toggleIdFromSelected(id);
  };

  handleDeleteTodo = (id) => {
    this.model.deleteTodo(id);
  };

  toggleCompletionOfSelection = () => {
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
    console.log(actions);
    if (position === -1) {
      return;
    }
    console.log(position);

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
        break;
    }
  };
  handleRedo = () => {
    const position = this.model.getPosition();
    const actions = this.model.getActions();
    if (position === actions.length - 1) {
      return;
    }
    console.log(position);
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
        break;
    }
  };
}
