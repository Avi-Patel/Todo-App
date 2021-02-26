import { checkAndRenderOneToDo, displayToDos } from "/src/renderFunction.js";
import {
  updateToDoInDatabase,
  deleteToDoFromDatabase,
  createToDoInDatabase,
  bulkUpdateInDatabase,
  bulkCreateInDatabase,
  bulkDeleteFromDatabase,
} from "/src/server.js";
import { updateCountsForRemovedToDo, updateAnalytics } from "/src/analytics.js";
import { showSnackbar, copyContent } from "/src/otherFunctions.js";
import { deleteDocumentElementUsingSelector } from "/src/index.js";
import {
  data,
  queriedElements,
  pushNewToDo,
  deleteToDoAtAnyIndex,
  insertToDoAtAnyIndex,
  alterCompletedProperty,
  getIndexInLocalDatabase,
} from "/src/localDataAndElements.js";
import { commands } from "/src/consts.js";

const history = {
  position: -1,
  actions: [],
};

const undoRedoOnCreate = (id, toDo, isUndo) => {
  if (isUndo) {
    deleteToDoFromDatabase(id)
      .then(() => {
        deleteToDoAtAnyIndex(getIndexInLocalDatabase(id), 1);
        updateCountsForRemovedToDo(toDo);
        updateAnalytics();
        deleteDocumentElementUsingSelector(`[data-id="${id}"]`);
        history.position--;
      })
      .catch((e) => showSnackbar(e));
  } else {
    createToDoInDatabase(toDo)
      .then(() => {
        pushNewToDo({ ...toDo });
        checkAndRenderOneToDo(data.allTodos[data.allTodos.length - 1]);
        history.position++;
      })
      .catch((e) => showSnackbar(e));
  }
};

const findIndexToInsert = (id) => {
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
};

const undoRedoOnDelete = (id, toDo, isUndo) => {
  if (isUndo) {
    createToDoInDatabase(toDo)
      .then(() => {
        const index = findIndexToInsert(id);
        insertToDoAtAnyIndex(index, toDo);
        history.position--;
        displayToDos();
      })
      .catch((e) => showSnackbar(e));
  } else {
    deleteToDoFromDatabase(id)
      .then(() => {
        deleteToDoAtAnyIndex(getIndexInLocalDatabase(id));
        history.position++;
        displayToDos();
      })
      .catch((e) => showSnackbar(e));
  }
};

const undoRedoOnEdit = (id, toDo, oldToDo, isUndo) => {
  let toDoCopy = {};
  if (isUndo) {
    toDoCopy = { ...oldToDo };
  } else {
    toDoCopy = { ...toDo };
  }
  updateToDoInDatabase(id, toDoCopy)
    .then((returnedToDo) => {
      copyContent(data.allTodos[getIndexInLocalDatabase(id)], returnedToDo);
      displayToDos();
      if (isUndo) {
        history.position--;
      } else {
        history.position++;
      }
    })
    .catch((e) => showSnackbar(e));
};

const undoRedoOnDeleteInBulk = (ids, deletedToDos, isUndo) => {
  if (isUndo) {
    bulkCreateInDatabase(deletedToDos)
      .then(() => {
        deletedToDos.forEach((toDo) =>
          insertToDoAtAnyIndex(findIndexToInsert(toDo.ID), { ...toDo })
        );
        history.position--;
        displayToDos();
      })
      .catch((e) => showSnackbar(e));
  } else {
    bulkDeleteFromDatabase(ids)
      .then(() => {
        ids.forEach((id) => deleteToDoAtAnyIndex(getIndexInLocalDatabase(id)));
        history.position++;
        displayToDos();
      })
      .catch((e) => showSnackbar(e));
  }
};

const undoRedoOnAlterCompletionInBulk = (ids, isUndo) => {
  const indexs = [];
  const toDos = [];
  ids.forEach((id, i) => {
    const index = getIndexInLocalDatabase(id);
    indexs.push(index);
    toDos.push({ ...data.allTodos[index] });
    toDos[i].completed = !toDos[i].completed;
  });
  bulkUpdateInDatabase(ids, toDos)
    .then(() => {
      indexs.forEach((index) => alterCompletedProperty(index));
      displayToDos();
      if (isUndo) {
        history.position--;
      } else {
        history.position++;
      }
    })
    .catch((e) => showSnackbar(e));
};

export const undo = () => {
  if (history.position === -1) return;
  console.log(history.position);

  switch (history["actions"][history.position].command) {
    case commands.EDIT:
      undoRedoOnEdit(
        history["actions"][history.position]["IDs"][0],
        history["actions"][history.position]["toDos"][0],
        history["actions"][history.position]["oldToDos"][0],
        true
      );
      break;
    case commands.ALTERCOMPLETIONINBULK:
      undoRedoOnAlterCompletionInBulk(
        history["actions"][history.position]["IDs"],
        true
      );
      break;
    case commands.CREATE:
      undoRedoOnCreate(
        history["actions"][history.position]["IDs"][0],
        history["actions"][history.position]["toDos"][0],
        true
      );
      break;
    case commands.DELETE:
      undoRedoOnDelete(
        history["actions"][history.position]["IDs"][0],
        history["actions"][history.position]["oldToDos"][0],
        true
      );
      break;
    case commands.DELETEINBULK:
      undoRedoOnDeleteInBulk(
        history["actions"][history.position]["IDs"],
        history["actions"][history.position]["oldToDos"],
        true
      );
      break;
    default:
      break;
  }
};
export const redo = () => {
  if (history.position === history.actions.length - 1) return;
  console.log(history.position);
  switch (history["actions"][history.position + 1].command) {
    case commands.EDIT:
      undoRedoOnEdit(
        history["actions"][history.position + 1]["IDs"][0],
        history["actions"][history.position + 1]["toDos"][0],
        history["actions"][history.position + 1]["oldToDos"][0],
        false
      );
      break;
    case commands.ALTERCOMPLETIONINBULK:
      undoRedoOnAlterCompletionInBulk(
        history["actions"][history.position + 1]["IDs"],
        false
      );
      break;
    case commands.CREATE:
      undoRedoOnCreate(
        history["actions"][history.position + 1]["IDs"][0],
        history["actions"][history.position + 1]["toDos"][0],
        false
      );
      break;
    case commands.DELETE:
      undoRedoOnDelete(
        history["actions"][history.position + 1]["IDs"][0],
        history["actions"][history.position + 1]["oldToDos"][0],
        false
      );
      break;
    case commands.DELETEINBULK:
      undoRedoOnDeleteInBulk(
        history["actions"][history.position + 1]["IDs"],
        history["actions"][history.position + 1]["oldToDos"],
        false
      );
      break;
    default:
      break;
  }
};

export const addActions = (commandType, toDoIDs, toDos, oldToDos) => {
  history.actions = history.actions.slice(0, history.position + 1);
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
  history.actions.push(newAction);
  history.position++;
  // console.log(history.position, history.actions[history.position]);
};
