// Any code for custom elements

$("cc-blocker").click(function() {
  $(this).parent().removeClass("show");
  $("body").removeAttr("style");
});
