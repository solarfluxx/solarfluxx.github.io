var compactState = false;

function toggle() {
  if (compactState == false) compact(); else expand(true);
}

function compact() {
  compact_icon.setAttribute("class", "arrow_expand");
  compactState = true;
  for (i = 0; i < items.length; i++) {
    if (!items[i].classList.contains("has-info") && !items[i].classList.contains("day--disabled")) {
      items[i].setAttribute("class", "day hide");
    }
  }
}

function expand(animation) {
  compact_icon.setAttribute("class", "arrow_condense");
  compactState = false;
  for (i = 0; i < items.length; i++) {
    if (!items[i].classList.contains("has-info") && !items[i].classList.contains("day--disabled")) {
      if (animation) {
        items[i].setAttribute("class", "day show");
      } else {
        items[i].setAttribute("class", "day");
      }
    }
  }
}

$(window).resize(function() {
  if ($(window).width() > 950) {
    expand(false);
  }
});
