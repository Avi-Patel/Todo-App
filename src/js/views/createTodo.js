const collectTodoInputsFromDOM = (callback) => {
  const title = document.querySelector("#todo-title");
  const urgency = document.querySelector("#urgency-input");
  const category = document.querySelector("#category-input");

  if (title.value.trim() !== "") {
    callback(title.value, urgency.selectedIndex, category.selectedIndex);
  }

  title.value = "";
};

const bindAddTodo = (callback) => {
  document
    .querySelector("#todo-add-btn")
    .addEventListener("click", (event) => collectTodoInputsFromDOM(callback));
};

export default {
  bindAddTodo,
};
