let root = document.documentElement;
var togglenavbar = true,
animation_state = true,
window_state = false,
window_stage = [1090, 1480],
navbar = {
  element: null,
  animation: {
    enable: null,
    disable: null
  },
  size: null,
  stage: 2,
  toggle: null
};

navbar.animation.enable = function() {
  root.style.setProperty('--navbar-transition', root.style.getPropertyValue('--navbar-transition-on'));
};

navbar.animation.disable = function() {
  root.style.setProperty('--navbar-transition', "unset");
};

navbar.size = function(stage) {
  switch (stage) {
    case 0:
      root.style.setProperty('--navbar-width', "0px");
      root.style.setProperty('--navbar-true-width', "0px");
      navbar.stage = 0;
      break;
    case 1:
      root.style.setProperty('--navbar-width', "68px");
      root.style.setProperty('--navbar-true-width', "68px");
      root.style.setProperty('--sidenav-padding-right', root.style.getPropertyValue('--sidenav-padding-right-on'));
      root.style.setProperty('--sidenav-padding-left', root.style.getPropertyValue('--sidenav-padding-left-on'));
      root.style.setProperty('--sidenav-navtext-opacity', "0");
      navbar.stage = 1;
      break;
    case 2:
      root.style.setProperty('--navbar-width', "256px");
      root.style.setProperty('--navbar-true-width', "256px");
      root.style.setProperty('--sidenav-padding-right', root.style.getPropertyValue('--sidenav-padding-off'));
      root.style.setProperty('--sidenav-padding-left', root.style.getPropertyValue('--sidenav-padding-off'));
      root.style.setProperty('--sidenav-navtext-opacity', "1");
      navbar.stage = 2;
      break;
    case 3:
      root.style.setProperty('--navbar-true-width', "256px");
      root.style.setProperty('--sidenav-padding-right', root.style.getPropertyValue('--sidenav-padding-off'));
      root.style.setProperty('--sidenav-padding-left', root.style.getPropertyValue('--sidenav-padding-off'));
      root.style.setProperty('--sidenav-navtext-opacity', "1");
      navbar.stage = 2;
      break;
  }
};

navbar.toggle = function() {
  navbar.animation.enable();
  if ($(window).width() > window_stage[1]) {
    if (navbar.stage == 2) navbar.size(1); else if (navbar.stage == 1) navbar.size(2);
  } else {
    if (navbar.stage == 0) navbar.size(3); else if (navbar.stage == 3) navbar.size(0);
  }
};

navbarResize(false);

$(window).resize(function() {
  navbarResize(true);
});

function navbarResize(animation) {
  if (animation) {
    navbar.animation.enable();
  } else {
    navbar.animation.disable();
  }
  if ($(window).width() < window_stage[0]) {
    navbar.size(0);
  } else if ($(window).width() < window_stage[1]) {
    navbar.size(1);
  } else {
    navbar.size(2);
  }
}
