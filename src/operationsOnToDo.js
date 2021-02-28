import { createModal } from "/src/createFunctions.js";
import { showSnackbar } from "/src/otherFunctions.js";
import { commands } from "/src/consts.js";

export const todoActionHandlers = (mockServer, localData, history) => {
  return {
    deleteToDo: (id) => {
      mockServer
        .deleteToDoFromDatabase(id)
        .then(() => {
          const index = localData.getIndexInLocalDatabase(id);
          history.addActions(commands.DELETE, [id], undefined, [
            { ...localData.getToDo(index) },
          ]);
          // updateCountsForRemovedToDo(data.allTodos[index]);
          // deleteDocumentElementUsingSelector(`[data-id="${id}"]`);
          localData.deleteToDoAtAnyIndex(index);
          // updateAnalytics();
          displayToDos();
        })
        .catch((e) => showSnackbar(e));
    },

    addOrRemoveFromSelected: (id) => {
      const indexInSelected = localData.curOnScreenSelected.indexOf(id);
      const selectCircle = getDocumentElementUsingSelector(
        `[data-id="${id}"] [data-type=${commands.SELECT}]`
      );
      if (indexInSelected === -1) {
        localData.curOnScreenSelected.push(id);
        changeBtnStyleForSelection(selectCircle, true);
      } else {
        localData.curOnScreenSelected.splice(indexInSelected, 1);
        changeBtnStyleForSelection(selectCircle, false);
      }
    },

    updateToDo: (toDo, updatedToDo) => {
      mockServer
        .updateToDoInDatabase(updatedToDo.ID, updatedToDo)
        .then((returnedToDo) => {
          const index = localData.getIndexInLocalDatabase(id);
          addActions(
            commands.EDIT,
            [toDo.ID],
            [{ ...returnedToDo }],
            [{ ...toDo }]
          );
          // updateCountsForRemovedToDo(toDo);
          localData.replaceTodoAtAnyIndex(index, { ...returnedToDo });
          checkAndRenderOneToDo(returnedToDo);
        })
        .catch((e) => showSnackbar(e));
    },

    alterCompletionOfToDo: (id) => {
      localData.deleteIdFromCurrentSelected(id);
      const index = localData.getIndexInLocalDatabase(id);
      const updatedToDo = { ...localData.getToDo(index) };
      updatedToDo.completed = !updatedToDo.completed;
      this.updateToDo(getToDo(index), updatedToDo);
    },

    addListenerToModalUpdateBtn: (btnID, toDo, updateModal) => {
      const updateBtn = getDocumentElementUsingSelector(`#${btnID}`);
      updateBtn.addEventListener("click", () => {
        const updatedTitle = updateModal.querySelector("#updateToDoTitle")
          .value;

        if (updatedTitle.trim() !== "") {
          const updatedToDo = { ...toDo };
          updatedToDo.title = updatedTitle;
          updatedToDo.urgency = updateModal.querySelector(
            "#updatedUrgency"
          ).selectedIndex;
          updatedToDo.category = updateModal.querySelector(
            "#updatedCategory"
          ).selectedIndex;

          this.updateToDo(toDo, updatedToDo);
          updateModal.remove();
        }
      });
    },

    addListenerToModalCancelBtn: (btnID, updateModal) => {
      const cancelBtn = getDocumentElementUsingSelector(`#${btnID}`);
      cancelBtn.addEventListener("click", () => updateModal.remove());
    },

    editToDo: (id) => {
      const indexInToDos = localData.getIndexInLocalDatabase(id);
      const toDo = localData.getToDo(indexInToDos);
      const updateModal = createModal(toDo.title, toDo.urgency, toDo.category);
      updateModal.querySelector("#updatedUrgency").selectedIndex = toDo.urgency;
      updateModal.querySelector("#updatedCategory").selectedIndex =
        toDo.category;
      document.body.appendChild(updateModal);

      this.addListenerToModalUpdateBtn("updateToDoBtn", toDo, updateModal);
      this.addListenerToModalCancelBtn("cancelUpdateBtn", updateModal);
    },

    clearSelection: () => {
      localData.curOnScreenSelected.forEach((id) => {
        const selectCircle = document.querySelector(
          `[data-id="${id}"] [data-type=${commands.SELECT}]`
        );
        changeBtnStyleForSelection(selectCircle, false);
      });
      localData.emptyCurrentSelectedArray();
    },

    filterCurSelectedToDoArray: (ids) => {
      const newIds = [];
      ids.forEach((id) => {
        if (
          !localData.getToDo(localData.getIndexInLocalDatabase(id)).completed
        ) {
          newIds.push(id);
        }
      });
      return newIds;
    },

    makeArrayOfIndexsAndToDos: (selectedIds, indexs, toDos) => {
      selectedIds.forEach((id, i) => {
        const index = localData.getIndexInLocalDatabase(id);
        toDos.push({ ...localData.getToDo(index) });
        indexs.push(index);
        toDos[toDos.length - 1].completed = true;
      });
    },

    completeAllSelectedTodos: () => {
      const toDosforUpdation = [];
      const indexsForUpdation = [];
      localData.curOnScreenSelected = filterCurSelectedToDoArray(
        localData.curOnScreenSelected
      );
      makeArrayOfIndexsAndToDos(
        localData.curOnScreenSelected,
        indexsForUpdation,
        toDosforUpdation
      );
      mockServer
        .bulkUpdateInDatabase(localData.curOnScreenSelected, toDosforUpdation)
        .then(() => {
          indexsForUpdation.forEach((index) =>
            localData.alterCompletedProperty(index)
          );
          history.addActions(commands.ALTERCOMPLETIONINBULK, [
            ...localData.curOnScreenSelected,
          ]);
          localData.emptyCurrentSelectedArray();
          displayToDos();
        })
        .catch((e) => showSnackbar(e));
    },

    deleteAllSelectedToDos: () => {
      mockServer
        .bulkDeleteFromDatabase(data.curOnScreenSelected)
        .then(() => {
          const deletedToDos = [];
          localData.curOnScreenSelected.forEach((id) => {
            deletedToDos.push({
              ...localData.getToDo(localData.getIndexInLocalDatabase(id)),
            });
            localData.deleteToDoAtAnyIndex(
              localData.getIndexInLocalDatabase(id)
            );
          });
          history.addActions(
            commands.DELETEINBULK,
            [...localData.curOnScreenSelected],
            undefined,
            deletedToDos
          );
          localData.emptyCurrentSelectedArray();
          displayToDos();
        })
        .catch((e) => showSnackbar(e));
    },
  };
};
