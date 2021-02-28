import { showSnackbar, copyContent } from "/src/otherFunctions.js";
import { commands } from "/src/consts.js";

// const history = {
//   position: -1,
//   actions: [],
// };

export const historyActions = (mockServer, localData) => {
  let position = -1;
  const actions = [];
  return {
    addActions: (commandType, toDoIDs, toDos, oldToDos) => {
      actions.splice(position + 1, actions.length);
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
      actions.push(newAction);
      position++;
    },

    redo: () => {
      if (position === actions.length - 1) return;
      console.log(position);
      switch (actions[position + 1].command) {
        case commands.EDIT:
          undoRedoOnEdit(
            actions[position + 1]["IDs"][0],
            actions[position + 1]["toDos"][0],
            actions[position + 1]["oldToDos"][0],
            false
          );
          break;
        case commands.ALTERCOMPLETIONINBULK:
          undoRedoOnAlterCompletionInBulk(actions[position + 1]["IDs"], false);
          break;
        case commands.CREATE:
          undoRedoOnCreate(
            actions[position + 1]["IDs"][0],
            actions[position + 1]["toDos"][0],
            false
          );
          break;
        case commands.DELETE:
          undoRedoOnDelete(
            actions[position + 1]["IDs"][0],
            actions[position + 1]["oldToDos"][0],
            false
          );
          break;
        case commands.DELETEINBULK:
          undoRedoOnDeleteInBulk(
            actions[position + 1]["IDs"],
            actions[position + 1]["oldToDos"],
            false
          );
          break;
        default:
          break;
      }
    },

    undo: () => {
      if (position === -1) return;
      console.log(position);

      switch (actions[position].command) {
        case commands.EDIT:
          undoRedoOnEdit(
            actions[position]["IDs"][0],
            actions[position]["toDos"][0],
            actions[position]["oldToDos"][0],
            true
          );
          break;
        case commands.ALTERCOMPLETIONINBULK:
          undoRedoOnAlterCompletionInBulk(actions[position]["IDs"], true);
          break;
        case commands.CREATE:
          undoRedoOnCreate(
            actions[position]["IDs"][0],
            actions[position]["toDos"][0],
            true
          );
          break;
        case commands.DELETE:
          undoRedoOnDelete(
            actions[position]["IDs"][0],
            actions[position]["oldToDos"][0],
            true
          );
          break;
        case commands.DELETEINBULK:
          undoRedoOnDeleteInBulk(
            actions[position]["IDs"],
            actions[position]["oldToDos"],
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
            position--;
          })
          .catch((e) => showSnackbar(e));
      } else {
        mockServer
          .createToDoInDatabase(toDo)
          .then(() => {
            localData.pushNewToDo({ ...toDo });
            // checkAndRenderOneToDo(data.allTodos[data.allTodos.length - 1]);
            displayToDos();
            position++;
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
            position--;
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
            position++;
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
            position--;
          } else {
            position++;
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
            position--;
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
            position++;
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
            position--;
          } else {
            position++;
          }
        })
        .catch((e) => showSnackbar(e));
    },
  };
};

export const addActions = (commandType, toDoIDs, toDos, oldToDos) => {
  actions = actions.slice(0, position + 1);
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
  actions.push(newAction);
  position++;
};
