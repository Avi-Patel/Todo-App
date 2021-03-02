import { checkWithFilters } from "./filter-checker-on-todo.js";

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
    // console.log(filteredTodos);
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
    // console.log(this.model.getCounter());
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
    const index = this.model.getIndexInLocalData(todo.ID);
    this.model.replaceTodoAtAnyIndex(index, todo);
  };

  handleAlteringCompletion = (id) => {
    const index = this.model.getIndexInLocalData(id);
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
    // console.log(position);

    switch (actions[position].command) {
      case commands.EDIT:
        this.model.historyHandlers
          .onEdit(
            actions[position],
            // actions[position]["IDs"][0],
            // actions[position]["todos"][0],
            // actions[position]["oldTodos"][0],
            position,
            true
          )
          .then((newPosition) => this.model.setPostion(newPosition));
        break;
      case commands.ALTER_COMPLETION_IN_BULK:
        this.model.historyHandlers
          .onAlterCompletionInBulk(
            actions[position],
            actions[position]["IDs"],
            position,
            true
          )
          .then((newPosition) => this.model.setPostion(newPosition));
        break;
      case commands.CREATE:
        this.model.historyHandlers
          .onCreate(
            actions[position],
            actions[position]["IDs"][0],
            position,
            true
          )
          .then((newPosition) => this.model.setPostion(newPosition));
        break;
      case commands.DELETE:
        this.model.historyHandlers
          .onDelete(
            actions[position],
            // actions[position]["IDs"][0],
            // actions[position]["oldTodos"][0],
            position,
            true
          )
          .then((newPosition) => this.model.setPostion(newPosition));
        break;
      case commands.DELETE_IN_BULK:
        this.model.historyHandlers
          .onDeleteInBulk(
            actions[position],
            // actions[position]["IDs"],
            // actions[position]["oldTodos"],
            position,
            true
          )
          .then((newPosition) => this.model.setPostion(newPosition));
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
        this.model.historyHandlers
          .onEdit(
            actions[position],
            // actions[position + 1]["IDs"][0],
            // actions[position + 1]["todos"][0],
            // actions[position + 1]["oldTodos"][0],
            position,
            false
          )
          .then((newPosition) => this.model.setPostion(newPosition));
        break;
      case commands.ALTER_COMPLETION_IN_BULK:
        this.model.historyHandlers
          .onAlterCompletionInBulk(
            actions[position],
            // actions[position + 1]["IDs"],
            position,
            false
          )
          .then((newPosition) => this.model.setPostion(newPosition));
        break;
      case commands.CREATE:
        this.model.historyHandlers
          .onDelete(
            actions[position],
            // actions[position + 1]["IDs"][0],
            // actions[position + 1]["todos"][0],
            position,
            false
          )
          .then((newPosition) => this.model.setPostion(newPosition));

        break;
      case commands.DELETE:
        this.model.historyHandlers
          .onCreate(
            actions[position],
            actions[position + 1]["IDs"][0],
            position,
            false
          )
          .then((newPosition) => this.model.setPostion(newPosition));
        break;
      case commands.DELETE_IN_BULK:
        this.model.historyHandlers
          .onDeleteInBulk(
            actions[position],
            // actions[position + 1]["IDs"],
            // actions[position + 1]["oldTodos"],
            position,
            false
          )
          .then((newPosition) => this.model.setPostion(newPosition));
        break;
      default:
        break;
    }
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
