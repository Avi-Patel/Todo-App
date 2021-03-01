import { showSnackbar } from "./helper-functions.js";
import { commands } from "./consts.js";
export const indirectHandlersForTodo = (
  mockServer,
  localData,
  history,
  render
) => {
  return {
    updateTodo: (todo, updatedTodo) => {
      mockServer
        .updateTodoInDatabase(updatedTodo.ID, updatedTodo)
        .then((returnedTodo) => {
          console.log(localData);
          const index = localData.getIndexInLocalDatabase(updatedTodo.ID);
          history.addActions(
            commands.EDIT,
            [todo.ID],
            [{ ...returnedTodo }],
            [{ ...todo }]
          );
          localData.replaceTodoAtAnyIndex(index, { ...returnedTodo });
          render();
        })
        .catch((e) => showSnackbar(e));
    },

    addListenerToModalUpdateBtn: function (btnID, todo, updateModal) {
      const updateBtn = document.querySelector(`#${btnID}`);
      updateBtn.addEventListener("click", () => {
        const updatedTitle = updateModal.querySelector("#update-todo-title")
          .value;

        if (updatedTitle.trim() !== "") {
          const updatedTodo = { ...todo };
          updatedTodo.title = updatedTitle;
          updatedTodo.urgency = updateModal.querySelector(
            "#updated-urgency"
          ).selectedIndex;
          updatedTodo.category = updateModal.querySelector(
            "#updated-category"
          ).selectedIndex;

          this.updateTodo(todo, updatedTodo);
          updateModal.remove();
        }
      });
    },

    addListenerToModalCancelBtn: (btnID, updateModal) => {
      const cancelBtn = document.querySelector(`#${btnID}`);
      cancelBtn.addEventListener("click", () => updateModal.remove());
    },

    makeArrayOfIndexsAndTodos: (selectedIds) => {
      const indexs = [],
        todos = [];
      selectedIds.forEach((id, i) => {
        const index = localData.getIndexInLocalDatabase(id);
        todos.push({ ...localData.getTodo(index) });
        indexs.push(index);
        todos[todos.length - 1].completed = true;
      });
      return [indexs, todos];
    },
    changeBtnStyleForSelection: (id, selected) => {
      const target = document.querySelector(
        `[data-id="${id}"] [data-type=${commands.SELECT}]`
      );
      if (selected) {
        target.style.backgroundColor = "rgb(64, 64, 255)";
        target.style.border = "1px solid white";
      } else {
        target.style.backgroundColor = "";
      }
    },
  };
};
