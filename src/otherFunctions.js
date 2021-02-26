export const updateHeaderDate = () =>
  (document.querySelector(
    "#headerDate"
  ).textContent = `${new Date().toDateString()}`);

export const showSnackbar = (message) => {
  var snackbar = document.getElementById("snackbar");
  snackbar.className = "show";
  snackbar.textContent = message;
  setTimeout(
    () => (snackbar.className = snackbar.className.replace("show", "")),
    3000
  );
};

export const copyContent=(toDox, toDoy)=>{
  Object.keys(toDox).forEach((key)=>{
    toDox[key]=toDoy[key];
  })
}