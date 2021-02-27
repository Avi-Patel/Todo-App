import { copyContent } from "/src/otherFunctions.js";
// const success = true;

const randomBooleanValue = () => Math.random() <= 0.98;
// const number = Math.random();
// console.log(number);
// if (number <= 0.9) return true;
// else return false;
// };

const sortToDosByID = (toDo1, ToDo2) => toDo1.ID - ToDo2.ID;

export const createMockServer = () => {
  return {
    todos: [],
    saveToDos: () =>
      new Promise((resolve, reject) => {
        this.todos.sort(sortToDosByID);
        localStorage.setItem("todos", JSON.stringify(this.todos));
        resolve();
      }),

    getIndexInDatabase: (id) => {
      let index = null;
      this.todos.forEach((toDo, i) => {
        if (toDo.ID === id) index = i;
      });
      return index;
    },

    getToDosFromDatabase: () =>
      new Promise((resolve, reject) => {
        if (randomBooleanValue()) {
          const storedToDos = JSON.parse(localStorage.getItem("todos"));
          this.todos.length = 0;
          if (storedToDos) {
            storedToDos.forEach((toDo) => this.todos.push({ ...toDo }));
          }
          resolve(this.todos);
        } else {
          reject(
            "Opps!! something went wrong whiel fecthing data, plz try again after sometime"
          );
        }
      }),

    createToDoInDatabase: (toDo) =>
      new Promise((resolve, reject) => {
        if (randomBooleanValue()) {
          this.todos.push({ ...toDo });
          resolve();
        } else {
          reject(
            "Opps!! something went wrong server side, plz try again after sometime"
          );
        }
      }),

    updateToDoInDatabase: (id, toDo) =>
      new Promise((resolve, reject) => {
        if (randomBooleanValue()) {
          copyContent(this.todos[getIndexInDatabase(id)], toDo);
          resolve(toDo);
        } else {
          reject(
            "Opps!! Cannot update right now, plz try again after sometime"
          );
        }
      }),

    deleteToDoFromDatabase: (id) =>
      new Promise((resolve, reject) => {
        if (randomBooleanValue()) {
          this.todos.splice(getIndexInDatabase(id), 1);
          resolve();
        } else {
          reject(
            "Opps!! something went wrong while deleting TODO, plz try again after sometime"
          );
        }
      }),

    bulkUpdateInDatabase: (ids, updatedToDos) =>
      new Promise((resolve, reject) => {
        if (randomBooleanValue()) {
          ids.forEach((id, i) => {
            copyContent(this.todos[getIndexInDatabase(id)], updatedToDos[i]);
          });
          resolve();
        } else {
          reject(
            "Opps!! Cannot update right now, plz try again after sometime"
          );
        }
      }),

    bulkDeleteFromDatabase: (ids) =>
      new Promise((resolve, reject) => {
        if (randomBooleanValue()) {
          ids.forEach((id) => {
            this.todos.splice(getIndexInDatabase(id), 1);
          });
          resolve();
        } else {
          reject(
            "Opps!! something went wrong while deletign TODOs, plz try again after sometime"
          );
        }
      }),

    bulkCreateInDatabase: (newToDods) =>
      new Promise((resolve, reject) => {
        if (randomBooleanValue()) {
          newToDods.forEach((newToDo) => this.todos.push({ ...newToDo }));
          resolve();
        } else {
          reject(
            "Opps!! something went wrong server side, plz try again after sometime"
          );
        }
      }),
  };
};
