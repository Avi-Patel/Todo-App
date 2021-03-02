export const showSnackbar = (message) => {
  var snackbar = document.getElementById("snackbar");
  snackbar.className = "show";
  snackbar.textContent = message;
  setTimeout(
    () => (snackbar.className = snackbar.className.replace("show", "")),
    3000
  );
};

export const extractClosestNodeFromPath = (event, type) =>
  event.target.closest(type);
