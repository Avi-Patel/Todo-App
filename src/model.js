import { createMockServer } from "./mockServer.js";
import { showSnackbar } from "./helper-functions.js";
import { todoActions, filterNames, INVALID_POSITION } from "./constants.js";

export class Model {
  constructor() {
    this.allTodos = [];
    this.currentlySelected = [];
    this.filterData = {
      urgencyFilterMask: {},
      categoryFilterMask: {},
      isIncompleteEnabled: false,
      searchedText: "",
    };
    this.position = INVALID_POSITION;
    this.actionsHistory = [];
    this.mockServer = createMockServer();
  }

  bindStateChangeHandler = (render) => (this.stateChangeHandler = render);
  runStateChangeHandler = () => {
    this.stateChangeHandler(this.allTodos, this.currentlySelected, this.filterData);
  };

  //utilities for accessing model data
  getPosition = () => this.position;
  getActionsHistory = () => this.actionsHistory;
  getTodo = (index) => this.allTodos[index];

  findIndexById = (id) => {
    let index;
    this.allTodos.forEach((todo, i) => {
      if (todo.ID === id) index = i;
    });
    return index;
  };

  removeCurrentlySelectedIds = () => {
    this.currentlySelected = [];
    this.runStateChangeHandler();
  };

  getCurrentlySelected = () => this.currentlySelected;

  findIndexToInsert = (id) => {
    let index = this.allTodos.length;
    this.allTodos.forEach((todo, i) => {
      if (todo.ID > id && i > 0 && this.allTodos[i - 1].ID < id) {
        index = i;
      }
    });
    if (this.allTodos.length === 0 || id < this.allTodos[0].ID) {
      index = 0;
    }
    return index;
  };

  //adding actions done on todd to history
  addActions = (actionType, todoIds, updatedTodos, oldTodos) => {
    this.actionsHistory = this.actionsHistory.slice(0, this.position + 1);
    const newAction = {
      actionType,
      Ids: todoIds,
    };
    if (updatedTodos) {
      newAction["todos"] = updatedTodos;
    }
    if (oldTodos) {
      newAction["oldTodos"] = oldTodos;
    }
    this.actionsHistory = this.actionsHistory.concat(newAction);
    this.position++;
  };

  // handlers for actions on todo
  toggleIdFromSelected = (id) => {
    const indexInSelected = this.currentlySelected.indexOf(id);
    if (indexInSelected === -1) {
      this.currentlySelected = this.currentlySelected.concat(id);
    } else {
      this.currentlySelected.splice(indexInSelected, 1);
    }
    this.runStateChangeHandler();
  };

  updateFilter = (urgencyOrCategory, type) => {
    if (urgencyOrCategory === filterNames.URGENCY) {
      const urgencyFilterMask = this.filterData.urgencyFilterMask;
      urgencyFilterMask[type] = !urgencyFilterMask[type];
      this.filterData = { ...this.filterData, urgencyFilterMask };
    } else {
      const categoryFilterMask = this.filterData.categoryFilterMask;
      categoryFilterMask[type] = !categoryFilterMask[type];
      this.filterData = { ...this.filterData, categoryFilterMask };
    }
    console.log(this.filterData);
    this.runStateChangeHandler();
  };

  updateCheckBoxStatus = (isChecked) => {
    this.filterData = { ...this.filterData, isIncompleteEnabled: isChecked };
    this.runStateChangeHandler();
  };

  updateSearchedInput = (newSearchedText) => {
    //
    this.filterData = { ...this.filterData, searchedText: newSearchedText };
    this.runStateChangeHandler();
  };

  storeTodos = () => {
    this.mockServer.storeTodosToDatabase().catch(showSnackbar);
  };

  fetchTodos = () => {
    this.mockServer
      .getTodosFromDatabase()
      .then((todos) => {
        this.allTodos = todos;
        this.runStateChangeHandler();
      })
      .catch(showSnackbar);
  };

  addTodo = (newTodo) => {
    return this.mockServer
      .createTodoInDatabase(newTodo)
      .then(() => {
        this.allTodos = this.allTodos.concat(newTodo);
        this.addActions(todoActions.CREATE, [newTodo.ID], [newTodo]);
        this.runStateChangeHandler();
        return true;
      })
      .catch((e) => {
        showSnackbar(e);
        return false;
      });
  };

  deleteTodo = (id) => {
    this.mockServer
      .deleteTodoFromDatabase(id)
      .then(() => {
        const index = this.findIndexById(id);
        this.addActions(todoActions.DELETE, [id], undefined, [this.allTodos[index]]);
        this.allTodos = this.allTodos.slice(0, index).concat(this.allTodos.slice(index + 1));
        this.runStateChangeHandler();
      })
      .catch(showSnackbar);
  };

  updateTodo = (updatedTodo) => {
    const index = this.findIndexById(updatedTodo.ID);
    this.mockServer
      .updateTodoInDatabase(updatedTodo.ID, updatedTodo)
      .then(() => {
        this.addActions(
          todoActions.EDIT,
          [updatedTodo.ID],
          [{ ...updatedTodo }],
          [this.allTodos[index]]
        );
        this.allTodos = this.allTodos
          .slice(0, index)
          .concat(updatedTodo, this.allTodos.slice(index + 1));
        this.runStateChangeHandler();
      })
      .catch(showSnackbar);
  };

  getOldTodos = () => {
    return this.currentlySelected.map((id) => {
      return { ...this.allTodos[this.findIndexById(id)] };
    });
  };

  toggleCompletionInBulk = (updatedTodos) => {
    const oldTodos = this.getOldTodos();
    this.mockServer
      .updateTodoInDatabase(this.currentlySelected, updatedTodos)
      .then(() => {
        this.currentlySelected.forEach((id, i) => {
          const index = this.findIndexById(id);
          this.allTodos = this.allTodos
            .slice(0, index)
            .concat({ ...updatedTodos[i] }, this.allTodos.slice(index + 1));
        });
        this.addActions(todoActions.EDIT, [...this.currentlySelected], updatedTodos, oldTodos);
        this.currentlySelected = [];
        this.runStateChangeHandler();
      })
      .catch(showSnackbar);
  };

  getDeletedTodos = () => {
    const deletedTodos = [];
    this.currentlySelected.forEach((id) => {
      const index = this.findIndexById(id);
      deletedTodos.push({
        ...this.allTodos[index],
      });
      this.allTodos = this.allTodos.slice(0, index).concat(this.allTodos.slice(index + 1));
    });
    return deletedTodos;
  };

  deleteTodoInBulk = () => {
    this.mockServer
      .deleteTodoFromDatabase(this.currentlySelected)
      .then(() => {
        const deletedTodos = this.getDeletedTodos();
        this.addActions(todoActions.DELETE, [...this.currentlySelected], undefined, deletedTodos);
        this.currentlySelected = [];
        this.runStateChangeHandler();
      })
      .catch(showSnackbar);
  };

  // undo redo handlers for perticular action stored in history content.
  onCreate = (action, isUndo) => {
    this.mockServer
      .deleteTodoFromDatabase(action.Ids)
      .then(() => {
        const allTodos = [...this.allTodos];
        action.Ids.forEach((id) => {
          const index = this.findIndexById(id);
          this.allTodos = this.allTodos.slice(0, index).concat(this.allTodos.slice(index + 1));
        });
        this.allTodos = allTodos;
        isUndo ? this.position-- : this.position++;
        this.runStateChangeHandler();
      })
      .catch(showSnackbar);
  };

  onDelete = (action, isUndo) => {
    const todosToBeCreated = isUndo ? action.oldTodos : action.UpdatedTodos;
    this.mockServer
      .createTodoInDatabase(todosToBeCreated)
      .then(() => {
        todosToBeCreated.forEach((todo, i) => {
          const index = this.findIndexToInsert(action.Ids[i]);
          this.allTodos = this.allTodos.slice(0, index).concat(todo, this.allTodos.slice(index));
        });
        isUndo ? this.position-- : this.position++;
        this.runStateChangeHandler();
      })
      .catch(showSnackbar);
  };

  onEdit = (action, isUndo) => {
    const todosForUpdation = isUndo ? action.oldTodos : action.UpdatedTodos;
    this.mockServer
      .updateTodoInDatabase(action.Ids, todosForUpdation)
      .then(() => {
        action.Ids.forEach((id, i) => {
          const index = this.findIndexById(id);
          this.allTodos = this.allTodos
            .slice(0, index)
            .concat(todosForUpdation[i], this.allTodos.slice(index + 1));
        });
        isUndo ? this.position-- : this.position++;
        this.runStateChangeHandler();
      })
      .catch(showSnackbar);
  };
}
