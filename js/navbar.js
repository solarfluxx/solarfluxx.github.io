let root = document.documentElement;
var togglenavbar = true;
var animation_state = true;
var window_state = false;

var navbar = {
  element: null,
  animation: {
    enable: null,
    disable: null
  },
  compact: null,
  expand: null,
  toggle: null
}

navbar.animation.enable = function() {
  root.style.setProperty('--navbar-transition', root.style.getPropertyValue('--navbar-transition-on'));
}

navbar.animation.disable = function() {
  root.style.setProperty('--navbar-transition', "unset");
}

navbar.compact = function(full) {
  if (full) root.style.setProperty('--navbar-width', 0); else root.style.setProperty('--navbar-width', "68px");
  togglenavbar = false;
}

navbar.expand = function(full) {
  if (full) root.style.setProperty('--navbar-width', "256px"); else root.style.setProperty('--navbar-width', "68px");
  togglenavbar = true;
}

navbar.toggle = function() {
  if (togglenavbar) {
    navbar.compact(false);
  } else {
    navbar.expand(true);
  }
}

if ($(window).width() < 950) {
  navbar.animation.disable();
  navbar.compact(true);
  window_state = true;
}

$(window).resize(function() {
  if ($(window).width() < 950 && window_state == false) {
    navbar.animation.disable();
    navbar.compact(true);
    window_state = true;
  }
  if ($(window).width() > 950 && window_state == true) {
    navbar.animation.disable();
    navbar.expand(true);
    window_state = false;
  }
});
