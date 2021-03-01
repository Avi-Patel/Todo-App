import { AnalyticsUpdater } from "./views/Analytics.js";
import createTodo from "./views/createTodo.js";
import { displayTodos } from "./views/displayTodos.js";
import filterPanel from "./views/filterPanel.js";

const analyticsUpdater = new AnalyticsUpdater();

const updateHeaderDate = () =>
  (document.querySelector(
    "#headerDate"
  ).textContent = `${new Date().toDateString()}`);

const bindUndo = (callback) => {
  window.addEventListener("keypress", (event) => {
    if (event.ctrlKey && event.key === "z") {
      console.log("undo event");
      // this.todoActionHandlers.clearSelection();
      callback();
    }
  });
};

const bindRedo = (callback) => {
  window.addEventListener("keypress", (event) => {
    if (event.ctrlKey && event.key === "r") {
      console.log("redo event");
      // this.todoActionHandlers.clearSelection();
      callback();
    }
  });
};

export default {
  updateHeaderDate,
  bindUndo,
  bindRedo,
  analyticsUpdater,
  displayTodos,
  bindAddTodo: createTodo.bindAddTodo,
  bindFilterUpdate: filterPanel.bindFilterUpdate,
  bindCheckBoxUpdate: filterPanel.bindCheckBoxUpdate,
  bindSearchBoxUpdate: filterPanel.bindSearchBoxUpdate,
};
