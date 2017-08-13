function minCoinByMatrix(denominations, totalValue) {
    //got this empty 2d definition from stackoverflow
    var T = [...Array(denominations.length).keys()].map(i => Array(totalValue));
    for (i=0; i<denominations.length; i++) {
        var currDenom = denominations[i];
        for (valRemaining=0; valRemaining<=totalValue; valRemaining++) {
            if (i == 0) {
                T[i][valRemaining] = valRemaining/currDenom;
            }
            else if (currDenom <= valRemaining) {
                T[i][valRemaining] = Math.min(parseInt(valRemaining/currDenom) + T[i-1][valRemaining % currDenom],T[i-1][valRemaining]);   
            }
            else if (valRemaining == 0) {
                T[i][valRemaining] = 0;
            }
            else {
                T[i][valRemaining] = T[i-1][valRemaining];
            }
        }
    }

    console.log(T);
    return T[denominations.length-1][totalValue];
}

function minCoinByPaths(denominations, totalValue) {

}

function getMinCoins(denominations,totalValue) {
    if (totalValue % denominations[0] == 0) {
        return minCoinByMatrix(denominations,totalValue);
    }
    else {
        return minCoinByPaths(denominations, totalValue);
    }
}

var denoms = [1,2,3,5,6,8];
console.log(minCoinByMatrix(denoms,34));
