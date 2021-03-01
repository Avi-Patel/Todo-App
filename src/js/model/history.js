import { commands } from "../consts.js";
import { historyActionsHandlers } from "../history-actions-handlers.js";

// const history = {
//   position: -1,
//   actions: [],
// };

export const history = (mockServer, localData, render) => {
  // console.log("histroy actions called");
  // console.log(mockServer, localData, render);
  let position = -1;
  const actions = [];

  const undoRedoHandlers = historyActionsHandlers(
    mockServer,
    localData,
    render
  );

  const historyActions = {
    addActions: (commandType, todoIDs, todos, oldTodos) => {
      actions.splice(position + 1, actions.length);
      const newAction = {
        command: commandType,
        IDs: todoIDs,
      };
      if (todos) {
        newAction["todos"] = todos;
      }
      if (oldTodos) {
        newAction["oldTodos"] = oldTodos;
      }
      actions.push(newAction);
      position++;
    },

    redo: () => {
      if (position === actions.length - 1) return;
      console.log(position);
      switch (actions[position + 1].command) {
        case commands.EDIT:
          undoRedoHandlers
            .onEdit(
              actions[position + 1]["IDs"][0],
              actions[position + 1]["todos"][0],
              actions[position + 1]["oldTodos"][0],
              position,
              false
            )
            .then((newPosition) => (position = newPosition));
          break;
        case commands.ALTER_COMPLETION_IN_BULK:
          undoRedoHandlers
            .onAlterCompletionInBulk(
              actions[position + 1]["IDs"],
              position,
              false
            )
            .then((newPosition) => (position = newPosition));
          break;
        case commands.CREATE:
          undoRedoHandlers
            .onDelete(
              actions[position + 1]["IDs"][0],
              actions[position + 1]["todos"][0],
              position,
              false
            )
            .then((newPosition) => (position = newPosition));

          break;
        case commands.DELETE:
          undoRedoHandlers
            .onCreate(actions[position + 1]["IDs"][0], position, false)
            .then((newPosition) => (position = newPosition));
          break;
        case commands.DELETE_IN_BULK:
          undoRedoHandlers
            .onDeleteInBulk(
              actions[position + 1]["IDs"],
              actions[position + 1]["oldTodos"],
              position,
              false
            )
            .then((newPosition) => (position = newPosition));
          break;
        default:
          break;
      }
    },

    undo: () => {
      if (position === -1) return;
      console.log(position);

      switch (actions[position].command) {
        case commands.EDIT:
          undoRedoHandlers
            .onEdit(
              actions[position]["IDs"][0],
              actions[position]["todos"][0],
              actions[position]["oldTodos"][0],
              position,
              true
            )
            .then((newPosition) => (position = newPosition));
          break;
        case commands.ALTER_COMPLETION_IN_BULK:
          undoRedoHandlers
            .onAlterCompletionInBulk(actions[position]["IDs"], position, true)
            .then((newPosition) => (position = newPosition));
          break;
        case commands.CREATE:
          undoRedoHandlers
            .onCreate(actions[position]["IDs"][0], position, true)
            .then((newPosition) => (position = newPosition));
          break;
        case commands.DELETE:
          undoRedoHandlers
            .onDelete(
              actions[position]["IDs"][0],
              actions[position]["oldTodos"][0],
              position,
              true
            )
            .then((newPosition) => (position = newPosition));
          break;
        case commands.DELETE_IN_BULK:
          undoRedoHandlers
            .onDeleteInBulk(
              actions[position]["IDs"],
              actions[position]["oldTodos"],
              position,
              true
            )
            .then((newPosition) => (position = newPosition));
          break;
        default:
          break;
      }
    },
  };
  return historyActions;
};
