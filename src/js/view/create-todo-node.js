import { commands, color, categoryIcon } from "../consts.js";

const extractClosestNodeFromPath = (event, type) => event.target.closest(type);

export const createTodoNode = (todo, localData, todoActionHandlers) => {
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
    <button class="selectWhiteCircle mar8" data-type="select"></button>`;
  addListenerForTodoNode(todoNode, localData, todoActionHandlers);
  return todoNode;
};

const addListenerForTodoNode = (newTodoNode, localData, todoActionHandlers) => {
  newTodoNode.addEventListener("click", (event) => {
    console.log("event called");
    console.log(todoActionHandlers);
    const targetButton =
      event.target.tagName === "BUTTON"
        ? event.target
        : extractClosestNodeFromPath(event, "button");

    if (!targetButton) return;

    const id = parseInt(newTodoNode.dataset.id);
    console.log(targetButton.dataset.type, commands.MARK_COMPLETED);
    switch (targetButton.dataset.type) {
      case commands.MARK_COMPLETED:
        todoActionHandlers.alterCompletionOfTodo(id);
        break;
      case commands.SELECT:
        todoActionHandlers.addOrRemoveFromSelected(id);
        break;
      case commands.DELETE:
        todoActionHandlers.deleteTodo(id);
        localData.emptyCurrentSelectedArray();
        break;
      case commands.EDIT:
        todoActionHandlers.showModal(id);
        localData.emptyCurrentSelectedArray();
        break;
      default:
        break;
    }
  });
};
