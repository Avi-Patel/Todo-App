import { updateHeaderDate } from "/src/otherFunctions.js";
import {
  data,
  queriedElements,
  pushNewToDo,
  emptyAllTodosArray,
} from "/src/localDataAndElements.js";
import { createAndAddTodo } from "/src/createFunctions.js";
import { displayToDos } from "/src/renderFunction.js";
import {
  updateAllToCompleted,
  deleteAllSelectedToDos,
  clearSelection,
} from "/src/operationsOnToDo.js";
import { undo, redo } from "/src/history.js";
import { showSnackbar } from "/src/otherFunctions.js";
import { getToDosFromDatabase, saveToDos } from "/src/server.js";

console.log("start");
updateHeaderDate();
console.log("end");

export const extractClosestNodeFromPath = (event, type) =>
  event.target.closest(type);

export const getDocumentElementUsingSelector = (selectorString) =>
  document.querySelector(selectorString);

export const deleteDocumentElementUsingSelector = (selectorString) => {
  const element = document.querySelector(selectorString);
  element.remove();
};

export const emptyInputTextBox = (selectorValue) =>
  (getDocumentElementUsingSelector(selectorValue).value = "");

const changeBtnStyle = (target, selected) => {
  if (selected) {
    target.style.backgroundColor = "rgb(45, 45, 45)";
    target.style.boxShadow = "0px 0px 4px 2px white";
  } else {
    target.style.backgroundColor = "black";
    target.style.boxShadow = "";
  }
};

export const changeBtnStyleForSelection = (target, selected) => {
  if (selected) {
    target.style.backgroundColor = "rgb(64, 64, 255)";
    target.style.border = "1px solid white";
  } else {
    target.style.backgroundColor = "";
  }
};

const updateFilter = (event, dataFilter, dataFilterIds) => {
  let anyThingChanged = true;
  const targetButton =
    event.target.tagName === "BUTTON"
      ? event.target
      : extractClosestNodeFromPath(event, "button");

  if (!targetButton) return;

  switch (targetButton.id) {
    case dataFilterIds[0]:
      dataFilter[0] ^= 1;
      changeBtnStyle(targetButton, dataFilter[0]);
      break;
    case dataFilterIds[1]:
      dataFilter[1] ^= 1;
      changeBtnStyle(targetButton, dataFilter[1]);
      break;
    case dataFilterIds[2]:
      dataFilter[2] ^= 1;
      changeBtnStyle(targetButton, dataFilter[2]);
      break;
    default:
      anyThingChanged = false;
  }
  if (anyThingChanged) displayToDos();
};

queriedElements.TDaddBtn.addEventListener("click", () => {
  if (document.querySelector("#TDTitle").value.trim().length > 0) {
    createAndAddTodo();
  }
});

queriedElements.urgencyFilter.addEventListener("click", (event) =>
  updateFilter(event, data.urgencyFilter, data.urgencyFilterIds)
);
queriedElements.categoryFilter.addEventListener("click", (event) =>
  updateFilter(event, data.categoryFilter, data.categoryFilterIds)
);
queriedElements.completeSelection.addEventListener("click", () =>
  data.curOnScreenSelected.length !== 0
    ? updateAllToCompleted()
    : showSnackbar("No ToDos selected")
);

queriedElements.clearSelection.addEventListener("click", () =>
  data.curOnScreenSelected.length !== 0
    ? clearSelection()
    : showSnackbar("No ToDos selected")
);
queriedElements.deleteSelection.addEventListener("click", () =>
  data.curOnScreenSelected.length !== 0
    ? deleteAllSelectedToDos()
    : showSnackbar("No ToDos selected")
);

queriedElements.searchInput.addEventListener("input", (event) => {
  clearTimeout(data.timeOutID);
  data.timeOutID = setTimeout(() => displayToDos(), 500);
});
queriedElements.clearBtn.addEventListener("click", () => {
  queriedElements.searchInput.value = "";
  displayToDos();
});

queriedElements.notCompletedCheckBox.addEventListener("change", () =>
  displayToDos()
);

window.addEventListener("click", (event) => {
  if (event.target.id === "updateModal") {
    event.target.remove();
  }
});

window.addEventListener("keypress", (event) => {
  if (event.ctrlKey && event.key === "z") {
    console.log("undo event");
    clearSelection();
    undo();
  } else if (event.ctrlKey && event.key === "r") {
    console.log("redo event");
    clearSelection();
    redo();
  }
});

const setLocalData = (toDos) => {
  emptyAllTodosArray();
  toDos.forEach((toDo) => {
    pushNewToDo({ ...toDo });
    data.counter = Math.max(toDo.ID + 1, data.counter);
  });
  displayToDos();
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("loading data");
  getToDosFromDatabase()
    .then((toDos) => {
      if (toDos.length > 0) {
        setLocalData(toDos);
      }
    })
    .catch((e) => showSnackbar(e));
});

window.addEventListener("beforeunload", () => {
  console.log("Saving data");
  saveToDos().catch((e) => showSnackbar(e));
});
