var test;

var buttons = document.getElementsByTagName("cc-tut-button");
for (var i = 0; i < buttons.length; i++) {

  buttons[i].addEventListener("mousedown", function(event) {
    event.target.appendChild(new Ripple(event).element);
  });
}

var skip_button = document.querySelector("cc-tut-button[skip]");
if (skip_button != null) {
  skip_button.addEventListener("click", function(event) {
    event.target.parentElement.parentElement.classList.add("hideTut");
    setTimeout(function() {
      event.target.parentElement.parentElement.remove();
      var snack = new Snackbar("You can view the tutorial by going to Profile &#129046; Play Tutorial", preset.snackbar.length.long, true);
      snack.click(function() {
        controller.page.goto("profile", ['to="tutorial"']);
      });
      snack.show();
    }, 200);
  });
}
