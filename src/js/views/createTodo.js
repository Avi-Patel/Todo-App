const collectTodoInputsFromDOM = (handleAddTodo) => {
  const title = document.querySelector("#todo-title");
  const urgency = document.querySelector("#urgency-input");
  const category = document.querySelector("#category-input");

  if (title.value.trim() !== "") {
    handleAddTodo(title.value, urgency.value, category.value);
  }
};

const bindAddTodo = (handleAddTodo) => {
  document
    .querySelector("#todo-add-btn")
    .addEventListener("click", (event) =>
      collectTodoInputsFromDOM(handleAddTodo)
    );
};

const resetValuesInCreateTodoBox = () => {
  document.querySelector("#todo-title").value = "";
  document.querySelector("#urgency-input").selectedIndex = 0;
  document.querySelector("#category-input").selectedIndex = 0;
};

export default {
  bindAddTodo,
  resetValuesInCreateTodoBox,
};
