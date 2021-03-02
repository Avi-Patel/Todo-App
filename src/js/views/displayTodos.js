import { commands, color, categoryIcon } from "../consts.js";
import { showModal } from "./create-modal.js";
import { extractClosestNodeFromPath } from "../helper-functions.js";

const createTodoNode = (todo, callbacks) => {
  const urgencyIconColors = [color.GREEN, color.YELLOW, color.RED];
  const categoryIcons = [
    categoryIcon.USERALT,
    categoryIcon.BOOKOPEN,
    categoryIcon.USERS,
  ];
  const todoNode = document.createElement("div");
  todoNode.classList.add(
    "TDitem",
    "mar8",
    "pad8",
    "b12",
    todo.completed ? "reduceOpacity" : "originalOpacity"
  );
  todoNode.setAttribute("data-id", todo.ID.toString());

  todoNode.innerHTML = `<div class="topTwoBtns">
    <button class="iconBtn iconBtnExtra visiblyAltered" data-type="edit"><i class="fa fa-pencil cwhite" ></i></button>
    <button class="iconBtn iconBtnExtra visiblyAltered" data-type="delete"><i class="fa fa-trash cwhite" ></i></button>
    </div>
    <div class="normalBoldTitle textCenter mar10" style="font-size: 18px;">
      ${todo.title}
    </div>
    <div class="normalTitle mar10" style="font-size: 14px;">
      ${todo.date}
    </div>
    <div class="TDprefrerences mar10">
    <span class="TDicon mar8 ${urgencyIconColors[todo.urgency]}">
      <i class="fa fa-exclamation-triangle "></i>
    </span>
    <span class="TDicon mar8 cwhite">
      <i class="fa ${categoryIcons[todo.category]}"></i>
    </span>
      
    </div>
    <button class="markCompleted greenBtn mar10" data-type="markCompleted"">
    ${todo.completed ? "Completed Undo?" : "Mark Completed"}
    </button>
    <button class="whiteCircle mar8" data-type="select"></button>`;
  addListenerForTodoNode(todoNode, todo, callbacks);
  return todoNode;
};

const addListenerForTodoNode = (todoNode, todo, callbacks) => {
  todoNode.addEventListener("click", (event) => {
    const targetButton =
      event.target.tagName === "BUTTON"
        ? event.target
        : extractClosestNodeFromPath(event, "button");

    if (!targetButton) return;

    const id = parseInt(todoNode.dataset.id);
    // console.log(targetButton.dataset.type, commands.MARK_COMPLETED);
    switch (targetButton.dataset.type) {
      case commands.MARK_COMPLETED:
        callbacks.handleAlteringCompletion(id);
        break;
      case commands.SELECT:
        callbacks.handleTogglingFromSelected(id);
        break;
      case commands.DELETE:
        callbacks.handleDeleteTodo(id);
        // localData.emptyCurrentSelectedArray();
        break;
      case commands.EDIT:
        showModal(todo, callbacks.handleEditTodo);
        // localData.emptyCurrentSelectedArray();
        break;
      default:
        break;
    }
  });
};

export const displayTodos = (todos, currentlySelectedIds, callbacks) => {
  console.log(currentlySelectedIds);
  console.log(callbacks);
  document.querySelector("#todos-box").innerHTML = "";

  todos.forEach((todo) => {
    const newtodoNode = createTodoNode(todo, callbacks);
    if (currentlySelectedIds.indexOf(todo.ID) !== -1) {
      newtodoNode
        .querySelector(`[data-type=${commands.SELECT}]`)
        .classList.toggle("blueCircle");
    }
    document.querySelector("#todos-box").appendChild(newtodoNode);
  });
  // this.localData.emptyCurrentSelectedArray();
  // this.setAnalytics(numberOfCompletedTodos, numberOfTotalTodos);
  // this.analyticsUpdater.updateAnalyticsOnView();
};
