/*  Coin changing problem - Given coins of certain denominations with unlimited quantity and a total, 
*  how many minimum number of coins would be needed to form that total.
*/

function minCoinByMatrix(denominations, totalValue) {
    //got this empty 2d definition from stackoverflow
    var T = [...Array(denominations.length).keys()].map(i => Array(totalValue));
    //loop through denominations
    for (i=0; i<denominations.length; i++) {
        var currDenom = denominations[i];
        //loop through each integer up to totalValue to build matrix
        for (valRemaining=0; valRemaining<=totalValue; valRemaining++) {
            if (i == 0) {
                //our first level - since there is nothing above it, we have no "minimum of"
                T[i][valRemaining] = valRemaining/currDenom;
            }
            else if (currDenom <= valRemaining) {
                //possible to use at least one of this coin denomination; find out how many to use
                //check what our current minimum is from previous row of the matrix
                var minSoFar = T[i-1][valRemaining];
                //find out highest possible number of this denomination we could use
                var factor = parseInt(valRemaining/currDenom);
                for (var k = 1; k<=factor; k++) {
                    //loop through the integers to max number of this denomination, check whether or not it uses 
                    //fewer coins than the current minimum, set to the min of these two options
                    minSoFar = Math.min(k + T[i-1][valRemaining - currDenom * k],minSoFar);
                }
                T[i][valRemaining] = minSoFar;   
            }
            else if (valRemaining == 0) {
                //have to make sure to fill in this column of the matrix or we get errors
                T[i][valRemaining] = 0;
            }
            else {
                //this coin is too big to be used for this value, so the min number of coins is 
                //whatever the previous row had
                T[i][valRemaining] = T[i-1][valRemaining];
            }
        }
    }

    console.log(T);
    return T[denominations.length-1][totalValue];
}

function minCoinByPaths(denominations, valRemaining, map) {
    //if we have no value, return an empty mapItem
    if (valRemaining <= 0) {
        var endLevel = [];
        endLevel.push(new mapItem());
        return endLevel;
    }
    //if we have already memoized the options at this value, return it
    if (map[valRemaining]) {
        return map[valRemaining];
    }

    var thisLevel = [];

    denominations
    .filter(denom => denom <= valRemaining)
    .forEach(function(currDenom) {
        var allPaths = minCoinByPaths(denominations, valRemaining - currDenom, map);
        if (allPaths != undefined) {
            //make sure something was returned so we don't throw an error
            allPaths.forEach(currPath =>
                thisLevel.push(addPath(currPath,currDenom))
            );
        }
    });

    if (!thisLevel.length) {
        //if we didn't have any valid options from our denominations forEach loop,
        //add empty item so we have something to return
        thisLevel.push(new mapItem());
    }    
    //make a copy of the array instead of a reference or we'll update all of our 
    //memoized values next loop
    map[valRemaining] = thisLevel.slice();
    return map[valRemaining];
}

function addPath(currPath,denom) {
    var newItem = new mapItem();
    newItem.numCoins = currPath.numCoins + 1;
    newItem.value = currPath.value + denom;
    return newItem;
}

function mapItem() {
    this.numCoins = 0;
    this.value = 0;
}

function getMinCoins(denominations,totalValue) {
    //this assumes denominations is sorted ascending
    if (denominations[0] == 1) {
        //we can only do the matrix if we have a denomination of 1 - otherwise, we may end up with 
        //a "solution" that doesn't add up to the correct value
        return minCoinByMatrix(denominations,totalValue);
    }
    else {
        //create map - since keys will be integers 1 thru totalValue, using array; otherwise would use an object (map = {})
        var map = [];
        var options = minCoinByPaths(denominations, totalValue, map);
        //the maximum number of coins will be the totalValue (ie, totalValue = 15, 15 coins of denomination 1 is the max)
        var minSoFar = totalValue;
        options
        .forEach(function(item) {
            if (item.value == totalValue) {
                //if this option reached the correct total, compare its numCoins to the current minimum number
                minSoFar = Math.min(minSoFar,item.numCoins);
            }
        })

        return minSoFar;
    }
}

var denoms = [3,5,6,8];
console.log(getMinCoins(denoms,15));
