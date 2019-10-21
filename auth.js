firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;

    var first_name = "";
    var last_name = "";

    firebase.database().ref('users/' + "l0yb3SGxsFajmC2LrHyJmxNClJu2").once('value').then(function(snapshot) {
      first_name = snapshot.val().firstname;
      last_name = snapshot.val().lastname;
      document.getElementById("dynamic_name").innerHTML = first_name + " " + last_name;
    });

  } else {
    if (window.location.host == "") {
      changePage("index");
    } else {
      changePage("");
    }
  }
});
