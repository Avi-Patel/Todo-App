const collectTodoInputsFromDOM = (handleCreateTodo) => {
  const title = document.querySelector("#todo-title");
  const urgency = document.querySelector("#urgency-input");
  const category = document.querySelector("#category-input");

  if (title.value.trim() !== "") {
    handleCreateTodo(title.value, urgency.value, category.value);
  }
};

const bindCreateTodo = (handleCreateTodo) => {
  document
    .querySelector("#todo-add-btn")
    .addEventListener("click", (event) => collectTodoInputsFromDOM(handleCreateTodo));
};

const resetValuesInCreateTodoBox = () => {
  document.querySelector("#todo-title").value = "";
  document.querySelector("#urgency-input").selectedIndex = 0;
  document.querySelector("#category-input").selectedIndex = 0;
};

export default {
  bindCreateTodo,
  resetValuesInCreateTodoBox,
};
