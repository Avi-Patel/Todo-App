import { showSnackbar, copyContent } from "./otherFunctions.js";

const findIndexToInsert = (id, localData) => {
  let index = localData.allTodos.length;
  localData.allTodos.forEach((todo, i) => {
    if (todo.ID > id && i > 0 && localData.allTodos[i - 1].ID < id) {
      index = i;
    }
  });
  if (localData.allTodos.length === 0 || id < localData.allTodos[0].ID) {
    index = 0;
  }
  return index;
};

export const historyActionsHandlers = (mockServer, localData, render) => {
  return {
    onCreate: (id, position, isUndo) => {
      return mockServer
        .deleteTodoFromDatabase(id)
        .then(() => {
          localData.deleteTodoAtAnyIndex(localData.getIndexInLocalDatabase(id));
          render();
          isUndo ? position-- : position++;
        })
        .catch((e) => showSnackbar(e))
        .then(() => position);
    },

    onDelete: (id, todo, position, isUndo) => {
      return mockServer
        .createTodoInDatabase(todo)
        .then(() => {
          const index = findIndexToInsert(id, localData);
          localData.insertTodoAtAnyIndex(index, todo);
          isUndo ? position-- : position++;
          render();
        })
        .catch((e) => showSnackbar(e))
        .then(() => position);
    },

    onEdit: (id, todo, oldTodo, position, isUndo) => {
      let todoCopy = {};
      if (isUndo) {
        todoCopy = { ...oldTodo };
      } else {
        todoCopy = { ...todo };
      }
      return mockServer
        .updateTodoInDatabase(id, todoCopy)
        .then((returnedTodo) => {
          copyContent(
            localData.allTodos[localData.getIndexInLocalDatabase(id)],
            returnedTodo
          );
          render();
          if (isUndo) {
            position--;
          } else {
            position++;
          }
        })
        .catch((e) => showSnackbar(e))
        .then(() => position);
    },

    onDeleteInBulk: (ids, deletedTodos, position, isUndo) => {
      if (isUndo) {
        return mockServer
          .bulkCreateInDatabase(deletedTodos)
          .then(() => {
            deletedTodos.forEach((todo) => {
              console.log(findIndexToInsert(todo.ID, localData), {
                ...todo,
              });
              localData.insertTodoAtAnyIndex(
                findIndexToInsert(todo.ID, localData),
                {
                  ...todo,
                }
              );
            });
            position--;
            render();
          })
          .catch((e) => showSnackbar(e))
          .then(() => position);
      } else {
        return mockServer
          .bulkDeleteFromDatabase(ids)
          .then(() => {
            ids.forEach((id) =>
              localData.deleteTodoAtAnyIndex(
                localData.getIndexInLocalDatabase(id)
              )
            );
            position++;
            render();
          })
          .catch((e) => showSnackbar(e))
          .then(() => position);
      }
    },

    onAlterCompletionInBulk: (ids, position, isUndo) => {
      const indexs = [];
      const todos = [];
      ids.forEach((id, i) => {
        const index = localData.getIndexInLocalDatabase(id);
        indexs.push(index);
        todos.push({ ...localData.allTodos[index] });
        todos[i].completed = !todos[i].completed;
      });
      return mockServer
        .bulkUpdateInDatabase(ids, todos)
        .then(() => {
          indexs.forEach((index) => localData.alterCompletedProperty(index));
          render();
          if (isUndo) {
            position--;
          } else {
            position++;
          }
        })
        .catch((e) => showSnackbar(e))
        .then(() => position);
    },
  };
};
