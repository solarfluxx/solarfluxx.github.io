firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("User is signed in");
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;
  } else {
    console.log("User is not signed in");
    if (window.location.host == "") {
      changePage("index");
    }
  }
});
