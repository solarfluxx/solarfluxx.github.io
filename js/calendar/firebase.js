var shiftsRef,
userId;

calendar.firebase = {
  getUserShifts: function(year, month) {
    var state = user.location.substring(0,2);
    var city = user.location.substring(3);
    shiftsRef = firebase.database().ref("shifts/"+state+"/"+city+"/"+date.year+"/"+(date.month+1)+"/");

    shiftsRef.once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var state_un = 0,
            state_ac = 0,
            state_de = 0,
            loop_date = childSnapshot.key-1;
        childSnapshot.forEach(function(childSnapshot2) {
          childSnapshot2.forEach(function(childSnapshot3) {
            userId = childSnapshot3.val().id;
            if (userId == user.uid) {
              switch (childSnapshot3.val().state) {
                case 0:
                  state_un++;
                  break;
                case 1:
                  state_ac++;
                  break;
                case 2:
                  state_de++;
                  break;
              }
            }
          });
        });
        calendar.createShift.all(loop_date, state_ac, state_de, state_un);
      });
    });


  }
}
