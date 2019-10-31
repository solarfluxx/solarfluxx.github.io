let root = document.documentElement;
var togglenavbar = true;

var navbar = {
  element: null,
  compact: null,
  expand: null,
  toggle: null
}

navbar.compact = function() {
  root.style.setProperty('--navbar-width', "68px");
}

navbar.expand = function() {
  root.style.setProperty('--navbar-width', "256px");
}

navbar.toggle = function() {
  if (togglenavbar) {
    navbar.compact();
    togglenavbar = false;
  } else {
    navbar.expand();
    togglenavbar = true;
  }
}
