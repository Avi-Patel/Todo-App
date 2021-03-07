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

const bindUndo = (callback) => {
  window.addEventListener("keypress", (event) => {
    if (event.ctrlKey && event.key === "z") {
      console.log("undo event");
      callback();
    }
  });
};

const bindRedo = (callback) => {
  window.addEventListener("keypress", (event) => {
    if (event.ctrlKey && event.key === "r") {
      console.log("redo event");
      callback();
    }
  });
};

const bindToggleCompletionOfSelection = (callback) => {
  document
    .querySelector("#complete-selection")
    .addEventListener("click", () => {
      if (callback()) {
        showSnackbar("No Todos selected");
      }
    });
};

const bindClearSelection = (callback) => {
  document
    .querySelector("#clear-selection")
    .addEventListener("click", () => callback());
};

const bindDeleteSelectedTodos = (callback) => {
  document.querySelector("#delete-selection").addEventListener("click", () => {
    if (callback()) {
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

const bindActionOnUnload = (callback) => {
  window.addEventListener("beforeunload", () => {
    console.log("Saving data");
    callback();
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
