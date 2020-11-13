// Any code for custom elements

$("cc-blocker").click(function() {
  $(this).parent().removeClass("show");
  $("body").removeAttr("style");
});

$("cc-button[type='negative']").click(function() {
  $(this).parent().parent().removeClass("show");
  $("body").removeAttr("style");
});
