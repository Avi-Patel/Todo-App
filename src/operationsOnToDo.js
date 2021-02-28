// import { createModal } from "/src/createFunctions.js";
import { showSnackbar } from "/src/otherFunctions.js";
import { commands } from "/src/consts.js";
import { indirectHandlersForTodo } from "./todo-indirect-handlers.js";

export const todoActionHandlers = ({
  mockServer,
  localData,
  history,
  render,
}) => {
  return {
    deleteToDo: (id) => {
      mockServer
        .deleteToDoFromDatabase(id)
        .then(() => {
          const index = localData.getIndexInLocalDatabase(id);
          history.addActions(commands.DELETE, [id], undefined, [
            { ...localData.getToDo(index) },
          ]);
          localData.deleteToDoAtAnyIndex(index);
          render();
        })
        .catch((e) => showSnackbar(e));
    },

    addOrRemoveFromSelected: (id) => {
      const indexInSelected = localData.getCurrentSelected().indexOf(id);
      const selectCircle = document.querySelector(
        `[data-id="${id}"] [data-type=${commands.SELECT}]`
      );
      if (indexInSelected === -1) {
        localData.pushIdToCurrentSelected(id);
        changeBtnStyleForSelection(selectCircle, true);
      } else {
        localData.deleteIdFromCurrentSelected(id);
        changeBtnStyleForSelection(selectCircle, false);
      }
    },

    alterCompletionOfToDo: (id) => {
      console.log("alter completed called");
      localData.deleteIdFromCurrentSelected(id);
      const index = localData.getIndexInLocalDatabase(id);
      const updatedToDo = { ...localData.getToDo(index) };
      updatedToDo.completed = !updatedToDo.completed;
      indirectHandlersForTodo.updateToDo(getToDo(index), updatedToDo, render);
    },

    editToDo: (id) => {
      const indexInToDos = localData.getIndexInLocalDatabase(id);
      const toDo = localData.getToDo(indexInToDos);
      const updateModal = createModal(toDo.title, toDo.urgency, toDo.category);
      updateModal.querySelector("#updatedUrgency").selectedIndex = toDo.urgency;
      updateModal.querySelector("#updatedCategory").selectedIndex =
        toDo.category;
      document.body.appendChild(updateModal);

      indirectHandlersForTodo.addListenerToModalUpdateBtn(
        "updateToDoBtn",
        toDo,
        updateModal
      );
      nonDirindirectHandlersForTodoectHandlers.addListenerToModalCancelBtn(
        "cancelUpdateBtn",
        updateModal
      );
    },

    clearSelection: () => {
      localData.getCurrentSelected().forEach((id) => {
        const selectCircle = document.querySelector(
          `[data-id="${id}"] [data-type=${commands.SELECT}]`
        );
        changeBtnStyleForSelection(selectCircle, false);
      });
      localData.emptyCurrentSelectedArray();
    },

    completeAllSelectedTodos: () => {
      const toDosforUpdation = [];
      const indexsForUpdation = [];
      localData.setCurrenctSelected(
        nonDirectHandlers.filterCurSelectedToDoArray(
          localData.getCurrentSelected()
        )
      );
      nonDirectHandlers.makeArrayOfIndexsAndToDos(
        localData.getCurrentSelected(),
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
            ...localData.getCurrentSelected(),
          ]);
          localData.emptyCurrentSelectedArray();
          render();
        })
        .catch((e) => showSnackbar(e));
    },

    deleteAllSelectedToDos: () => {
      mockServer
        .bulkDeleteFromDatabase(data.getCurrentSelected())
        .then(() => {
          const deletedToDos = [];
          localData.getCurrentSelected().forEach((id) => {
            deletedToDos.push({
              ...localData.getToDo(localData.getIndexInLocalDatabase(id)),
            });
            localData.deleteToDoAtAnyIndex(
              localData.getIndexInLocalDatabase(id)
            );
          });
          history.addActions(
            commands.DELETEINBULK,
            [...localData.getCurrentSelected()],
            undefined,
            deletedToDos
          );
          localData.emptyCurrentSelectedArray();
          render();
        })
        .catch((e) => showSnackbar(e));
    },
  };
};
