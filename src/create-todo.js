import { showSnackbar } from "/src/otherFunctions.js";
import { commands } from "/src/consts.js";

const createTodoObject = ({ counter, title, urgency, category }) => ({
  ID: counter,
  date: new Date().toLocaleString(),
  title: title,
  urgency: urgency,
  category: category,
  completed: false,
});

const collectInputsForTodo = () => {
  const TDTitleInput = document.querySelector("#todo-title");
  const title = TDTitleInput.value.trim();
  TDTitleInput.focus();
  const urgency = document.querySelector("#urgency-input").selectedIndex;
  const category = document.querySelector("#category-input").selectedIndex;
  return [title, urgency, category];
};

const createTodo = ({ todoItem, mockServer, localData, history, render }) => {
  mockServer
    .createTodoInDatabase(todoItem)
    .then(() => {
      localData.pushNewTodo(todoItem);
      localData.setCounter(localData.getCounter() + 1);
      history.addActions(commands.CREATE, [todoItem.ID], [{ ...todoItem }]);
      render();
      document.querySelector("#todo-title").value = "";
    })
    .catch((e) => {
      showSnackbar(e);
    });
};

export const createAndAddTodo = ({
  mockServer,
  localData,
  history,
  render,
}) => {
  const [title, urgency, category] = collectInputsForTodo();
  if (title === "") return;
  const todoItem = createTodoObject({
    counter: localData.getCounter(),
    title,
    urgency,
    category,
  });

  createTodo({ todoItem, mockServer, localData, history, render });
};
