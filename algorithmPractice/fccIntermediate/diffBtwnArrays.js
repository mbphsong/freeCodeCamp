function diffArrays(arr1,arr2) {
    var newArr = [];
      var map = {};
    var key = "";
    var lowerCost = false;
    if (lowerCost) {
      
      for (var i=arr1.length-1; i>=0; i--) {
          key = "m" + arr1[i];
          if (map.hasOwnProperty(key)) {
              arr1[i] = null;
          }
          else {
              map[key] = i;
          }
      }
      for (var j=arr2.length-1; j>=0; j--) {
          key = "m" + arr2[j];
          if (map.hasOwnProperty(key)) {
              arr1[map[key]] = null;
              arr2.splice(j,1);
          }
      }
      for (var k=0; k<arr1.length; k++) {
          if (arr1[k] !=  null) {
              newArr.push(arr1[k]);
          }
      }
      newArr.push.apply(newArr,arr2);
    } else {
      //more concise code
      //Higher time cost of O(n^2)
      //Probably optimized by JS engine b/c Array.prototype
      newArr = arr1.filter(function(value) {
        var index = arr2.indexOf(value);
        console.log(index);
        if (index > -1) {
          //in both arrays
          arr2[index] = null;
          return false;
        }
        console.log(value);
        return true;
      });

      newArr = newArr.concat(arr2.filter(function(value) {
        if (value != null) {
          return true;
        }
        return false;
      })
    );
    }
  
      return newArr;
}

console.log(diffArrays([1,2,3,4,5],[1,2,3,5]));
console.log(diffArrays(["diorite", "andesite", "grass", "dirt", "pink wool", "dead shrub"], ["diorite", "andesite", "grass", "dirt", "dead shrub"]));
console.log(diffArrays(["andesite", "grass", "dirt", "pink wool", "dead shrub"], ["diorite", "andesite", "grass", "dirt", "dead shrub"]));
console.log(diffArrays([1, "calf", 3, "piglet"], [7, "filly"]));