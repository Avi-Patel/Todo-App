// const saveTodos = () =>
// new Promise((resolve, reject) => {
//   todos.sort(sortTodosByID);
//   localStorage.setItem("todos", JSON.stringify(todos));
//   resolve();
// });

// const sortTodosByID = (todo1, Todo2) => todo1.ID - Todo2.ID;

export const createMockServer = () => {
  const todos = [];

  const getIndexInDatabase = (id) => {
    let index = null;
    todos.forEach((todo, i) => {
      if (todo.ID === id) index = i;
    });
    return index;
  };

  const serverWorking = () => Math.random() <= 0.98;

  return {
    createTodoInDatabase: (newTodos) =>
      new Promise((resolve, reject) => {
        if (serverWorking()) {
          newTodos.forEach((newTodo) => todos.push({ ...newTodo }));
          resolve();
        } else {
          reject(
            "Opps!! something went wrong server side, plz try again after sometime"
          );
        }
      }),

    updateTodoInDatabase: (ids, updatedTodos) =>
      new Promise((resolve, reject) => {
        if (serverWorking()) {
          ids.forEach((id, i) => {
            todos[getIndexInDatabase(id)] = { ...updatedTodos[i] };
          });
          resolve();
        } else {
          reject(
            "Opps!! Cannot update right now, plz try again after sometime"
          );
        }
      }),

    deleteTodoFromDatabase: (ids) =>
      new Promise((resolve, reject) => {
        if (serverWorking()) {
          ids.forEach((id) => {
            todos.splice(getIndexInDatabase(id), 1);
          });
          resolve();
        } else {
          reject(
            "Opps!! something went wrong while deleting TODO, plz try again after sometime"
          );
        }
      }),
  };
};
