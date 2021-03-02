import { createMockServer } from "./Mock-Server.js";
import { showSnackbar } from "./helper-functions.js";
import { todoActions } from "./consts.js";

export class Model {
  constructor() {
    this.allTodos = [];
    this.currentlySelected = [];
    this.counter = 0;
    this.filterData = {
      urgencyFilterMask: Array(3).fill(false), // true/false
      categoryFilterMask: Array(3).fill(false),
      notCompletedCheckBox: false,
      searchedText: "",
    };
    this.position = -1;
    this.actions = [];
    this.mockServer = createMockServer();
  }

  bindStateChangeHandler = (callback) => (this.stateChangeHandler = callback);
  runStateChangeHandler = () => {
    this.stateChangeHandler(
      this.allTodos,
      this.currentlySelected,
      this.filterData
    );
  };

  //utilities for accessing model data

  getCounter = () => this.counter;
  setCounter = (newCounter) => (this.counter = newCounter);

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
    (this.currentlySelected = [...newSelectedIds]); //

  getCurrentlySelected = () => this.currentlySelected;

  insertTodoAtAnyIndex = (index, todo) => this.allTodos.splice(index, 0, todo);

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

  updateFilter = (urgencyOrCategory, index) => {
    if (urgencyOrCategory === "urgency") {
      const urgencyFilterMask = this.filterData.urgencyFilterMask;
      urgencyFilterMask[index] = !urgencyFilterMask[index];
      this.filterData = { ...this.filterData, urgencyFilterMask };
    } else {
      const categoryFilterMask = this.filterData.categoryFilterMask;
      categoryFilterMask[index] = !categoryFilterMask[index];
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

  addTodo = (todo) => {
    this.mockServer
      .createTodoInDatabase([todo])
      .then(() => {
        this.allTodos = this.allTodos.concat(todo);
        this.setCounter(this.getCounter() + 1);
        this.addActions(todoActions.CREATE, [todo.ID], [todo]);
        this.runStateChangeHandler();
      })
      .catch((e) => {
        showSnackbar(e);
      });
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

  replaceTodoAtAnyIndex = (index, todo) => {
    this.mockServer
      .updateTodoInDatabase([todo.ID], [todo])
      .then(() => {
        this.addActions(
          todoActions.EDIT,
          [todo.ID],
          [todo],
          [this.allTodos[index]]
        );
        this.allTodos = this.allTodos
          .slice(0, index)
          .concat({ ...todo }, this.allTodos.slice(index + 1));
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

  toggleCompletionInBulk = () => {
    const todosForUpdation = this.getTodosFromIdsForCompletion();
    const oldTodos = [];
    this.mockServer
      .updateTodoInDatabase(this.currentlySelected, todosForUpdation)
      .then(() => {
        this.currentlySelected.forEach((id, i) => {
          const index = this.findIndexById(id);
          oldTodos.push({ ...this.allTodos[index] });
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

  deleteTodoInBulk = () => {
    this.mockServer
      .deleteTodoFromDatabase(this.currentlySelected)
      .then(() => {
        const deletedTodos = [];
        this.currentlySelected.forEach((id) => {
          deletedTodos.push({
            ...this.allTodos[this.findIndexById(id)],
          });
          this.allTodos.splice(this.findIndexById(id), 1);
        });
        console.log(deletedTodos);
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
        action.Ids.forEach((id) => {
          this.allTodos.splice(this.findIndexById(id));
        });
        isUndo ? this.position-- : this.position++;
        this.runStateChangeHandler();
      })
      .catch((e) => showSnackbar(e));
  };

  onDelete = (action, isUndo) => {
    console.log(action);
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
