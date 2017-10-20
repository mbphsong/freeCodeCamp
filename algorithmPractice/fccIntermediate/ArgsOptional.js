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