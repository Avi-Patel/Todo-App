import { createModal } from "../js/view/create-modal.js";
import { showSnackbar } from "./helper-functions.js";
import { commands } from "./consts.js";
import { indirectHandlersForTodo } from "./todo-indirect-handlers.js";

export const todoActionHandlers = ({
  mockServer,
  localData,
  history,
  render,
}) => {
  const indirectHandlers = indirectHandlersForTodo(
    mockServer,
    localData,
    history,
    render
  );

  return {
    deleteTodo: (id) => {
      mockServer
        .deleteTodoFromDatabase(id)
        .then(() => {
          const index = localData.getIndexInLocalDatabase(id);
          history.addActions(commands.DELETE, [id], undefined, [
            { ...localData.getTodo(index) },
          ]);
          localData.deleteTodoAtAnyIndex(index);
          render();
        })
        .catch((e) => showSnackbar(e));
    },

    addOrRemoveFromSelected: (id) => {
      const indexInSelected = localData.getCurrentSelected().indexOf(id);
      if (indexInSelected === -1) {
        localData.pushIdToCurrentSelected(id);
        indirectHandlers.changeBtnStyleForSelection(id, true);
      } else {
        localData.deleteIdFromCurrentSelected(id);
        indirectHandlers.changeBtnStyleForSelection(id, false);
      }
    },

    alterCompletionOfTodo: (id) => {
      const index = localData.getIndexInLocalDatabase(id);
      const updatedTodo = { ...localData.getTodo(index) };
      updatedTodo.completed = !updatedTodo.completed;
      indirectHandlers.updateTodo(localData.getTodo(index), updatedTodo);
    },

    showModal: (id) => {
      const indexInTodos = localData.getIndexInLocalDatabase(id);
      const todo = localData.getTodo(indexInTodos);
      const updateModal = createModal(todo.title, todo.urgency, todo.category);
      updateModal.querySelector("#updated-urgency").selectedIndex =
        todo.urgency;
      updateModal.querySelector("#updated-category").selectedIndex =
        todo.category;
      document.body.appendChild(updateModal);

      indirectHandlers.addListenerToModalUpdateBtn(
        "updateTodoBtn",
        todo,
        updateModal
      );
      indirectHandlers.addListenerToModalCancelBtn(
        "cancelUpdateBtn",
        updateModal
      );
    },

    clearSelection: () => {
      localData.getCurrentSelected().forEach((id) => {
        indirectHandlers.changeBtnStyleForSelection(id, false);
      });
      localData.emptyCurrentSelectedArray();
    },

    completeAllSelectedTodos: () => {
      const [
        indexsForUpdation,
        todosforUpdation,
      ] = indirectHandlers.makeArrayOfIndexsAndTodos(
        localData.getCurrentSelected()
      );
      mockServer
        .bulkUpdateInDatabase(localData.getCurrentSelected(), todosforUpdation)
        .then(() => {
          indexsForUpdation.forEach((index, i) =>
            localData.replaceTodoAtAnyIndex(index, { ...todosforUpdation[i] })
          );
          history.addActions(commands.ALTER_COMPLETION_IN_BULK, [
            ...localData.getCurrentSelected(),
          ]);
          localData.emptyCurrentSelectedArray();
          render();
        })
        .catch((e) => showSnackbar(e));
    },

    deleteAllSelectedTodos: () => {
      mockServer
        .bulkDeleteFromDatabase(localData.getCurrentSelected())
        .then(() => {
          const deletedTodos = [];
          localData.getCurrentSelected().forEach((id) => {
            deletedTodos.push({
              ...localData.getTodo(localData.getIndexInLocalDatabase(id)),
            });
            localData.deleteTodoAtAnyIndex(
              localData.getIndexInLocalDatabase(id)
            );
          });
          history.addActions(
            commands.DELETE_IN_BULK,
            [...localData.getCurrentSelected()],
            undefined,
            deletedTodos
          );
          localData.emptyCurrentSelectedArray();
          render();
        })
        .catch((e) => showSnackbar(e));
    },
  };
};
