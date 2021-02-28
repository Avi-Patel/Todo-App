// import { categoryIcons, color, category, urgency } from "/src/consts.js";

// export const data = {
//   counter: 0,
//   allTodos: [],
//   urgencyFilter: [0, 0, 0],
//   categoryFilter: [0, 0, 0],
//   urgencyFilterIds: [urgency.LOW, urgency.MEDIUM, urgency.HIGH],
//   categoryFilterIds: [category.PERSONAL, category.ACADEMIC, category.SOCIAL],
//   curOnScreenSelected: [],
//   urgencyIconColors: [color.GREEN, color.YELLOW, color.RED],
//   categoryIcons: [
//     categoryIcons.USERALT,
//     categoryIcons.BOOKOPEN,
//     categoryIcons.USERS,
//   ],
//   countCompleted: 0,
//   totalCount: 0,
//   timeOutId: undefined,
// };
// export const queriedElements = {
//   TDaddBtn: document.querySelector("#TDaddBtn"),
//   todosBox: document.querySelector("#todosBox"),
//   urgencyFilter: document.querySelector("#urgencyFilter"),
//   categoryFilter: document.querySelector("#categoryFilter"),
//   completeSelection: document.querySelector("#completeSelection"),
//   clearSelection: document.querySelector("#clearSelection"),
//   deleteSelection: document.querySelector("#deleteSelection"),
//   percentageText: document.querySelector("#percentageText"),
//   ratioText: document.querySelector("#ratioText"),
//   searchInput: document.querySelector("#searchInput"),
//   clearBtn: document.querySelector("#clearBtn"),
//   notCompletedCheckBox: document.querySelector("#notCompletedCheckBox"),
// };

export class createLocalDatabase {
  constructor() {
    this.allTodos = [];
    this.curOnScreenSelected = [];
    this.counter = 0;
  }

  getCounter = () => this.counter;
  setCounter = (newCounter) => {
    this.counter = newCounter;
  };
  getToDo = (index) => this.allTodos[index];

  pushNewToDo = (toDo) => this.allTodos.push(toDo);

  deleteToDoAtAnyIndex = (index) => this.allTodos.splice(index, 1);

  insertToDoAtAnyIndex = (index, toDo) => this.allTodos.splice(index, 0, toDo);

  emptyAllTodosArray = () => (this.allTodos.length = 0);

  replaceTodoAtAnyIndex = (index, todo) => (this.allTodos[index] = todo);

  alterCompletedProperty = (index) =>
    (this.allTodos[index].completed = !this.allTodos[index].completed);

  getIndexInLocalDatabase = (id) => {
    let index;
    this.allTodos.forEach((toDo, i) => {
      if (toDo.ID === id) index = i;
    });
    return index;
  };

  emptyCurrentSelectedArray = () => (this.curOnScreenSelected.length = 0);

  setCurrentSelected = (newSelectedIds) =>
    (this.curOnScreenSelected = [...newSelectedIds]);

  getCurrentSelected = () => this.curOnScreenSelected;

  pushIdToCurrentSelected = (id) => this.curOnScreenSelected.push(id);

  deleteIdFromCurrentSelected = (id) => {
    const index = this.curOnScreenSelected.indexOf(id);
    if (index !== -1) {
      this.curOnScreenSelected.splice(index, 1);
    }
  };
}
