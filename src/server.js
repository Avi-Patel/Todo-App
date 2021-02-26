import { copyContent } from "/src/otherFunctions.js";
// const success = true;

const randomBooleanValue = () => Math.random() <= 0.98;
// const number = Math.random();
// console.log(number);
// if (number <= 0.9) return true;
// else return false;
// };

const sortToDosByID = (toDo1, ToDo2) => toDo1.ID - ToDo2.ID;

export const saveToDos = () =>
  new Promise((resolve, reject) => {
    toDos.sort(sortToDosByID);
    localStorage.setItem("toDos", JSON.stringify(toDos));
    resolve();
  });

export const getIndexInDatabase = (id) => {
  let index = null;
  toDos.forEach((toDo, i) => {
    if (toDo.ID === id) index = i;
  });
  return index;
};

export const getToDosFromDatabase = () =>
  new Promise((resolve, reject) => {
    if (randomBooleanValue()) {
      const storedToDos = JSON.parse(localStorage.getItem("toDos"));
      toDos.length = 0;
      if (storedToDos) {
        storedToDos.forEach((toDo) => toDos.push({ ...toDo }));
      }
      resolve(toDos);
    } else {
      reject(
        "Opps!! something went wrong whiel fecthing data, plz try again after sometime"
      );
    }
  });

export const createToDoInDatabase = (toDo) =>
  new Promise((resolve, reject) => {
    if (randomBooleanValue()) {
      toDos.push({ ...toDo });
      resolve();
    } else {
      reject(
        "Opps!! something went wrong server side, plz try again after sometime"
      );
    }
  });

export const updateToDoInDatabase = (id, toDo) =>
  new Promise((resolve, reject) => {
    if (randomBooleanValue()) {
      copyContent(toDos[getIndexInDatabase(id)], toDo);
      resolve(toDo);
    } else {
      reject("Opps!! Cannot update right now, plz try again after sometime");
    }
  });

export const deleteToDoFromDatabase = (id) =>
  new Promise((resolve, reject) => {
    if (randomBooleanValue()) {
      toDos.splice(getIndexInDatabase(id), 1);
      resolve();
    } else {
      reject(
        "Opps!! something went wrong while deleting TODO, plz try again after sometime"
      );
    }
  });

export const bulkUpdateInDatabase = (ids, updatedToDos) =>
  new Promise((resolve, reject) => {
    if (randomBooleanValue()) {
      ids.forEach((id, i) => {
        copyContent(toDos[getIndexInDatabase(id)], updatedToDos[i]);
      });
      resolve();
    } else {
      reject("Opps!! Cannot update right now, plz try again after sometime");
    }
  });

export const bulkDeleteFromDatabase = (ids) =>
  new Promise((resolve, reject) => {
    if (randomBooleanValue()) {
      ids.forEach((id) => {
        toDos.splice(getIndexInDatabase(id), 1);
      });
      resolve();
    } else {
      reject(
        "Opps!! something went wrong while deletign TODOs, plz try again after sometime"
      );
    }
  });

export const bulkCreateInDatabase = (newToDods) =>
  new Promise((resolve, reject) => {
    if (randomBooleanValue()) {
      newToDods.forEach((newToDo) => toDos.push({ ...newToDo }));
      resolve();
    } else {
      reject(
        "Opps!! something went wrong server side, plz try again after sometime"
      );
    }
  });
const toDos = [];
