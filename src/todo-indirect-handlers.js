export const indirectHandlersForTodo = {
  updateToDo: (toDo, updatedToDo, render) => {
    mockServer
      .updateToDoInDatabase(updatedToDo.ID, updatedToDo)
      .then((returnedToDo) => {
        const index = localData.getIndexInLocalDatabase(id);
        addActions(
          commands.EDIT,
          [toDo.ID],
          [{ ...returnedToDo }],
          [{ ...toDo }]
        );
        localData.replaceTodoAtAnyIndex(index, { ...returnedToDo });
        render();
      })
      .catch((e) => showSnackbar(e));
  },

  addListenerToModalUpdateBtn: (btnID, toDo, updateModal) => {
    const updateBtn = getDocumentElementUsingSelector(`#${btnID}`);
    updateBtn.addEventListener("click", () => {
      const updatedTitle = updateModal.querySelector("#updateToDoTitle").value;

      if (updatedTitle.trim() !== "") {
        const updatedToDo = { ...toDo };
        updatedToDo.title = updatedTitle;
        updatedToDo.urgency = updateModal.querySelector(
          "#updatedUrgency"
        ).selectedIndex;
        updatedToDo.category = updateModal.querySelector(
          "#updatedCategory"
        ).selectedIndex;

        this.updateToDo(toDo, updatedToDo);
        updateModal.remove();
      }
    });
  },

  addListenerToModalCancelBtn: (btnID, updateModal) => {
    const cancelBtn = getDocumentElementUsingSelector(`#${btnID}`);
    cancelBtn.addEventListener("click", () => updateModal.remove());
  },

  filterCurSelectedToDoArray: (ids) => {
    const newIds = [];
    ids.forEach((id) => {
      if (!localData.getToDo(localData.getIndexInLocalDatabase(id)).completed) {
        newIds.push(id);
      }
    });
    return newIds;
  },

  makeArrayOfIndexsAndToDos: (selectedIds, indexs, toDos) => {
    selectedIds.forEach((id, i) => {
      const index = localData.getIndexInLocalDatabase(id);
      toDos.push({ ...localData.getToDo(index) });
      indexs.push(index);
      toDos[toDos.length - 1].completed = true;
    });
  },
};
