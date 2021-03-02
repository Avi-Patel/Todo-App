import { createMockServer } from "./Mock-Server.js";
import { showSnackbar } from "./helper-functions.js";
import { historyActionsHandlers } from "./history-actions-handlers.js";
import { commands } from "./consts.js";

export class Model {
  constructor() {
    this.allTodos = [];
    this.currentlySelected = [];
    this.counter = 0;
    this.filterData = {
      urgencyFilterMask: [0, 0, 0],
      categoryFilterMask: [0, 0, 0],
      notCompletedCheckBox: false,
      searchedText: "",
    };
    this.position = -1;
    this.actions = [];
    this.mockServer = createMockServer();
    this.undoRedoHandlers = historyActionsHandlers(
      [...this.allTodos],
      this.mockServer,
      this.stateChangeHandler
    );
  }

  bindStateChangeHandler = (callback) => (this.stateChangeHandler = callback);

  getCounter = () => this.counter;
  setCounter = (newCounter) => (this.counter = newCounter);

  getPosition = () => this.position;
  setPosition = (newPosition) => (this.position = newPosition);

  getActions = () => this.actions;

  getTodo = (index) => this.allTodos[index];

  getIndexInLocalData = (id) => {
    let index;
    this.allTodos.forEach((todo, i) => {
      if (todo.ID === id) index = i;
    });
    return index;
  };

  removeCurrentlySelectedIds = () => {
    this.currentlySelected = [];
    this.stateChangeHandler(
      this.allTodos,
      this.currentlySelected,
      this.filterData
    );
  };

  setCurrentlySelected = (newSelectedIds) =>
    (this.currentlySelected = [...newSelectedIds]);

  getCurrentlySelected = () => this.currentlySelected;

  insertTodoAtAnyIndex = (index, todo) => this.allTodos.splice(index, 0, todo);

  emptyAllTodosArray = () => (this.allTodos.length = 0);

  addActions = (commandType, todoIDs, todos, oldTodos) => {
    this.actions.splice(this.position + 1, this.actions.length);
    const newAction = {
      command: commandType,
      IDs: todoIDs,
    };
    if (todos) {
      newAction["todos"] = todos;
    }
    if (oldTodos) {
      newAction["oldTodos"] = oldTodos;
    }
    this.actions.push(newAction);
    this.position++;
  };

  toggleIdFromSelected = (id) => {
    const indexInSelected = this.currentlySelected.indexOf(id);
    if (indexInSelected === -1) {
      this.currentlySelected = this.currentlySelected.concat(id);
    } else {
      this.currentlySelected.splice(indexInSelected, 1);
    }
    this.stateChangeHandler(
      this.allTodos,
      this.currentlySelected,
      this.filterData
    );
  };

  updateFilter = (urgencyOrCategory, index) => {
    if (urgencyOrCategory === "urgency") {
      this.filterData.urgencyFilterMask[index] ^= 1;
    } else {
      this.filterData.categoryFilterMask[index] ^= 1;
    }
    this.stateChangeHandler(
      this.allTodos,
      this.currentlySelected,
      this.filterData
    );
  };

  updateCheckBoxStatus = (isChecked) => {
    const newFilterData = { ...this.filterData };
    newFilterData.notCompletedCheckBox = isChecked;
    this.filterData = newFilterData;
    this.stateChangeHandler(
      this.allTodos,
      this.currentlySelected,
      this.filterData
    );
  };

  updateSearchedInput = (newSearchedText) => {
    const newFilterData = { ...this.filterData };
    newFilterData.searchedText = newSearchedText;
    this.filterData = newFilterData;
    this.stateChangeHandler(
      this.allTodos,
      this.currentlySelected,
      this.filterData
    );
  };

  addTodo = (todo) => {
    this.mockServer
      .createTodoInDatabase([todo])
      .then(() => {
        this.allTodos = this.allTodos.concat(todo);
        this.setCounter(this.getCounter() + 1);
        this.addActions(commands.CREATE, [todo.ID], [{ ...todo }]);
        this.stateChangeHandler(
          this.allTodos,
          this.currentlySelected,
          this.filterData
        );
        // document.querySelector("#todo-title").value = "";
      })
      .catch((e) => {
        showSnackbar(e);
      });
  };

  deleteTodo = (id) => {
    this.mockServer
      .deleteTodoFromDatabase([id])
      .then(() => {
        const index = this.getIndexInLocalData(id);
        this.addActions(commands.DELETE, [id], undefined, [
          { ...localData.getTodo(index) },
        ]);
        this.allTodos = this.allTodos
          .slice(0, index)
          .concat(this.allTodos.slice(index + 1));
        this.stateChangeHandler(
          this.allTodos,
          this.currentlySelected,
          this.filterData
        );
      })
      .catch((e) => showSnackbar(e));
  };

  replaceTodoAtAnyIndex = (index, todo) => {
    this.mockServer
      .updateTodoInDatabase([todo.ID], [todo])
      .then(() => {
        this.allTodos = this.allTodos
          .slice(0, index)
          .concat({ ...todo }, this.allTodos.slice(index + 1));
        this.addActions(
          commands.EDIT,
          [todo.ID],
          [{ ...returnedTodo }],
          [{ ...todo }]
        );
        this.stateChangeHandler(
          this.allTodos,
          this.currentlySelected,
          this.filterData
        );
      })
      .catch((e) => showSnackbar(e));
  };

  getTodosFromIdsForCompletion = () => {
    return this.currentlySelected.map((id) => {
      const todo = { ...this.allTodos[this.getIndexInLocalData(id)] };
      todo.completed = !todo.completed;
      return todo;
    });
  };

  toggleCompletionInBulk = () => {
    const todosForUpdation = this.getTodosFromIdsForCompletion();
    this.mockServer
      .updateTodoInDatabase(this.currentlySelected, todosForUpdation)
      .then(() => {
        this.currentlySelected.forEach((id, i) => {
          const index = this.getIndexInLocalData(id);
          this.allTodos = this.allTodos
            .slice(0, index)
            .concat(todosForUpdation[i], this.allTodos.slice(index + 1));
        });
        this.addActions(commands.ALTER_COMPLETION_IN_BULK, [
          ...this.currentlySelected,
        ]);
        this.currentlySelected = [];
        this.stateChangeHandler(
          this.allTodos,
          this.currentlySelected,
          this.filterData
        );
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
            ...this.allTodos.splice(this.getIndexInLocalData(id), 1),
          });
        });
        this.addActions(
          commands.DELETE_IN_BULK,
          [...this.currentlySelected],
          undefined,
          deletedTodos
        );
        this.currentlySelected = [];
        this.stateChangeHandler(
          this.allTodos,
          this.currentlySelected,
          this.filterData
        );
      })
      .catch((e) => showSnackbar(e));
  };
}
