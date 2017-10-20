function sym(args) {
    var sets = [].slice.call(arguments);
    var map = {};
    var symDif = [];
    
    sets.forEach(function(thisSet) {
      //keep track of what we've already seen in this set
      var localMap = {};
      thisSet.forEach(function(item) {
        //loop through elements in this set
        var key = "m" + item;
        if (!localMap.hasOwnProperty(key)) {
          //first time for this set, so do stuff
          localMap[key] = item;
          if(map.hasOwnProperty(key)) {
            //had in last set, so remove
            delete map[key];
          } else {
            //new to set
            map[key] = item;
          }
        }
      });
    });
    
    Object.keys(map).forEach(function(key) {
        symDif.push(map[key]);
    });
    return symDif;
  }
  
  sym([1, 1, 2, 5], [2, 2, 3, 5], [3, 4, 5, 5]);