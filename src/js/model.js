import { createMockServer } from "./mockServer.js";
import { showSnackbar } from "./helper-functions.js";
import {
  todoActions,
  filterNames,
  urgency,
  category,
  INVALID_POSITION,
} from "./constants.js";

export class Model {
  constructor() {
    this.allTodos = [];
    this.currentlySelected = [];
    this.filterData = {
      urgencyFilterMask: {
        [urgency.LOW]: false,
        [urgency.MEDIUM]: false,
        [urgency.HIGH]: false,
      }, // true/false
      categoryFilterMask: {
        [category.PERSONAL]: false,
        [category.ACADEMIC]: false,
        [category.SOCIAL]: false,
      },
      notCompletedCheckBox: false,
      searchedText: "",
    };
    this.position = INVALID_POSITION;
    this.actions = [];
    this.mockServer = createMockServer();
  }

  bindStateChangeHandler = (render) => (this.stateChangeHandler = render);
  runStateChangeHandler = () => {
    this.stateChangeHandler(
      this.allTodos,
      this.currentlySelected,
      this.filterData
    );
  };

  //utilities for accessing model data
  getPosition = () => this.position;
  setPosition = (newPosition) => (this.position = newPosition);

  getActions = () => this.actions;

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

  setCurrentlySelected = (newSelectedIds) =>
    (this.currentlySelected = newSelectedIds);

  getCurrentlySelected = () => this.currentlySelected;

  insertTodoAtIndex = (index, todo) => this.allTodos.splice(index, 0, todo);

  emptyAllTodosArray = () => (this.allTodos.length = 0);

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
  addActions = (commandType, todoIds, todos, oldTodos) => {
    this.actions = this.actions.slice(0, this.position + 1);
    const newAction = {
      command: commandType,
      Ids: todoIds,
    };
    if (todos) {
      newAction["todos"] = todos;
    }
    if (oldTodos) {
      newAction["oldTodos"] = oldTodos;
    }
    this.actions = this.actions.concat(newAction);
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
    this.runStateChangeHandler();
  };

  updateCheckBoxStatus = (isChecked) => {
    this.filterData = { ...this.filterData, notCompletedCheckBox: isChecked };
    this.runStateChangeHandler();
  };

  updateSearchedInput = (newSearchedText) => {
    //
    this.filterData = { ...this.filterData, searchedText: newSearchedText };
    this.runStateChangeHandler();
  };

  storeTodos = () => {
    this.mockServer.storeTodosToDatabase().catch((e) => showSnackbar(e));
  };

  fetchTodos = () => {
    this.mockServer
      .getTodosFromDatabase()
      .then((todos) => {
        this.allTodos = todos;
        this.runStateChangeHandler();
      })
      .catch((e) => showSnackbar(e));
  };

  addTodo = (todo) => {
    this.mockServer
      .createTodoInDatabase([todo])
      .then(() => {
        this.allTodos = this.allTodos.concat(todo);
        this.addActions(todoActions.CREATE, [todo.ID], [todo]);
        this.runStateChangeHandler();
      })
      .catch((e) => showSnackbar(e));
  };

  deleteTodo = (id) => {
    this.mockServer
      .deleteTodoFromDatabase([id])
      .then(() => {
        const index = this.findIndexById(id);
        this.addActions(todoActions.DELETE, [id], undefined, [
          this.allTodos[index],
        ]);
        this.allTodos = this.allTodos
          .slice(0, index)
          .concat(this.allTodos.slice(index + 1));
        this.runStateChangeHandler();
      })
      .catch((e) => showSnackbar(e));
  };

  updateTodo = (updatedTodo) => {
    const index = this.findIndexById(updatedTodo.ID);
    this.mockServer
      .updateTodoInDatabase([updatedTodo.ID], [updatedTodo])
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
      .catch((e) => showSnackbar(e));
  };

  getTodosFromIdsForCompletion = () => {
    return this.currentlySelected.map((id) => {
      const todo = this.allTodos[this.findIndexById(id)];
      const updatedTodo = { ...todo, completed: !todo.completed };
      return updatedTodo;
    });
  };

  getOldTodosAndUpdatedTodos = () => {
    const oldTodos = [];
    const updatedTodos = [];
    this.currentlySelected.forEach((id) => {
      const todo = this.allTodos[this.findIndexById(id)];
      oldTodos.push({ ...todo });
      updatedTodos.push({ ...todo, completed: !todo.completed });
    });
    return [oldTodos, updatedTodos];
  };

  toggleCompletionInBulk = () => {
    const [oldTodos, todosForUpdation] = this.getOldTodosAndUpdatedTodos();
    this.mockServer
      .updateTodoInDatabase(this.currentlySelected, todosForUpdation)
      .then(() => {
        this.currentlySelected.forEach((id, i) => {
          const index = this.findIndexById(id);
          this.allTodos = this.allTodos
            .slice(0, index)
            .concat(todosForUpdation[i], this.allTodos.slice(index + 1));
        });
        this.addActions(
          todoActions.EDIT,
          [...this.currentlySelected],
          todosForUpdation,
          oldTodos
        );
        this.currentlySelected = [];
        this.runStateChangeHandler();
      })
      .catch((e) => showSnackbar(e));
  };

  getDeletedTodos = () => {
    const deletedTodos = [];
    this.currentlySelected.forEach((id) => {
      deletedTodos.push({
        ...this.allTodos[this.findIndexById(id)],
      });
      const index = this.findIndexById(id);
      this.allTodos = this.allTodos
        .slice(0, index)
        .concat(this.allTodos.slice(index + 1));
    });
    return deletedTodos;
  };

  deleteTodoInBulk = () => {
    this.mockServer
      .deleteTodoFromDatabase(this.currentlySelected)
      .then(() => {
        const deletedTodos = this.getDeletedTodos();
        this.addActions(
          todoActions.DELETE,
          [...this.currentlySelected],
          undefined,
          deletedTodos
        );
        this.currentlySelected = [];
        this.runStateChangeHandler();
      })
      .catch((e) => showSnackbar(e));
  };

  // undo redo handlers for perticular action stored in history content.
  onCreate = (action, isUndo) => {
    this.mockServer
      .deleteTodoFromDatabase(action.Ids)
      .then(() => {
        const allTodos = [...this.allTodos];
        action.Ids.forEach((id) => {
          const index = this.findIndexById(id);
          this.allTodos = this.allTodos
            .slice(0, index)
            .concat(this.allTodos.slice(index + 1));
        });
        this.allTodos = allTodos;
        isUndo ? this.position-- : this.position++;
        this.runStateChangeHandler();
      })
      .catch((e) => showSnackbar(e));
  };

  onDelete = (action, isUndo) => {
    const todosForToBeCreated = isUndo ? action["oldTodos"] : action["todos"];
    this.mockServer
      .createTodoInDatabase(todosForToBeCreated)
      .then(() => {
        todosForToBeCreated.forEach((todo, i) => {
          const index = this.findIndexToInsert(action.Ids[i]);
          this.allTodos = this.allTodos
            .slice(0, index)
            .concat(todo, this.allTodos.slice(index));
        });
        isUndo ? this.position-- : this.position++;
        this.runStateChangeHandler();
      })
      .catch((e) => showSnackbar(e));
  };

  onEdit = (action, isUndo) => {
    const todosForUpdation = isUndo ? action["oldTodos"] : action["todos"];
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
      .catch((e) => showSnackbar(e));
  };
}
