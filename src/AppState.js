import { createAndAddTodo } from "/src/createFunctions.js";
import { showSnackbar } from "/src/otherFunctions.js";
import { createMockServer } from "/src/server.js";
import { historyActions } from "./history.js";
import { todoActionHandlers } from "./operationsOnToDo.js";
import { TodoRenderHandlers } from "./renderFunction.js";
import { urgency, category, color, categoryIcon } from "./consts.js";
import { FilterPanel } from "./FilterPanel.js";
import { createLocalDatabase } from "./Local-Database.js";

export class TodoAppState {
  constructor() {
    this.filterData = {
      urgencyFilterMask: [0, 0, 0],
      categoryFilterMask: [0, 0, 0],
      notCompletedCheckBox: false,
      searchedText: "",
    };

    this.mockServrer = createMockServer();
    this.localDataInAppState = new createLocalDatabase();
    this.histroyActions = historyActions(
      this.mockServrer,
      this.localDataInAppState
    );

    this.todoActionHandlers = todoActionHandlers({
      mockServrer: this.mockServrer,
      localData: this.localDataInAppState,
      historyActions: this.historyActions,
      render: this.render,
    });

    this.filterPanel = new FilterPanel({
      filterHandlers: this.render,
      urgency,
      category,
    });
    this.todoRenderHandlers = new TodoRenderHandlers({
      todoActionHandlers: this.todoActionHandlers,
      localData: this.localDataInAppState,
      filterData: this.filterPanel.filterData,
      color,
      categoryIcon,
    });

    this.DOMElements = {
      todoAddBtn: document.querySelector("#TDaddBtn"),
      completeSelection: document.querySelector("#completeSelection"),
      clearSelection: document.querySelector("#clearSelection"),
      deleteSelection: document.querySelector("#deleteSelection"),
    };

    this.updateHeaderDate();
    this.addEventListeners();
  }

  render = () => {
    this.todoRenderHandlers.displayToDos();
  };

  updateHeaderDate = () =>
    (document.querySelector(
      "#headerDate"
    ).textContent = `${new Date().toDateString()}`);

  filterHandlers = () => {
    // this.filterData = newFilterData;
    console.log(this.filterData);
    this.render();
  };

  addEventListeners = () => {
    window.addEventListener("keypress", (event) => {
      if (event.ctrlKey && event.key === "z") {
        console.log("undo event");
        this.todoActionHandlers.clearSelection();
        this.histroyActions.undo();
      } else if (event.ctrlKey && event.key === "r") {
        console.log("redo event");
        this.todoActionHandlers.clearSelection();
        this.histroyActions.redo();
      }
    });
    this.DOMElements.todoAddBtn.addEventListener("click", () => {
      console.log(this.localDataInAppState);
      createAndAddTodo({
        mockServer: this.mockServrer,
        localData: this.localDataInAppState,
        historyActions: this.histroyActions,
        render: this.render,
      });
    });
    this.DOMElements.completeSelection.addEventListener("click", () =>
      this.localDataInAppState.curOnScreenSelected.length !== 0
        ? this.todoActionHandlers.completeAllSelectedTodos()
        : showSnackbar("No ToDos selected")
    );

    this.DOMElements.clearSelection.addEventListener("click", () =>
      this.localDataInAppState.curOnScreenSelected.length !== 0
        ? this.todoActionHandlers.clearSelection()
        : showSnackbar("No ToDos selected")
    );
    this.DOMElements.deleteSelection.addEventListener("click", () =>
      this.localDataInAppState.curOnScreenSelected.length !== 0
        ? this.todoActionHandlers.deleteAllSelectedToDos()
        : showSnackbar("No ToDos selected")
    );
  };
}
