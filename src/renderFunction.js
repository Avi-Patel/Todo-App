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

class filterCheckerOnTodo {
  constructor(filterData) {
    this.props = {
      filterData,
    };
  }

  checkWithFilter = (toDoItem) => {
    //collecting all consitions's true/false value
    const notAnyUrgencyApplied = this.props.filterData.urgencyFilterMask.every(
      (element) => element === 0
    );
    const notAnyCategoryApplied = this.props.filterData.categoryFilterMask.every(
      (element) => element === 0
    );
    const checked = this.props.filterData.notCompletedCheckBox;

    return (
      (this.props.filterData.urgencyFilterMask[toDoItem.urgency] === 1 ||
        notAnyUrgencyApplied) &&
      (this.props.filterData.categoryFilterMask[toDoItem.category] === 1 ||
        notAnyCategoryApplied) &&
      ((checked && !toDoItem.completed) || !checked)
    );
  };

  containSearchedWord = (title) =>
    this.props.filterData.searchedText === "" ||
    title.toLowerCase().indexOf(this.props.filterData.searchedText) + 1;
}

class TodoRendersAndAnalytics {
  constructor(todoActionHandlers, localData, filterData) {
    this.props = {
      todoActionHandlers,
      localData,
      filterData,
    };
    this.analyticsData = {
      countCompleted: 0,
      totalCount: 0,
    };
    this.urgencyIconColors = [color.GREEN, color.YELLOW, color.RED];
    this.categoryIcons = [
      categoryIcons.USERALT,
      categoryIcons.BOOKOPEN,
      categoryIcons.USERS,
    ];
    this.filterCheckerOnTodo = new filterCheckerOnTodo(filterData);
    this.DOMElements = {
      todosBox: document.querySelector("#todosBox"),
      percentageText: document.querySelector("#percentageText"),
      ratioText: document.querySelector("#ratioText"),
    };
  }

  extractClosestNodeFromPath = (event, type) => event.target.closest(type);

  addListenerForToDo = (newToDo) => {
    newToDo.addEventListener("click", (event) => {
      const targetButton =
        event.target.tagName === "BUTTON"
          ? event.target
          : extractClosestNodeFromPath(event, "button");

      if (!targetButton) return;

      const id = parseInt(newToDo.dataset.id);
      switch (targetButton.dataset.type) {
        case commands.MARKCOMPLETED:
          this.props.todoActionHandlers.alterCompletionOfToDo(id);
          break;
        case commands.SELECT:
          this.props.todoActionHandlers.addOrRemoveFromSelected(id);
          break;
        case commands.DELETE:
          this.props.todoActionHandlers.deleteToDo(id);
          this.props.localData.emptyCurrentSelectedArray();
          break;
        case commands.EDIT:
          this.props.todoActionHandlers.editToDo(id);
          this.props.localData.emptyCurrentSelectedArray();
          break;
        default:
          break;
      }
    });
  };
  updateAnalytics = () => {
    this.DOMElements.percentageText.textContent =
      this.analyticsData.totalCount === 0
        ? "0 %"
        : Math.round(
            (this.analyticsData.countCompleted /
              this.analyticsData.totalCount) *
              100
          ) + " %";
    this.DOMElements.ratioText.textContent = `${this.analyticsData.countCompleted} / ${this.analyticsData.totalCount}`;
  };

  // should i move createToDoNode to anothor class?
  createToDoNode = (toDoItem) => {
    const toDoNode = createElement("div", {
      class: `TDitem mar8 pad8 b12 ${
        toDoItem.completed ? "reduceOpacity" : "originalOpacity"
      }`,
      "data-id": `${toDoItem.ID}`,
    });

    toDoNode.innerHTML = `<div class="topTwoBtns">
    <button class="iconBtn iconBtnExtra visiblyAltered" data-type="edit"><i class="fa fa-pencil cwhite" ></i></button>
    <button class="iconBtn iconBtnExtra visiblyAltered" data-type="delete"><i class="fa fa-trash cwhite" ></i></button>
    </div>
    <div class="normalBoldTitle textCenter mar10" style="font-size: 18px;">
      ${toDoItem.title}
    </div>
    <div class="normalTitle mar10" style="font-size: 14px;">
      ${toDoItem.dateAsID}
    </div>
    <div class="TDprefrerences mar10">
    <span class="TDicon mar8 ${this.urgencyIconColors[toDoItem.urgency]}">
      <i class="fa fa-exclamation-triangle "></i>
    </span>
    <span class="TDicon mar8 cwhite">
      <i class="fa ${this.categoryIcons[toDoItem.category]}"></i>
    </span>
      
    </div>
    <button class="markCompleted greenBtn mar10" data-type="markCompleted"">
    ${toDoItem.completed ? "Completed Undo?" : "Mark Completed"}
    </button>
    <button class="selectWhiteCircle mar8" data-type="select"></button>`;
    return toDoNode;
  };

  checkAndRenderOneToDo = (toDoItem) => {
    const oldToDoNode = getDocumentElementUsingSelector(
      `[data-id="${toDoItem.ID}"]`
    );
    const conditionSatisfied =
      this.filterCheckerOnTodo.checkWithFilter(toDoItem) &&
      this.filterCheckerOnTodo.containSearchedWord(toDoItem.title);

    if (conditionSatisfied) {
      console.log("Satisfied");
      this.analyticsData.totalCount++;
      if (toDoItem.completed) {
        this.analyticsData.countCompleted++;
      }
      const newtoDoNode = createToDoNode(toDoItem);
      if (oldToDoNode) {
        this.DOMElements.todosBox.replaceChild(newtoDoNode, oldToDoNode);
      } else {
        this.DOMElements.todosBox.appendChild(newtoDoNode);
      }
      addListenerForToDo(newtoDoNode);
    } else if (oldToDoNode) {
      oldToDoNode.remove();
    }
    updateAnalytics();
  };

  displayToDos = () => {
    let countCompleted = 0,
      totalCount = 0;

    this.DOMElements.todosBox
      .querySelectorAll("*")
      .forEach((node) => node.remove());

    this.props.localData.allTodos.forEach((toDoItem) => {
      const conditionSatisfied =
        this.filterCheckerOnTodo.checkWithFilter(toDoItem) &&
        this.filterCheckerOnTodo.containSearchedWord(toDoItem.title);

      if (conditionSatisfied) {
        totalCount++;
        if (toDoItem.completed) {
          countCompleted++;
        }
        const newtoDoNode = createToDoNode(toDoItem);
        this.DOMElements.todosBox.appendChild(newtoDoNode);
        addListenerForToDo(newtoDoNode);
      }
    });
    this.props.localData.curOnScreenSelected.length = 0;
    this.analyticsData.countCompleted = countCompleted;
    this.analyticsData.totalCount = totalCount;
    updateAnalytics();
  };
}

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
