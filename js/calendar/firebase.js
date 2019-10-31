var shiftsRef;
var userId;
calendar.firebase = {
  getUserShifts: function(year, month) {
    var state = user.location.substring(0,2);
    var city = user.location.substring(3);
    shiftsRef = firebase.database().ref("shifts/"+state+"/"+city+"/"+date.year+"/"+date.month+1+"/");

    shiftsRef.once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        childSnapshot.forEach(function(childSnapshot2) {
          childSnapshot2.forEach(function(childSnapshot3) {
            userId = childSnapshot3.val().id;
            if (userId == user.uid) {
              console.log("Found a day");
              console.log("Date: " + childSnapshot.key);
            }
          });
        });
      });
    });
  }
}
