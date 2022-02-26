import { createMockServer } from "./mockServer.js";
import { showSnackbar } from "./helper-functions.js";
import { todoActions, filterNames, INVALID_POSITION } from "./constants.js";

export class Model {
  constructor(render) {
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
    this.render = render;
  }
  runStateChangeHandler = () => {
    this.render(this.allTodos, this.currentlySelected, this.filterData);
  };

  //utilities for accessing model data
  getPosition = () => this.position;
  getActionsHistory = () => this.actionsHistory;
  getTodo = (index) => this.allTodos[index];

  findIndexById = (id) => this.allTodos.findIndex((todo) => todo.id === id);

  removeCurrentlySelectedIds = () => {
    this.currentlySelected = [];
    this.runStateChangeHandler();
  };

  getCurrentlySelected = () => this.currentlySelected;

  findIndexToInsert = (id, todos) => {
    let index = todos.findIndex((todo, i) => todo.id > id && i > 0 && todos[i - 1].id < id);
    if (todos.length === 0 || id < todos[0].id) {
      index = 0;
    } else if (index === -1) {
      index = todos.length;
    }
    return index;
  };

  //adding actions done on todd to history
  addActions = (actionType, todoIds, updatedTodos, oldTodos) => {
    this.actionsHistory = this.actionsHistory.slice(0, this.position + 1);
    const newAction = {
      actionType,
      ids: todoIds,
    };
    if (updatedTodos) {
      newAction["updatedTodos"] = updatedTodos;
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

  updateFilter = (type, level) => {
    if (type === filterNames.URGENCY) {
      const urgencyFilterMask = this.filterData.urgencyFilterMask;
      urgencyFilterMask[level] = !urgencyFilterMask[level];
      this.filterData = { ...this.filterData, urgencyFilterMask };
    } else {
      const categoryFilterMask = this.filterData.categoryFilterMask;
      categoryFilterMask[level] = !categoryFilterMask[level];
      this.filterData = { ...this.filterData, categoryFilterMask };
    }
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
        this.addActions(todoActions.CREATE, [newTodo.id], [newTodo]);
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
        this.allTodos = this.allTodos.filter((todo) => todo.id !== id);
        this.runStateChangeHandler();
      })
      .catch(showSnackbar);
  };

  updateTodo = (updatedTodo) => {
    const index = this.findIndexById(updatedTodo.id);
    this.mockServer
      .updateTodoInDatabase(updatedTodo.id, updatedTodo)
      .then(() => {
        this.addActions(
          todoActions.EDIT,
          [updatedTodo.id],
          [{ ...updatedTodo }],
          [this.allTodos[index]]
        );
        this.allTodos[index] = { ...updatedTodo };
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
        this.allTodos = this.currentlySelected.reduce((acc, id, i) => {
          const index = this.findIndexById(id);
          acc[index] = { ...updatedTodos[i] };
        }, this.allTodos);
        this.addActions(todoActions.EDIT, [...this.currentlySelected], updatedTodos, oldTodos);
        this.currentlySelected = [];
        this.runStateChangeHandler();
      })
      .catch(showSnackbar);
  };

  getDeletedTodos = () => {
    const indices = this.currentlySelected.map((id) => this.findIndexById(id));
    const deletedTodos = indices.map((index) => ({ ...this.allTodos[index] }));
    this.allTodos = this.allTodos.filter(
      (todo) => this.currentlySelected.findIndex((id) => id === todo.id) === -1
    );
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
      .deleteTodoFromDatabase(action.ids)
      .then(() => {
        this.allTodos = this.allTodos.filter(
          (todo) => action.ids.findIndex((id) => id === todo.id) === -1
        );
        isUndo ? this.position-- : this.position++;
        this.runStateChangeHandler();
      })
      .catch(showSnackbar);
  };

  onDelete = (action, isUndo) => {
    const todosToBeCreated = isUndo ? action.oldTodos : action.updatedTodos;
    this.mockServer
      .createTodoInDatabase(todosToBeCreated)
      .then(() => {
        this.allTodos = todosToBeCreated.reduce(
          (acc, todo, i) => {
            const index = this.findIndexToInsert(action.ids[i], acc);
            acc = acc.slice(0, index).concat(todo, acc.slice(index));
            return acc;
          },
          [...this.allTodos]
        );
        isUndo ? this.position-- : this.position++;
        this.runStateChangeHandler();
      })
      .catch(showSnackbar);
  };

  onEdit = (action, isUndo) => {
    const todosForUpdation = isUndo ? action.oldTodos : action.updatedTodos;
    this.mockServer
      .updateTodoInDatabase(action.ids, todosForUpdation)
      .then(() => {
        this.allTodos = this.allTodos.map((todo) => {
          const index = action.ids.findIndex((id) => id === todo.id);
          if (index !== -1) {
            return todosForUpdation[index];
          }
          return todo;
        });
        isUndo ? this.position-- : this.position++;
        this.runStateChangeHandler();
      })
      .catch(showSnackbar);
  };
}
