import { AnalyticsUpdater } from "./views/Analytics.js";
import createTodoForm from "./views/createTodoForm.js";
import { displayTodos } from "./views/displayTodos.js";
import { FilterPanel } from "./views/filterPanel.js";
import { showSnackbar } from "./helper-functions.js";

export class View {
  constructor(handlerConfig) {
    this.handlerConfig = handlerConfig;
    this.displayTodos = displayTodos;
    this.resetValuesInCreateTodoBox = createTodoForm.resetValuesInCreateTodoBox;
    this.analyticsUpdater = new AnalyticsUpdater();
    this.filterPanel = new FilterPanel(handlerConfig.filterPanelHandlers);

    this.initializeView();
    this.applyDOMEventListeners();
  }

  applyDOMEventListeners = () => {
    createTodoForm.bindCreateTodo(this.handlerConfig.createTodo);

    window.addEventListener("keypress", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        this.handlerConfig.undoRedoHandlers.undo();
        event.preventDefault();
      }
    });

    window.addEventListener("keypress", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "y") {
        this.handlerConfig.undoRedoHandlers.redo();
        event.preventDefault();
      }
    });

    document.querySelector("#complete-selection").addEventListener("click", () => {
      const noTodosSelected = this.handlerConfig.selectionHandlers.toggleBulkCompletion();
      if (noTodosSelected) {
        showSnackbar("No Todos selected");
      }
    });

    document
      .querySelector("#clear-selection")
      .addEventListener("click", this.handlerConfig.selectionHandlers.clearSelection);

    document.querySelector("#delete-selection").addEventListener("click", () => {
      const noTodosSelected = this.handlerConfig.selectionHandlers.deleteSelectedTodos();
      if (noTodosSelected) {
        showSnackbar("No Todos selected");
      }
    });

    window.addEventListener("beforeunload", () => {
      this.handlerConfig.DOMUnloadHandler();
    });
  };

  initializeView = () => {
    document.querySelector("#headerDate").textContent = `${new Date().toDateString()}`;
  };
}
