var user = {
  uid: "",
  email: "",
  first_name: null,
  last_name: null,
  location: null
};

firebase.auth().onAuthStateChanged(function(loggedUser) {
  if (loggedUser) {
    var displayName = loggedUser.displayName;
    var email = loggedUser.email;
    var emailVerified = loggedUser.emailVerified;
    var photoURL = loggedUser.photoURL;
    var isAnonymous = loggedUser.isAnonymous;
    var uid = loggedUser.uid;
    var providerData = loggedUser.providerData;

    user.uid = uid;
    user.email = email;

    firebase.database().ref('users/' + uid).once('value').then(function(snapshot) {

      user.first_name = snapshot.val().firstname;
      user.last_name = snapshot.val().lastname;
      user.location = snapshot.val().location;
      document.getElementById("dynamic_name").innerHTML = user.first_name + " " + user.last_name;
    });

  } else {
    if (window.location.host == "") {
      changePage("index");
    } else {
      changePage("");
    }
  }
});
