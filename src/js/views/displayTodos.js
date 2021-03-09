import {
  todoActions,
  color,
  categoryIcon,
  urgency,
  category,
} from "../constants.js";
import { showModal } from "./createModal.js";
import { extractClosestNodeFromPath } from "../helper-functions.js";

const createTodoNode = (todo, todoEventHandlers) => {
  const urgencyIconColors = {
    [urgency.LOW]: color.GREEN,
    [urgency.MEDIUM]: color.YELLOW,
    [urgency.HIGH]: color.RED,
  };
  const categoryIcons = {
    [category.PERSONAL]: categoryIcon.USERALT,
    [category.ACADEMIC]: categoryIcon.BOOKOPEN,
    [category.SOCIAL]: categoryIcon.USERS,
  };
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
  addListenerForTodoNode(todoNode, todo, todoEventHandlers);
  return todoNode;
};

const addListenerForTodoNode = (todoNode, todo, todoEventHandlers) => {
  todoNode.addEventListener("click", (event) => {
    const targetButton =
      event.target.tagName === "BUTTON"
        ? event.target
        : extractClosestNodeFromPath(event, "button");

    if (!targetButton) return;

    const id = parseInt(todoNode.dataset.id);
    switch (targetButton.dataset.type) {
      case todoActions.MARK_COMPLETED:
        todoEventHandlers.handleCompletionToggle(id);
        break;
      case todoActions.SELECT:
        todoEventHandlers.handleSelectionToggle(id);
        break;
      case todoActions.DELETE:
        todoEventHandlers.handleDeleteTodo(id);
        break;
      case todoActions.EDIT:
        showModal(todo, todoEventHandlers.handleEditTodo);
        break;
      default:
        break;
    }
  });
};

export const displayTodos = (
  todos,
  currentlySelectedIds,
  todoEventHandlers
) => {
  document.querySelector("#todos-box").innerHTML = "";

  todos.forEach((todo) => {
    const newtodoNode = createTodoNode(todo, todoEventHandlers);
    if (currentlySelectedIds.indexOf(todo.ID) !== -1) {
      newtodoNode
        .querySelector(`[data-type=${todoActions.SELECT}]`)
        .classList.toggle("blueCircle");
    }
    document.querySelector("#todos-box").appendChild(newtodoNode);
  });
};
