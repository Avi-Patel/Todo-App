import { categoryIcons, color, category, urgency } from "/src/consts.js";

export const data = {
  counter: 0,
  allTodos: [],
  urgencyFilter: [0, 0, 0],
  categoryFilter: [0, 0, 0],
  urgencyFilterIds: [urgency.LOW, urgency.MEDIUM, urgency.HIGH],
  categoryFilterIds: [category.PERSONAL, category.ACADEMIC, category.SOCIAL],
  curOnScreenSelected: [],
  urgencyIconColors: [color.GREEN, color.YELLOW, color.RED],
  categoryIcons: [
    categoryIcons.USERALT,
    categoryIcons.BOOKOPEN,
    categoryIcons.USERS,
  ],
  countCompleted: 0,
  totalCount: 0,
  timeOutId: undefined,
};
export const queriedElements = {
  TDaddBtn: document.querySelector("#TDaddBtn"),
  todosBox: document.querySelector("#todosBox"),
  urgencyFilter: document.querySelector("#urgencyFilter"),
  categoryFilter: document.querySelector("#categoryFilter"),
  completeSelection: document.querySelector("#completeSelection"),
  clearSelection: document.querySelector("#clearSelection"),
  deleteSelection: document.querySelector("#deleteSelection"),
  percentageText: document.querySelector("#percentageText"),
  ratioText: document.querySelector("#ratioText"),
  searchInput: document.querySelector("#searchInput"),
  clearBtn: document.querySelector("#clearBtn"),
  notCompletedCheckBox: document.querySelector("#notCompletedCheckBox"),
};

export const createLocalDatabase = () => {
  return {
    allTodos: [],
    curOnScreenSelected: [],
    getToDo: (index) => data.allTodos[index],

    pushNewToDo: (toDo) => data.allTodos.push(toDo),

    deleteToDoAtAnyIndex: (index) => data.allTodos.splice(index, 1),

    insertToDoAtAnyIndex: (index, toDo) => data.allTodos.splice(index, 0, toDo),

    emptyAllTodosArray: () => (data.allTodos.length = 0),

    alterCompletedProperty: (index) =>
      (data.allTodos[index].completed = !data.allTodos[index].completed),

    getIndexInLocalDatabase: (id) => {
      let index = null;
      data.allTodos.forEach((toDo, i) => {
        if (toDo.ID === id) index = i;
      });
      return index;
    },

    emptyCurrentSelectedArray: () => (data.curOnScreenSelected.length = 0),

    deleteIdFromCurrentSelected: (id) => {
      const index = data.curOnScreenSelected.indexOf(id);
      if (index !== -1) {
        data.curOnScreenSelected.splice(index, 1);
      }
    },
  };
};
