function pairwise(arr, arg) {
    var indexSum = 0;
    var valueMap = {};
    var updateMap = function(key,indices) {
        var indexToAdd = indices.shift();
        if(!indices.length) {
            delete valueMap[key];
        }
        arr[indexToAdd] = undefined;
        return indexToAdd;
    };

    //fill map
    for (var i=0; i<arr.length; i++) {
        var key = "m" + arr[i];
        if (valueMap.hasOwnProperty(key)) {
            //add index to array
            valueMap[key].push(i);
        } else {
            valueMap[key] = [i];
        }
    }

    for (var j=0; j<arr.length; j++) {
        var paired = arg - arr[j];
        var key = "m" + arr[j];
        var pairedIndex;

        paired = "m" + paired;

        if (valueMap.hasOwnProperty(paired)) {
            var indices = valueMap[key];
            //make sure we have enough in the case of being same number
            if (paired == key && indices.length < 2) {
                break;
            }
            //remove this from map
            updateMap(key,indices);
            //add this index and clear value
            indexSum += j;
            //get index from map, add, clear index
            indices = valueMap[paired];
            pairedIndex = updateMap(paired,indices);
            indexSum += pairedIndex;
        }
    }
    return indexSum;
  }
  
  console.log(pairwise([1,4,2,3,0,5], 7));
  console.log(pairwise([1, 3, 2, 4], 4));
  console.log(pairwise([1, 1, 1], 2));
  console.log(pairwise([0, 0, 0, 0, 1, 1], 1));
  console.log(pairwise([], 100));