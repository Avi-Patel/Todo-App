// const saveTodos = () =>
// new Promise((resolve, reject) => {
//   todos.sort(sortTodosByID);
//   localStorage.setItem("todos", JSON.stringify(todos));
//   resolve();
// });

// const sortTodosByID = (todo1, Todo2) => todo1.ID - Todo2.ID;

export const createMockServer = () => {
  let todos = [];

  const getIndexInDatabase = (id) => {
    let index = null;
    todos.forEach((todo, i) => {
      if (todo.ID === id) index = i;
    });
    return index;
  };

  const serverWorking = () => Math.random() <= 0.98;

  return {
    getTodosFromDatabase: () =>
      new Promise((resolve, reject) => {
        let storedTodos = JSON.parse(localStorage.getItem("todos"));
        const newTodos = [];
        if (storedTodos) {
          todos = [];
          storedTodos.forEach((todo) => {
            todos = todos.concat(todo);
            newTodos.push({ ...todo });
          });
        }
        resolve(newTodos);
      }),

    storeTodosToDatabase: () =>
      new Promise((resolve, reject) => {
        localStorage.setItem("todos", JSON.stringify(todos));
        resolve();
      }),

    createTodoInDatabase: (newTodos) =>
      new Promise((resolve, reject) => {
        if (serverWorking()) {
          const newTodosAsArray = Array.isArray(newTodos)
            ? newTodos
            : [newTodos];
          newTodosAsArray.forEach(
            (newTodo) => (todos = todos.concat({ ...newTodo }))
          );
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
          const idsAsArray = Array.isArray(ids) ? ids : [ids];
          const updatedTodosAsArray = Array.isArray(updatedTodos)
            ? updatedTodos
            : [updatedTodos];

          idsAsArray.forEach((id, i) => {
            const index = getIndexInDatabase(id);
            todos = todos
              .splice(0, index)
              .concat({ ...updatedTodosAsArray[i] }, todos.splice(index + 1));
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
          const idsAsArray = Array.isArray(ids) ? ids : [ids];

          idsAsArray.forEach((id) => {
            const index = getIndexInDatabase(id);
            todos = todos.splice(0, index).concat(todos.splice(index + 1));
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
