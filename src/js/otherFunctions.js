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

export const changeFilterBtnStyle = (target, selected) => {
  if (selected) {
    target.style.backgroundColor = "rgb(45, 45, 45)";
    target.style.boxShadow = "0px 0px 4px 2px white";
  } else {
    target.style.backgroundColor = "black";
    target.style.boxShadow = "";
  }
};

export const extractClosestNodeFromPath = (event, type) =>
  event.target.closest(type);

export const copyContent = (todox, todoy) => {
  Object.keys(todox).forEach((key) => {
    todox[key] = todoy[key];
  });
};

export const createElement = (
  tagName,
  properties,
  styleProperties,
  textContent,
  parent
) => {
  const element = document.createElement(tagName);
  if (properties) {
    Object.keys(properties).forEach((property) => {
      element.setAttribute(property, properties[property]);
    });
  }
  if (styleProperties) {
    Object.keys(styleProperties).forEach((styleProperty) => {
      element.style.styleProperty = properties[styleProperty];
    });
  }
  if (textContent) element.textContent = textContent;
  if (parent) parent.appendChild(element);
  return element;
};
