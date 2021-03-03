const addListenerToModalUpdateBtn = (btnID, todo, updateModal, callback) => {
  const updateBtn = document.querySelector(`#${btnID}`);
  updateBtn.addEventListener("click", () => {
    const updatedTitle = updateModal.querySelector("#update-todo-title").value;
    const updatedUrgency = updateModal.querySelector("#updated-urgency").value;
    const updatedCategory = updateModal.querySelector("#updated-category")
      .value;

    if (updatedTitle.trim() !== "") {
      const updatedTodo = {
        ...todo,
        title: updatedTitle,
        urgency: updatedUrgency,
        category: updatedCategory,
      };
      callback(updatedTodo);
      updateModal.remove();
    }
  });
};

const addListenerToModalCancelBtn = (btnID, updateModal) => {
  const cancelBtn = document.querySelector(`#${btnID}`);
  cancelBtn.addEventListener("click", () => updateModal.remove());
};

const createModal = (title, urgency, category) => {
  const updateModal = document.createElement("div");
  updateModal.classList.add("updateModal");

  updateModal.innerHTML = `<div class="modalContent b12 pad12">
    <div class="cwhite normalBoldTitle marTB8">Update To-Do</div>
    <input
      type="text"
      class="updateModalPreference mar10 pad12"
      id="update-todo-title"
      placeholder="Add Todo Title"
      value="${title}"s/>
    <div class="normalBoldTitle mar8">Urgency</div>
    <select
      name="urgency"
      id="updated-urgency"
      class="updateModalPreference mar10 pad12"
      value="${urgency}">
      <option value="low" class="attribute">Low</option>
      <option value="medium" class="attribute">Medium</option>
      <option value="high" class="attribute">High</option>
    </select>
    <div class="normalBoldTitle mar8">Category</div>
    <select
      name="category"
      id="updated-category"
      class="updateModalPreference mar10 pad12"
      value="${category}">
      <option value="personal" class="attribute">Personal</option>
      <option value="academic" class="attribute">Academic</option>
      <option value="social" class="attribute">Social</option>
    </select>
    <div>
      <button class="greenBtn mar8" id="updateTodoBtn">Update</button>
      <button class="greenBtn mar8" id="cancelUpdateBtn">Cancel</button>
    </div>
  </div>`;

  return updateModal;
};

export const showModal = (todo, callback) => {
  const updateModal = createModal(todo.title, todo.urgency, todo.category);
  updateModal.querySelector("#updated-urgency").value = todo.urgency;
  updateModal.querySelector("#updated-category").value = todo.category;
  document.body.appendChild(updateModal);

  addListenerToModalUpdateBtn("updateTodoBtn", todo, updateModal, callback);
  addListenerToModalCancelBtn("cancelUpdateBtn", updateModal);
};
