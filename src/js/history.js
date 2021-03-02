import { commands } from "./consts.js";
import { historyActionsHandlers } from "./history-actions-handlers.js";

export const history = (mockServer, localData, render) => {
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
  };
  return historyActions;
};
