import {
  data,
  queriedElements,
  emptyCurrentSelectedArray,
} from "/src/localDataAndElements.js";
import { checkWithFilter, containSearchedWord } from "/src/filter.js";
import {
  alterCompletionOfToDo,
  addOrRemoveFromSelected,
  deleteToDo,
  editToDo,
} from "/src/operationsOnToDo.js";
import { updateAnalytics } from "/src/analytics.js";
import { createToDoNode } from "/src/createFunctions.js";
import {
  getDocumentElementUsingSelector,
  extractClosestNodeFromPath,
} from "/src/index.js";
import { commands } from "/src/consts.js";

const addListenerForToDo = (newToDo) => {
  newToDo.addEventListener("click", (event) => {
    const targetButton =
      event.target.tagName === "BUTTON"
        ? event.target
        : extractClosestNodeFromPath(event, "button");

    if (!targetButton) return;

    const id = parseInt(newToDo.dataset.id);
    switch (targetButton.dataset.type) {
      case commands.MARKCOMPLETED:
        alterCompletionOfToDo(id);
        break;
      case commands.SELECT:
        addOrRemoveFromSelected(id);
        break;
      case commands.DELETE:
        deleteToDo(id);
        emptyCurrentSelectedArray();
        break;
      case commands.EDIT:
        editToDo(id);
        emptyCurrentSelectedArray();
        break;
      default:
        break;
    }
  });
};

export const checkAndRenderOneToDo = (toDoItem) => {
  const oldToDoNode = getDocumentElementUsingSelector(
    `[data-id="${toDoItem.ID}"]`
  );
  const conditionSatisfied =
    checkWithFilter(toDoItem) &&
    containSearchedWord(queriedElements.searchInput.value, toDoItem.title);

  if (conditionSatisfied) {
    console.log("Satisfied");
    data.totalCount++;
    if (toDoItem.completed) {
      data.countCompleted++;
    }
    const newtoDoNode = createToDoNode(toDoItem);
    if (oldToDoNode) {
      queriedElements.todosBox.replaceChild(newtoDoNode, oldToDoNode);
    } else {
      queriedElements.todosBox.appendChild(newtoDoNode);
    }
    addListenerForToDo(newtoDoNode);
  } else if (oldToDoNode) {
    oldToDoNode.remove();
  }
  updateAnalytics();
};

export const displayToDos = () => {
  let countCompleted = 0,
    totalCount = 0;

  queriedElements.todosBox
    .querySelectorAll("*")
    .forEach((node) => node.remove());

  data.allTodos.forEach((toDoItem) => {
    const conditionSatisfied =
      checkWithFilter(toDoItem) &&
      containSearchedWord(queriedElements.searchInput.value, toDoItem.title);
    if (conditionSatisfied) {
      totalCount++;
      if (toDoItem.completed) {
        countCompleted++;
      }
      const newtoDoNode = createToDoNode(toDoItem);
      queriedElements.todosBox.appendChild(newtoDoNode);
      addListenerForToDo(newtoDoNode);
    }
  });
  data.curOnScreenSelected.length = 0;
  data.countCompleted = countCompleted;
  data.totalCount = totalCount;
  updateAnalytics();
};
