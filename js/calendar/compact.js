var compact_state = false;

function toggle() {
  if (compact_state == false) compact(); else expand(true);
}

function compact() {
  icon_compact.setAttribute("class", "arrow_expand");
  compact_state = true;
  for (i = 0; i < calendar.items.length; i++) {
    if (!calendar.items[i].classList.contains("has-info") && !calendar.items[i].classList.contains("day--disabled")) {
      $(calendar.items[i]).removeClass('show');
      $(calendar.items[i]).addClass('hide');
    }
  }
}

function expand(animation) {
  icon_compact.setAttribute("class", "arrow_condense");
  compact_state = false;
  for (i = 0; i < calendar.items.length; i++) {
    if (!calendar.items[i].classList.contains("has-info") && !calendar.items[i].classList.contains("day--disabled")) {
      if (animation) {
        $(calendar.items[i]).removeClass('hide');
        $(calendar.items[i]).addClass('show');
      } else {
        $(calendar.items[i]).removeClass('hide');
        $(calendar.items[i]).removeClass('show');
      }
    }
  }
}

$(window).resize(function() {
  if ($(window).width() > 950) {
    expand(false);
  }
});

function doStagerAnim() {
  for (var i=0; i < calendar.items.length; i++) {
    var toggleItemMove = getToggleItemMove(i);
    setTimeout(toggleItemMove, i * 15);
  }
}

function getToggleItemMove(i) {
  var item = calendar.items[i];
  return function() {
    item.classList.toggle('stagger');
  }
}
