import {
  data,
  getToDo,
  deleteToDoAtAnyIndex,
  getIndexInLocalDatabase,
  alterCompletedProperty,
  emptyCurrentSelectedArray,
  deleteIdFromCurrentSelected,
} from "/src/localDataAndElements.js";
import { updateCountsForRemovedToDo, updateAnalytics } from "/src/analytics.js";
import { createModal } from "/src/createFunctions.js";
import { checkAndRenderOneToDo, displayToDos } from "/src/renderFunction.js";
import {
  deleteToDoFromDatabase,
  updateToDoInDatabase,
  bulkUpdateInDatabase,
  bulkDeleteFromDatabase,
} from "/src/server.js";
import { showSnackbar, copyContent } from "/src/otherFunctions.js";
import { addActions } from "/src/history.js";
import {
  getDocumentElementUsingSelector,
  deleteDocumentElementUsingSelector,
  changeBtnStyleForSelection,
} from "/src/index.js";
import { commands } from "/src/consts.js";

export const deleteToDo = (id) => {
  deleteToDoFromDatabase(id)
    .then(() => {
      const index = getIndexInLocalDatabase(id);
      addActions(commands.DELETE, [id], undefined, [{ ...getToDo(index) }]);
      updateCountsForRemovedToDo(data.allTodos[index]);
      deleteDocumentElementUsingSelector(`[data-id="${id}"]`);
      deleteToDoAtAnyIndex(index);
      updateAnalytics();
    })
    .catch((e) => showSnackbar(e));
};

export const addOrRemoveFromSelected = (id) => {
  const indexInSelected = data.curOnScreenSelected.indexOf(id);
  const selectCircle = getDocumentElementUsingSelector(
    `[data-id="${id}"] [data-type=${commands.SELECT}]`
  );
  if (indexInSelected === -1) {
    data.curOnScreenSelected.push(id);
    changeBtnStyleForSelection(selectCircle, true);
  } else {
    data.curOnScreenSelected.splice(indexInSelected, 1);
    changeBtnStyleForSelection(selectCircle, false);
  }
};

const updateToDo = (toDo, updatedToDo) => {
  updateToDoInDatabase(updatedToDo.ID, updatedToDo)
    .then((returnedToDo) => {
      addActions(
        commands.EDIT,
        [toDo.ID],
        [{ ...returnedToDo }],
        [{ ...toDo }]
      );
      updateCountsForRemovedToDo(toDo);
      copyContent(toDo, returnedToDo);
      checkAndRenderOneToDo(toDo);
    })
    .catch((e) => showSnackbar(e));
};

export const alterCompletionOfToDo = (id) => {
  deleteIdFromCurrentSelected(id);
  const index = getIndexInLocalDatabase(id);
  const updatedToDo = { ...getToDo(index) };
  updatedToDo.completed = !updatedToDo.completed;
  updateToDo(getToDo(index), updatedToDo);
};

const addListenerToModalUpdateBtn = (btnID, toDo, updateModal) => {
  const updateBtn = getDocumentElementUsingSelector(`#${btnID}`);
  updateBtn.addEventListener("click", () => {
    const updatedTitle = updateModal.querySelector("#updateToDoTitle").value;

    if (updatedTitle.trim() !== "") {
      const updatedToDo = { ...toDo };
      updatedToDo.title = updatedTitle;
      updatedToDo.urgency = updateModal.querySelector(
        "#updatedUrgency"
      ).selectedIndex;
      updatedToDo.category = updateModal.querySelector(
        "#updatedCategory"
      ).selectedIndex;

      updateToDo(toDo, updatedToDo);
      updateModal.remove();
    }
  });
};

const addListenerToModalCancelBtn = (btnID, updateModal) => {
  const cancelBtn = getDocumentElementUsingSelector(`#${btnID}`);
  cancelBtn.addEventListener("click", () => updateModal.remove());
};

export const editToDo = (id) => {
  const indexInToDos = getIndexInLocalDatabase(id);
  const toDo = getToDo(indexInToDos);
  const updateModal = createModal(toDo.title, toDo.urgency, toDo.category);
  updateModal.querySelector("#updatedUrgency").selectedIndex = toDo.urgency;
  updateModal.querySelector("#updatedCategory").selectedIndex = toDo.category;
  document.body.appendChild(updateModal);

  addListenerToModalUpdateBtn("updateToDoBtn", toDo, updateModal);
  addListenerToModalCancelBtn("cancelUpdateBtn", updateModal);
};

export const clearSelection = () => {
  data.curOnScreenSelected.forEach((id) => {
    const selectCircle = getDocumentElementUsingSelector(
      `[data-id="${id}"] [data-type=${commands.SELECT}]`
    );
    changeBtnStyleForSelection(selectCircle, false);
  });
  emptyCurrentSelectedArray();
};

const filterCurSelectedToDoArray = (ids) => {
  const newIds = [];
  ids.forEach((id) => {
    if (!getToDo(getIndexInLocalDatabase(id)).completed) {
      newIds.push(id);
    }
  });
  return newIds;
};

const makeArrayOfIndexsAndToDos = (selectedIds, indexs, toDos) => {
  selectedIds.forEach((id, i) => {
    const index = getIndexInLocalDatabase(id);
    toDos.push({ ...getToDo(index) });
    indexs.push(index);
    toDos[toDos.length - 1].completed = true;
  });
};

export const updateAllToCompleted = () => {
  const toDosforUpdation = [];
  const indexsForUpdation = [];
  data.curOnScreenSelected = filterCurSelectedToDoArray(
    data.curOnScreenSelected
  );
  makeArrayOfIndexsAndToDos(
    data.curOnScreenSelected,
    indexsForUpdation,
    toDosforUpdation
  );
  bulkUpdateInDatabase(data.curOnScreenSelected, toDosforUpdation)
    .then(() => {
      indexsForUpdation.forEach((index) => alterCompletedProperty(index));
      addActions(commands.ALTERCOMPLETIONINBULK, [...data.curOnScreenSelected]);
      emptyCurrentSelectedArray();
      displayToDos();
    })
    .catch((e) => showSnackbar(e));
};

export const deleteAllSelectedToDos = () => {
  bulkDeleteFromDatabase(data.curOnScreenSelected)
    .then(() => {
      const deletedToDos = [];
      data.curOnScreenSelected.forEach((id) => {
        deletedToDos.push({ ...getToDo(getIndexInLocalDatabase(id)) });
        deleteToDoAtAnyIndex(getIndexInLocalDatabase(id));
      });
      addActions(
        commands.DELETEINBULK,
        [...data.curOnScreenSelected],
        undefined,
        deletedToDos
      );
      emptyCurrentSelectedArray();
      displayToDos();
    })
    .catch((e) => showSnackbar(e));
};
