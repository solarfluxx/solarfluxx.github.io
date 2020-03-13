var cUser;
function User(id, first, last, email, location, permissions) {
  this.id = id;
  this.firstName = first;
  this.lastName = last;
  this.email = email;
  this.location = location;
  if (permissions != undefined) {
    this.admin = permissions.includes("admin");
    this.perms = permissions;
  }
  this.state = this.location.substring(0,2);
  this.city = this.location.substring(3);
}

firebase.auth().onAuthStateChanged(function(loggedUser) {
  if (loggedUser) {
    var displayName = loggedUser.displayName;
    var email = loggedUser.email;
    var emailVerified = loggedUser.emailVerified;
    var photoURL = loggedUser.photoURL;
    var isAnonymous = loggedUser.isAnonymous;
    var uid = loggedUser.uid;
    var providerData = loggedUser.providerData;

    firebase.database().ref('users/' + uid).once('value').then(function(snapshot) {
      cUser = new User(loggedUser.uid, snapshot.val().firstname, snapshot.val().lastname, loggedUser.email, snapshot.val().location, snapshot.val().perm);

      $("cc-name").html(cUser.firstName + " " + cUser.lastName);
      $("cc-email").html(cUser.email);
      getLocations();
      if (!cUser.admin) {
        controller.page.goto("home.html");
      } else {
        $("cc-loader").toggleClass("hide");
        var timer = setTimeout(function() {$("cc-loader").remove()}, 500);
      }
    });

  } else {
    if (window.location.host == "") {
      controller.page.goto("index.html");
    } else {
      controller.page.goto("");
    }
  }
});
