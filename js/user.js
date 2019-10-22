firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;

    var data = [displayName, email, emailVerified, photoURL, isAnonymous, uid, providerData]
    UserIsLoggedIn(data);
  } else {
    UserIsLoggedOut();
  }
});
