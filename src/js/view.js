import { AnalyticsUpdater } from "./views/Analytics.js";
import createTodo from "./views/createTodo.js";
import { displayTodos } from "./views/displayTodos.js";
import filterPanel from "./views/filterPanel.js";
import { showSnackbar } from "./helper-functions.js";

const analyticsUpdater = new AnalyticsUpdater();

const updateHeaderDate = () =>
  (document.querySelector(
    "#headerDate"
  ).textContent = `${new Date().toDateString()}`);

const bindUndo = (undoHandler) => {
  window.addEventListener("keypress", (event) => {
    if (event.ctrlKey && event.key === "z") {
      console.log("undo event");
      undoHandler();
    }
  });
};

const bindRedo = (redoHandler) => {
  window.addEventListener("keypress", (event) => {
    if (event.ctrlKey && event.key === "r") {
      console.log("redo event");
      redoHandler();
    }
  });
};

const bindToggleCompletionOfSelection = (toggleBulkCompletion) => {
  document
    .querySelector("#complete-selection")
    .addEventListener("click", () => {
      const noTodosSelected = toggleBulkCompletion();
      if (noTodosSelected) {
        showSnackbar("No Todos selected");
      }
    });
};

const bindClearSelection = (clearSelection) => {
  document
    .querySelector("#clear-selection")
    .addEventListener("click", () => clearSelection());
};

const bindDeleteSelectedTodos = (deleteSelectedTodos) => {
  document.querySelector("#delete-selection").addEventListener("click", () => {
    const noTodosSelected = deleteSelectedTodos();
    if (noTodosSelected) {
      showSnackbar("No Todos selected");
    }
  });
};

// const bindInitialisation = (callback) => {
//   document.addEventListener("DOMContentLoaded", () => {
//     console.log("loading data");
//     callback();
//   });
// };

const bindActionOnUnload = (handleUnloadEvent) => {
  window.addEventListener("beforeunload", () => {
    console.log("Saving data");
    handleUnloadEvent();
  });
};

export default {
  updateHeaderDate,
  // bindInitialisation,
  bindActionOnUnload,
  bindUndo,
  bindRedo,
  analyticsUpdater,
  displayTodos,
  bindAddTodo: createTodo.bindAddTodo,
  bindFilterUpdate: filterPanel.bindFilterUpdate,
  bindCheckBoxUpdate: filterPanel.bindCheckBoxUpdate,
  bindSearchBoxUpdate: filterPanel.bindSearchBoxUpdate,
  bindClearSearchBtn: filterPanel.bindClearSearchBtn,
  bindToggleCompletionOfSelection,
  bindClearSelection,
  bindDeleteSelectedTodos,
};
