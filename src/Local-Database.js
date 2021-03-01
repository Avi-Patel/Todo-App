export class createLocalDatabase {
  constructor() {
    this.allTodos = [];
    this.curOnScreenSelected = [];
    this.counter = 0;
  }

  getCounter = () => this.counter;
  setCounter = (newCounter) => {
    this.counter = newCounter;
  };
  getTodo = (index) => this.allTodos[index];

  pushNewTodo = (todo) => this.allTodos.push(todo);

  deleteTodoAtAnyIndex = (index) => this.allTodos.splice(index, 1);

  insertTodoAtAnyIndex = (index, todo) => this.allTodos.splice(index, 0, todo);

  emptyAllTodosArray = () => (this.allTodos.length = 0);

  replaceTodoAtAnyIndex = (index, todo) => (this.allTodos[index] = todo);

  alterCompletedProperty = (index) =>
    (this.allTodos[index].completed = !this.allTodos[index].completed);

  getIndexInLocalDatabase = (id) => {
    let index;
    this.allTodos.forEach((todo, i) => {
      if (todo.ID === id) index = i;
    });
    return index;
  };

  emptyCurrentSelectedArray = () => (this.curOnScreenSelected.length = 0);

  setCurrentSelected = (newSelectedIds) =>
    (this.curOnScreenSelected = [...newSelectedIds]);

  getCurrentSelected = () => this.curOnScreenSelected;

  pushIdToCurrentSelected = (id) => this.curOnScreenSelected.push(id);

  deleteIdFromCurrentSelected = (id) => {
    const index = this.curOnScreenSelected.indexOf(id);
    if (index !== -1) {
      this.curOnScreenSelected.splice(index, 1);
    }
  };
}
