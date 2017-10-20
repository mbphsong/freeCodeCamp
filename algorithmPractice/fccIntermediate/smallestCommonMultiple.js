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
  
  
  console.log(smallestCommons([1,5]));
  console.log(smallestCommons([1,13]));
  console.log(smallestCommons([23,18]));

