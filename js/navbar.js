let root = document.documentElement;
var togglenavbar = true;

var navbar = {
  element: null,
  compact: null,
  expand: null,
  toggle: null
}

navbar.compact = function(full) {
  if (full) root.style.setProperty('--navbar-width', 0); else root.style.setProperty('--navbar-width', "68px");
}

navbar.expand = function() {
  root.style.setProperty('--navbar-width', "256px");
}

navbar.toggle = function() {
  if (togglenavbar) {
    navbar.compact(false);
    togglenavbar = false;
  } else {
    navbar.expand();
    togglenavbar = true;
  }
}

if ($(window).width() < 950) {
  navbar.compact(true);
}

$(window).resize(function() {
  if ($(window).width() < 950) {
    navbar.compact(true);
  }
});

$(window).resize(function() {
  if ($(window).width() > 950) {
    navbar.expand();
  }
});
