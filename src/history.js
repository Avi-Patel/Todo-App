import { checkAndRenderOneToDo, displayToDos } from "/src/renderFunction.js";
// import {
//   updateToDoInDatabase,
//   deleteToDoFromDatabase,
//   createToDoInDatabase,
//   bulkUpdateInDatabase,
//   bulkCreateInDatabase,
//   bulkDeleteFromDatabase,
// } from "/src/server.js";
import { updateCountsForRemovedToDo, updateAnalytics } from "/src/analytics.js";
import { showSnackbar, copyContent } from "/src/otherFunctions.js";
import { deleteDocumentElementUsingSelector } from "/src/index.js";
// import {
//   localDataInCurrentState
// } from "/src/localDataAndElements.js";
import { commands } from "/src/consts.js";

// const history = {
//   position: -1,
//   actions: [],
// };

export const historyActions = (mockServer, localData) => {
  return {
    position: -1,
    actions: [],
    addActions: (commandType, toDoIDs, toDos, oldToDos) => {
      this.actions = this.actions.slice(0, this.position + 1);
      const newAction = {
        command: commandType,
        IDs: toDoIDs,
      };
      if (toDos) {
        newAction["toDos"] = toDos;
      }
      if (oldToDos) {
        newAction["oldToDos"] = oldToDos;
      }
      this.actions.push(newAction);
      this.position++;
    },

    redo: () => {
      if (this.position === this.actions.length - 1) return;
      console.log(this.position);
      switch (this.actions[this.position + 1].command) {
        case commands.EDIT:
          undoRedoOnEdit(
            this.actions[this.position + 1]["IDs"][0],
            this.actions[this.position + 1]["toDos"][0],
            this.actions[this.position + 1]["oldToDos"][0],
            false
          );
          break;
        case commands.ALTERCOMPLETIONINBULK:
          undoRedoOnAlterCompletionInBulk(
            this.actions[this.position + 1]["IDs"],
            false
          );
          break;
        case commands.CREATE:
          undoRedoOnCreate(
            this.actions[this.position + 1]["IDs"][0],
            this.actions[this.position + 1]["toDos"][0],
            false
          );
          break;
        case commands.DELETE:
          undoRedoOnDelete(
            this.actions[this.position + 1]["IDs"][0],
            this.actions[this.position + 1]["oldToDos"][0],
            false
          );
          break;
        case commands.DELETEINBULK:
          undoRedoOnDeleteInBulk(
            this.actions[this.position + 1]["IDs"],
            this.actions[this.position + 1]["oldToDos"],
            false
          );
          break;
        default:
          break;
      }
    },

    undo: () => {
      if (this.position === -1) return;
      console.log(this.position);

      switch (this.actions[this.position].command) {
        case commands.EDIT:
          undoRedoOnEdit(
            this.actions[this.position]["IDs"][0],
            this.actions[this.position]["toDos"][0],
            this.actions[this.position]["oldToDos"][0],
            true
          );
          break;
        case commands.ALTERCOMPLETIONINBULK:
          undoRedoOnAlterCompletionInBulk(
            this.actions[this.position]["IDs"],
            true
          );
          break;
        case commands.CREATE:
          undoRedoOnCreate(
            this.actions[this.position]["IDs"][0],
            this.actions[this.position]["toDos"][0],
            true
          );
          break;
        case commands.DELETE:
          undoRedoOnDelete(
            this.actions[this.position]["IDs"][0],
            this.actions[this.position]["oldToDos"][0],
            true
          );
          break;
        case commands.DELETEINBULK:
          undoRedoOnDeleteInBulk(
            this.actions[this.position]["IDs"],
            this.actions[this.position]["oldToDos"],
            true
          );
          break;
        default:
          break;
      }
    },

    undoRedoOnCreate: (id, toDo, isUndo) => {
      if (isUndo) {
        mockServer
          .deleteToDoFromDatabase(id)
          .then(() => {
            localData.deleteToDoAtAnyIndex(
              localData.getIndexInLocalDatabase(id),
              1
            );
            // updateCountsForRemovedToDo(toDo);
            // updateAnalytics();
            // deleteDocumentElementUsingSelector(`[data-id="${id}"]`);
            displayToDos();
            this.position--;
          })
          .catch((e) => showSnackbar(e));
      } else {
        mockServer
          .createToDoInDatabase(toDo)
          .then(() => {
            localData.pushNewToDo({ ...toDo });
            // checkAndRenderOneToDo(data.allTodos[data.allTodos.length - 1]);
            displayToDos();
            this.position++;
          })
          .catch((e) => showSnackbar(e));
      }
    },

    findIndexToInsert: (id) => {
      let index = data.allTodos.length;
      data.allTodos.forEach((toDo, i) => {
        if (toDo.ID > id && i > 0 && data.allTodos[i - 1].ID < id) {
          index = i;
        }
      });
      if (data.allTodos.length === 0 || id < data.allTodos[0].ID) {
        index = 0;
      }
      return index;
    },

    undoRedoOnDelete: (id, toDo, isUndo) => {
      if (isUndo) {
        mockServer
          .createToDoInDatabase(toDo)
          .then(() => {
            const index = findIndexToInsert(id);
            localData.insertToDoAtAnyIndex(index, toDo);
            this.position--;
            displayToDos();
          })
          .catch((e) => showSnackbar(e));
      } else {
        mockServer
          .deleteToDoFromDatabase(id)
          .then(() => {
            localData.deleteToDoAtAnyIndex(
              localData.getIndexInLocalDatabase(id)
            );
            this.position++;
            displayToDos();
          })
          .catch((e) => showSnackbar(e));
      }
    },

    undoRedoOnEdit: (id, toDo, oldToDo, isUndo) => {
      let toDoCopy = {};
      if (isUndo) {
        toDoCopy = { ...oldToDo };
      } else {
        toDoCopy = { ...toDo };
      }
      mockServer
        .updateToDoInDatabase(id, toDoCopy)
        .then((returnedToDo) => {
          copyContent(
            localData.allTodos[localData.getIndexInLocalDatabase(id)],
            returnedToDo
          );
          displayToDos();
          if (isUndo) {
            this.position--;
          } else {
            this.position++;
          }
        })
        .catch((e) => showSnackbar(e));
    },

    undoRedoOnDeleteInBulk: (ids, deletedToDos, isUndo) => {
      if (isUndo) {
        mockServer
          .bulkCreateInDatabase(deletedToDos)
          .then(() => {
            deletedToDos.forEach((toDo) =>
              localData.insertToDoAtAnyIndex(findIndexToInsert(toDo.ID), {
                ...toDo,
              })
            );
            this.position--;
            displayToDos();
          })
          .catch((e) => showSnackbar(e));
      } else {
        mockServer
          .bulkDeleteFromDatabase(ids)
          .then(() => {
            ids.forEach((id) =>
              localData.deleteToDoAtAnyIndex(
                localData.getIndexInLocalDatabase(id)
              )
            );
            this.position++;
            displayToDos();
          })
          .catch((e) => showSnackbar(e));
      }
    },

    undoRedoOnAlterCompletionInBulk: (ids, isUndo) => {
      const indexs = [];
      const toDos = [];
      ids.forEach((id, i) => {
        const index = localData.getIndexInLocalDatabase(id);
        indexs.push(index);
        toDos.push({ ...localData.allTodos[index] });
        toDos[i].completed = !toDos[i].completed;
      });
      mockServer
        .bulkUpdateInDatabase(ids, toDos)
        .then(() => {
          indexs.forEach((index) => localData.alterCompletedProperty(index));
          displayToDos();
          if (isUndo) {
            this.position--;
          } else {
            this.position++;
          }
        })
        .catch((e) => showSnackbar(e));
    },
  };
};

export const addActions = (commandType, toDoIDs, toDos, oldToDos) => {
  this.actions = this.actions.slice(0, this.position + 1);
  const newAction = {
    command: commandType,
    IDs: toDoIDs,
  };
  if (toDos) {
    newAction["toDos"] = toDos;
  }
  if (oldToDos) {
    newAction["oldToDos"] = oldToDos;
  }
  this.actions.push(newAction);
  this.position++;
};
