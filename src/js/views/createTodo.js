const collectInputFromDOM = (event, callback) => {
  const title = document.querySelector("#todo-title");
  const urgency = document.querySelector("#urgency-input");
  const category = document.querySelector("#category-input");

  if (title.nodeValue.trim() !== "") {
    callback(title.value, urgency.selectedIndex, category.selectedIndex);
  }

  title.value = "";
};

const bindAddTodo = (callback) => {
  document
    .querySelector("#todo-add-btn")
    .addEventListener("click", (event) => collectInputFromDOM(event, callback));
};

export default {
  bindAddTodo,
};
