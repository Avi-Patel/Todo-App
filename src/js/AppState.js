import { createAndAddTodo } from "./create-todo.js";
import { showSnackbar } from "./otherFunctions.js";
import { createMockServer } from "./model/Mock-Server.js";
import { history } from "./model/history.js";
import { todoActionHandlers } from "./todo-action-handlers.js";
import { urgency, category, color, categoryIcon } from "./consts.js";
import { FilterPanel } from "./view/filter-panel.js";
import { createLocalDatabase } from "./model/Local-Database.js";
import { AnalyticsUpdater } from "./Analytics.js";
import { filterCheckerOnTodo } from "./filter-checker-on-todo.js";
import { createTodoNode } from "./view/create-todo-node.js";
export class TodoAppState {
  constructor() {
    this.filterData = {
      urgencyFilterMask: [0, 0, 0],
      categoryFilterMask: [0, 0, 0],
      notCompletedCheckBox: false,
      searchedText: "",
    };
    this.urgencyIconColors = [color.GREEN, color.YELLOW, color.RED];
    this.categoryIcons = [
      categoryIcon.USERALT,
      categoryIcon.BOOKOPEN,
      categoryIcon.USERS,
    ];

    this.filterPanel = new FilterPanel({
      filterHandlers: this.render,
      urgency,
      category,
    });
    this.filterChecker = filterCheckerOnTodo(this.filterPanel.filterData);
    this.analyticsUpdater = new AnalyticsUpdater();
    this.localData = new createLocalDatabase();

    this.mockServer = createMockServer();

    this.history = history(this.mockServer, this.localData, this.render);

    this.todoActionHandlers = todoActionHandlers({
      mockServer: this.mockServer,
      localData: this.localData,
      history: this.history,
      render: this.render,
    });

    this.DOMElements = {
      todoAddBtn: document.querySelector("#todo-add-btn"),
      completeSelection: document.querySelector("#complete-selection"),
      clearSelection: document.querySelector("#clear-selection"),
      deleteSelection: document.querySelector("#delete-selection"),
      todosBox: document.querySelector("#todos-box"),
    };

    this.updateHeaderDate();
    this.setEventListeners();
  }

  setAnalytics = (numberOfCompletedTodos, numberOfTotalTodos) => {
    this.analyticsUpdater.analytics.setNumberOfCompletedTodos(
      numberOfCompletedTodos
    );
    this.analyticsUpdater.analytics.setNumberOfTotalTodos(numberOfTotalTodos);
  };

  displayTodos = () => {
    let numberOfCompletedTodos = 0,
      numberOfTotalTodos = 0;

    this.DOMElements.todosBox.innerHTML = "";

    this.localData.allTodos.forEach((todoItem) => {
      const conditionSatisfied =
        this.filterChecker.checkWithFilter(todoItem) &&
        this.filterChecker.containSearchedWord(todoItem.title);

      if (conditionSatisfied) {
        numberOfTotalTodos++;
        if (todoItem.completed) {
          numberOfCompletedTodos++;
        }
        const newtodoNode = createTodoNode(
          todoItem,
          this.localData,
          this.todoActionHandlers
        );
        this.DOMElements.todosBox.appendChild(newtodoNode);
      }
    });
    this.localData.emptyCurrentSelectedArray();
    this.setAnalytics(numberOfCompletedTodos, numberOfTotalTodos);
    this.analyticsUpdater.updateAnalyticsOnView();
  };

  render = () => {
    this.displayTodos();
  };

  updateHeaderDate = () =>
    (document.querySelector(
      "#headerDate"
    ).textContent = `${new Date().toDateString()}`);

  setEventListeners = () => {
    window.addEventListener("keypress", (event) => {
      if (event.ctrlKey && event.key === "z") {
        console.log("undo event");
        this.todoActionHandlers.clearSelection();
        this.history.undo();
      } else if (event.ctrlKey && event.key === "r") {
        console.log("redo event");
        this.todoActionHandlers.clearSelection();
        this.history.redo();
      }
    });
    this.DOMElements.todoAddBtn.addEventListener("click", () => {
      console.log(this.localData);
      createAndAddTodo({
        mockServer: this.mockServer,
        localData: this.localData,
        history: this.history,
        render: this.render,
      });
    });
    this.DOMElements.completeSelection.addEventListener("click", () =>
      this.localData.getCurrentSelected().length !== 0
        ? this.todoActionHandlers.completeAllSelectedTodos()
        : showSnackbar("No Todos selected")
    );

    this.DOMElements.clearSelection.addEventListener("click", () =>
      this.localData.getCurrentSelected().length !== 0
        ? this.todoActionHandlers.clearSelection()
        : showSnackbar("No Todos selected")
    );
    this.DOMElements.deleteSelection.addEventListener("click", () =>
      this.localData.getCurrentSelected().length !== 0
        ? this.todoActionHandlers.deleteAllSelectedTodos()
        : showSnackbar("No Todos selected")
    );
  };
}
