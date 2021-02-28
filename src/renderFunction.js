import { commands, color, categoryIcon } from "/src/consts.js";

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

//analytics manage the data about #totaltodos and #completed todos which are their on view at any time.
class Analytics {
  constructor() {
    this.numberOfCompletedTodos = 0;
    this.numberOfTotalTodos = 0;
  }

  incrementNumberOfCompletedTodos = (value) =>
    (this.numberOfCompletedTodos += value);

  incrementNumberOfTotalTodos = (value) => (this.numberOfTotalTodos = value);

  setNumberOfCompletedTodos = (numberOfCompletedTodos) =>
    (this.numberOfCompletedTodos = numberOfCompletedTodos);

  setNumberOfTotalTodos = (numberOfTotalTodos) =>
    (this.numberOfTotalTodos = numberOfTotalTodos);

  getNumberOfCompletedTodos = () => this.numberOfCompletedTodos;
  getNumberOfTotalTodos = () => this.numberOfTotalTodos;
}

class AnalyticsUpdater {
  constructor() {
    this.DOMElements = {
      percentageText: document.querySelector("#percentageText"),
      ratioText: document.querySelector("#ratioText"),
    };
    this.analytics = new Analytics();
  }
  updateCountsForRemovedTodo = (toDo) => {
    if (toDo.completed) {
      this.analytics.incrementNumberOfCompletedTodos(-1);
      // this.analyticsData.numberOfCompletedTodos--;
    }
    this.analytics.incrementNumberOfTotalTodos(-1);
    // this.analyticsData.numberOfTotalTodos--;
  };
  updateCountsForAddedTodo = (toDo) => {
    if (toDo.completed) {
      this.analytics.incrementNumberOfCompletedTodos(1);
      // this.analyticsData.numberOfCompletedTodos--;
    }
    this.analytics.incrementNumberOfTotalTodos(1);
    // this.analyticsData.numberOfTotalTodos--;
  };

  updateAnalyticsOnView = () => {
    this.DOMElements.percentageText.textContent =
      this.analytics.getNumberOfCompletedTodos() === 0
        ? "0 %"
        : Math.round(
            (this.analytics.getNumberOfCompletedTodos() /
              this.analytics.getNumberOfTotalTodos()) *
              100
          ) + " %";
    this.DOMElements.ratioText.textContent = `${this.analytics.getNumberOfCompletedTodos()} / ${this.analytics.getNumberOfTotalTodos()}`;
  };
}

const extractClosestNodeFromPath = (event, type) => event.target.closest(type);

const createToDoNode = (todo, localData, todoActionHandlers) => {
  const urgencyIconColors = [color.GREEN, color.YELLOW, color.RED];
  const categoryIcons = [
    categoryIcon.USERALT,
    categoryIcon.BOOKOPEN,
    categoryIcon.USERS,
  ];
  const toDoNode = document.createElement("div");
  toDoNode.classList.add(
    "TDitem",
    "mar8",
    "pad8",
    "b12",
    todo.completed ? "reduceOpacity" : "originalOpacity"
  );
  toDoNode.setAttribute("data-id", todo.ID.toString());

  toDoNode.innerHTML = `<div class="topTwoBtns">
    <button class="iconBtn iconBtnExtra visiblyAltered" data-type="edit"><i class="fa fa-pencil cwhite" ></i></button>
    <button class="iconBtn iconBtnExtra visiblyAltered" data-type="delete"><i class="fa fa-trash cwhite" ></i></button>
    </div>
    <div class="normalBoldTitle textCenter mar10" style="font-size: 18px;">
      ${todo.title}
    </div>
    <div class="normalTitle mar10" style="font-size: 14px;">
      ${todo.dateAsID}
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
  addListenerForToDoNode(toDoNode, localData, todoActionHandlers);
  return toDoNode;
};

const addListenerForToDoNode = (newToDoNode, localData, todoActionHandlers) => {
  newToDoNode.addEventListener("click", (event) => {
    console.log("event called");
    console.log(todoActionHandlers);
    const targetButton =
      event.target.tagName === "BUTTON"
        ? event.target
        : extractClosestNodeFromPath(event, "button");

    if (!targetButton) return;

    const id = parseInt(newToDoNode.dataset.id);
    console.log(targetButton.dataset.type);
    switch (targetButton.dataset.type) {
      case commands.MARKCOMPLETED:
        todoActionHandlers.alterCompletionOfToDo(id);
        break;
      case commands.SELECT:
        todoActionHandlers.addOrRemoveFromSelected(id);
        break;
      case commands.DELETE:
        todoActionHandlers.deleteToDo(id);
        localData.emptyCurrentSelectedArray();
        break;
      case commands.EDIT:
        todoActionHandlers.editToDo(id);
        localData.emptyCurrentSelectedArray();
        break;
      default:
        break;
    }
  });
};

// should i move this createToDoNode to anothor class?

export class TodoRenderHandlers {
  constructor({
    todoActionHandlers,
    localData,
    filterData,
    color,
    categoryIcon,
  }) {
    console.log(filterData);
    this.props = {
      todoActionHandlers,
      localData,
      filterData,
    };

    this.urgencyIconColors = [color.GREEN, color.YELLOW, color.RED];
    this.categoryIcons = [
      categoryIcon.USERALT,
      categoryIcon.BOOKOPEN,
      categoryIcon.USERS,
    ];
    this.filterCheckerOnTodo = new filterCheckerOnTodo(filterData);
    this.analyticsUpdaer = new AnalyticsUpdater();

    this.DOMElements = {
      todosBox: document.querySelector("#todosBox"),
    };
  }

  setAnalytics = (numberOfCompletedTodos, numberOfTotalTodos) => {
    this.analyticsUpdaer.analytics.setNumberOfCompletedTodos(
      numberOfCompletedTodos
    );
    this.analyticsUpdaer.analytics.setNumberOfTotalTodos(numberOfTotalTodos);
  };

  displayToDos = () => {
    console.log("display called");
    console.log(this.props.filterData);
    let numberOfCompletedTodos = 0,
      numberOfTotalTodos = 0;

    this.DOMElements.todosBox.innerHTML = "";

    this.props.localData.allTodos.forEach((toDoItem) => {
      const conditionSatisfied =
        this.filterCheckerOnTodo.checkWithFilter(toDoItem) &&
        this.filterCheckerOnTodo.containSearchedWord(toDoItem.title);

      if (conditionSatisfied) {
        numberOfTotalTodos++;
        if (toDoItem.completed) {
          numberOfCompletedTodos++;
        }
        const newtoDoNode = createToDoNode(
          toDoItem,
          this.props.localData,
          this.props.todoActionHandlers
        );
        this.DOMElements.todosBox.appendChild(newtoDoNode);
      }
    });
    this.props.localData.curOnScreenSelected.length = 0;
    this.setAnalytics(numberOfCompletedTodos, numberOfTotalTodos);
    this.analyticsUpdaer.updateAnalyticsOnView();
  };
}

// const addListenerForToDo = (newToDo) => {
//   newToDo.addEventListener("click", (event) => {
//     const targetButton =
//       event.target.tagName === "BUTTON"
//         ? event.target
//         : extractClosestNodeFromPath(event, "button");

//     if (!targetButton) return;

//     const id = parseInt(newToDo.dataset.id);
//     switch (targetButton.dataset.type) {
//       case commands.MARKCOMPLETED:
//         alterCompletionOfToDo(id);
//         break;
//       case commands.SELECT:
//         addOrRemoveFromSelected(id);
//         break;
//       case commands.DELETE:
//         deleteToDo(id);
//         emptyCurrentSelectedArray();
//         break;
//       case commands.EDIT:
//         editToDo(id);
//         emptyCurrentSelectedArray();
//         break;
//       default:
//         break;
//     }
//   });
// };

// export const checkAndRenderOneToDo = (toDoItem) => {
//   const oldToDoNode = getDocumentElementUsingSelector(
//     `[data-id="${toDoItem.ID}"]`
//   );
//   const conditionSatisfied =
//     checkWithFilter(toDoItem) &&
//     containSearchedWord(queriedElements.searchInput.value, toDoItem.title);

//   if (conditionSatisfied) {
//     console.log("Satisfied");
//     data.numberOfTotalTodos++;
//     if (toDoItem.completed) {
//       data.numberOfCompletedTodos++;
//     }
//     const newtoDoNode = createToDoNode(toDoItem);
//     if (oldToDoNode) {
//       queriedElements.todosBox.replaceChild(newtoDoNode, oldToDoNode);
//     } else {
//       queriedElements.todosBox.appendChild(newtoDoNode);
//     }
//     addListenerForToDo(newtoDoNode);
//   } else if (oldToDoNode) {
//     oldToDoNode.remove();
//   }
//   updateAnalytics();
// };

// export const displayToDos = () => {
//   let numberOfCompletedTodos = 0,
//     numberOfTotalTodos = 0;

//   queriedElements.todosBox
//     .querySelectorAll("*")
//     .forEach((node) => node.remove());

//   data.allTodos.forEach((toDoItem) => {
//     const conditionSatisfied =
//       checkWithFilter(toDoItem) &&
//       containSearchedWord(queriedElements.searchInput.value, toDoItem.title);
//     if (conditionSatisfied) {
//       numberOfTotalTodos++;
//       if (toDoItem.completed) {
//         numberOfCompletedTodos++;
//       }
//       const newtoDoNode = createToDoNode(toDoItem);
//       queriedElements.todosBox.appendChild(newtoDoNode);
//       addListenerForToDo(newtoDoNode);
//     }
//   });
//   data.curOnScreenSelected.length = 0;
//   data.numberOfCompletedTodos = numberOfCompletedTodos;
//   data.numberOfTotalTodos = numberOfTotalTodos;
//   updateAnalytics();
// };

// checkAndRenderOneToDo = (toDoItem) => {
//   const oldToDoNode = document.querySelector(`[data-id="${toDoItem.ID}"]`);
//   const indexInLocalData = this.props.localData.getIndexInLocalDatabase(
//     toDoItem.ID
//   );
//   if (indexInLocalData) {
//     this.analyticsUpdaer.updateCountsForRemovedToDo(
//       this.props.localData.getToDo(indexInLocalData)
//     );
//   }
//   const conditionSatisfied =
//     this.filterCheckerOnTodo.checkWithFilter(toDoItem) &&
//     this.filterCheckerOnTodo.containSearchedWord(toDoItem.title);

//   if (conditionSatisfied) {
//     console.log("Satisfied");

//     const newtoDoNode = new TodoNode(toDoItem, this.props.todoActionHandlers);
//     if (oldToDoNode) {
//       this.analyticsUpdaer.updateCountsForRemovedTodo(toDoItem);
//       this.DOMElements.todosBox.replaceChild(newtoDoNode, oldToDoNode);
//     } else {
//       this.DOMElements.todosBox.appendChild(newtoDoNode);
//     }
//   } else if (oldToDoNode) {
//     oldToDoNode.remove();
//   }

//   this.analyticsUpdaer.updateCountsForAddedTodo(toDoItem);
//   this.analyticsUpdaer.updateAnalytics();
// };
