// const Btn = document.querySelector(`#markCompleted${index}`);
// data.allTodos.forEach((todo, i) => {
//   if (todo.ID === index) {
//     data.allTodos[i].completed = data.allTodos[i].completed ? false : true;
//     if (data.allTodos[i].completed) {
//       toDoItem.className = toDoItem.className.replace(
//         "originalOpacity",
//         "reduceOpacity"
//       );
//       Btn.textContent = "Completed Undo?";
//       if (queriedElements.notCompletedCheckBox.checked) {
//         toDoItem.remove();
//         data.totalCount--;
//       } else {
//         data.countCompleted++;
//       }
//     } else {
//       toDoItem.className = toDoItem.className.replace(
//         "reduceOpacity",
//         "originalOpacity"
//       );
//       Btn.textContent = "Mark Completed";
//       data.countCompleted--;
//     }
//   }
// });
// updateAnalytics();

let a = { x: 1, y: 1 };
function abc() {
  let b = { x: 2, y: 2 };
  a = b;
}
abc();
console.log(a);
