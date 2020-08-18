var cUser;
function User(id, first, last, email, location, phone, permissions) {
  this.id = id;
  this.firstName = first;
  this.lastName = last;
  this.phoneNumber = phone;
  this.email = email;
  this.location = location;
  this.state = this.location.substring(0,2);
  this.city = this.location.substring(3);

  if (permissions != undefined) {
    this.admin = permissions.includes("admin");
    this.perms = permissions;
  }

  this.updateInfo = function() {
    let data;
    if (this.phoneNumber == undefined) data = {firstname: this.firstName, lastname: this.lastName}; else data = {firstname: this.firstName, lastname: this.lastName, phonenumber: this.phoneNumber};
    firebase.database().ref('users/' + this.id).update(data);

    $("cc-name").html(cUser.firstName + " " + cUser.lastName);
    $("cc-email").html(cUser.email);
  }
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
      cUser = new User(loggedUser.uid, snapshot.val().firstname, snapshot.val().lastname, loggedUser.email, snapshot.val().location, snapshot.val().phonenumber, snapshot.val().perm);
      if (!cUser.admin) {
        $("#adminlink").remove();
        $("#addUser").remove();
        $(".removeUser").remove();
      }

      $("cc-name").html(cUser.firstName + " " + cUser.lastName);
      $("cc-email").html(cUser.email);

      custom_input.load(document);

      if (typeof calendar !== 'undefined') calendar.firebase.getShiftNames();
      getLocations();
      if (typeof calendar !== 'undefined' && schedule) {
        calendar.firebase.getAllShifts();
  			choose_user_shift.populate();
      } else if (typeof calendar !== 'undefined') calendar.firebase.getUserShifts();

      if (typeof doStagerAnim !== 'undefined') doStagerAnim();
      $("cc-page-loader").toggleClass("hide");
      var timer = setTimeout(function() {$("cc-loader").remove()}, 500);

      window.dispatchEvent(new Event('loggedin'));
    });

  } else {
    if (window.location.host == "") {
      controller.page.goto("index");
    } else {
      controller.page.goto("");
    }
  }
});
