function dR() {
    var a = "foo";
    var outerApp = outer(passMe);

    function passMe(data) {
        console.log("pass",data,a);
    }

    outerApp.callMe(passMe);
}

function outer(origCallback) {
    function closedFunc() {
        console.log("closed");
    }

    origCallback("baz");

    function callMe(callback) {
        closedFunc();
        callback("bar");
    }

    return {callMe: callMe}
}

dR();

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

function convertToRoman(num) {
    var roman = "";
    var parsing = [
        {
            "name": 1000,
            "mod": num % 1000,
            "single": "M",
            "five": "n/a",
        },
        {
            "name": 100,
            "mod": 0,
            "single": "C",
            "five": "D",
        },
        {
            "name": 10,
            "mod": 0,
            "single": "X",
            "five": "L",
        },
        {
            "name": 1,
            "mod": 0,
            "single": "I",
            "five": "V",
        },
    ];

    function getSymbols(arabicNum, index) {
        if (index == 0) {
            //thousands - different rules
            for (var j=1; j<=arabicNum; j++) {
                roman += parsing[index].single;
            }
            return;
        }
        if (5 <= arabicNum && arabicNum <= 8) {
            roman += parsing[index].five;
        }
        switch(arabicNum) {
            case 3:
            case 8:
                roman += parsing[index].single;
            case 2:
            case 7:
                roman += parsing[index].single;
            case 1:
            case 6:
                roman += parsing[index].single;
                break;
            case 4:
                roman += parsing[index].single + parsing[index].five;
                break;
            case 9:
                roman += parsing[index].single + parsing[index - 1].single;
                break;
            default:
                break;
        }
    }

    getSymbols(Math.floor(num / parsing[0].name), 0);

    for (var i=1; i<parsing.length; i++) {
        var starting = parsing[i-1].mod;
        var divisor = parsing[i].name;

        parsing[i].mod = starting % divisor;

        getSymbols(Math.floor(starting / divisor), i);
    }
    return roman;
}




  
  
function convertHTML(str) {
    // &colon;&rpar;
    var htmlEnt = {
      "m&": "&amp;",
      "m<": "&lt;",
      "m>": "&gt;",
      'm"': '&quot;',
      "m'": "&apos;",
      "m$&": "ha"
    };
    
    str = str.replace(/[&<>"']/g,function(matched) { return htmlEnt["m" + matched]});
    
    return str;
  }
  
  console.log(convertHTML("Dolce & Gabbana"));

  
  function smallestCommons(arr) {
    var min = Math.min(arr[0],arr[1]);
    var max = Math.max(arr[0],arr[1]);
    var SCM = 1;
    
    for (var i=min; i<=max; i++) {
        console.log(i);
        if (SCM % i != 0) {
            console.log(i, SCM);
            SCM *= testFactors(i);
        }


    }

    function testFactors(num) {
        for (var i=1; i<=num; i++) {
            if (num % i == 0 && (SCM * i) % num == 0) {
                console.log(i,num);
                return i;
            }
        }
    }
    
    return SCM;
  }
  
  
//   console.log(smallestCommons([1,5]));
  console.log(smallestCommons([1,13]));
//   console.log(smallestCommons([23,18]));

function binaryAgent(str) {
  var letters = str.split(" ");
  for (var i=0; i<letters.length; i++) {
      console.log(letters[i]);
      console.log(parseInt(letters[i],2));
    letters[i] = String.fromCharCode(parseInt(letters[i],2));
  }
  console.log(letters.join(" "));
  return letters.join("");
}

console.log(binaryAgent("01000001 01110010 01100101 01101110 00100111 01110100 00100000 01100010 01101111 01101110 01100110 01101001 01110010 01100101 01110011 00100000 01100110 01110101 01101110 00100001 00111111"));

function addTogether() {
    var args = [].slice.call(arguments);
    var keeper = args[0];
    
   if (args.length == 1 && !isNaN(keeper)) {
     return function addEm(num) {
         if (isTrueNum(num)) {
            return keeper + num;
         }
      };
   }
    if (args.length == 2) {
      if (!isTrueNum(keeper) || !isTrueNum(args[1])) {
          return undefined;
        }
        console.log(isNaN(args[1]));
      return keeper + args[1];
    } 

    function isTrueNum(value) {
        return value === parseFloat(value);
    }
  }
  
  
  console.log(addTogether(2)([3]));