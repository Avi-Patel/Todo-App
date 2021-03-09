const collectTodoInputsFromDOM = (handleAddTodo) => {
  const title = document.querySelector("#todo-title");
  const urgency = document.querySelector("#urgency-input");
  const category = document.querySelector("#category-input");

  if (title.value.trim() !== "") {
    handleAddTodo(title.value, urgency.value, category.value);
  }

  title.value = "";
};

const bindAddTodo = (handleAddTodo) => {
  document
    .querySelector("#todo-add-btn")
    .addEventListener("click", (event) =>
      collectTodoInputsFromDOM(handleAddTodo)
    );
};

export default {
  bindAddTodo,
};
