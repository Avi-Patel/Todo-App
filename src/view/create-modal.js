export const createModal = (title, urgencyIndex, categoryIndex) => {
  const urgency = ["low", "medium", "high"];
  const category = ["personal", "academic", "social"];
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
      value="${category[urgencyIndex]}">
      <option value="low" class="attribute">Low</option>
      <option value="medium" class="attribute">Medium</option>
      <option value="high" class="attribute">High</option>
    </select>
    <div class="normalBoldTitle mar8">Category</div>
    <select
      name="category"
      id="updated-category"
      class="updateModalPreference mar10 pad12"
      value="${urgency[categoryIndex]}">
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
