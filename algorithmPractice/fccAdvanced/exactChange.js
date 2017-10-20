function checkCashRegister(price, cash, cid) {
    var change = [];
    var changeAmt = cash - price;  
    var cidMap = {};
    var totalDrawer = 0;
    var denoms = [
      {
        "name": "ONE HUNDRED",
        "denom": 100,
      },
      {
        "name": "TWENTY",
        "denom": 20,
      },
      {
        "name": "TEN",
        "denom": 10,
      },
      {
        "name": "FIVE",
        "denom": 5,
      },
      {
        "name": "ONE",
        "denom": 1,
      },
      {
        "name": "QUARTER",
        "denom": 0.25,
      },
      {
        "name": "DIME",
        "denom": 0.10,
      },
      {
        "name": "NICKEL",
        "denom": 0.05,
      },
      {
        "name": "PENNY",
        "denom": 0.01,
      }
    ];
    // Here is your change, ma'am.
    
    cid.forEach(function(currency) {
      cidMap[currency[0]] = currency[1];
      totalDrawer += currency[1];
    });
    
    if (totalDrawer < changeAmt) {
      return "Insufficient Funds";
    } 
    
    if (totalDrawer == changeAmt) {
      return "Closed";
    } 
    
    for (var i=0; i<denoms.length; i++) {
        var thisDenom = denoms[i];
        var thisAmt = 0;
        var numDenom = 0;

        if (changeAmt > thisDenom.denom) {
            numDenom = Math.min(Math.floor(changeAmt / thisDenom.denom),cidMap[thisDenom.name] / thisDenom.denom);
            thisAmt = numDenom * thisDenom.denom;
            change.push([thisDenom.name,thisAmt.toFixed(2)]);
            changeAmt -= thisAmt;
            changeAmt = changeAmt.toFixed(2);
        }
    }

    if (changeAmt > 0) {
        //do not have appropriate coins/bills to make complete change
        return "Insufficient Funds";
    }
  
    return change;
  }
  
  // Example cash-in-drawer array:
  // [["PENNY", 1.01],
  // ["NICKEL", 2.05],
  // ["DIME", 3.10],
  // ["QUARTER", 4.25],
  // ["ONE", 90.00],
  // ["FIVE", 55.00],
  // ["TEN", 20.00],
  // ["TWENTY", 60.00],
  // ["ONE HUNDRED", 100.00]]
  
  console.log(checkCashRegister(19.50, 20.00, [["PENNY", 1.01], ["NICKEL", 2.05], ["DIME", 3.10], ["QUARTER", 4.25], ["ONE", 90.00], ["FIVE", 55.00], ["TEN", 20.00], ["TWENTY", 60.00], ["ONE HUNDRED", 100.00]]));
  console.log(checkCashRegister(19.50, 20.00, [["PENNY", 0.01], ["NICKEL", 0], ["DIME", 0], ["QUARTER", 0], ["ONE", 0], ["FIVE", 0], ["TEN", 0], ["TWENTY", 0], ["ONE HUNDRED", 0]]));
  console.log(checkCashRegister(19.50, 20.00, [["PENNY", 0.01], ["NICKEL", 0], ["DIME", 0], ["QUARTER", 0], ["ONE", 1.00], ["FIVE", 0], ["TEN", 0], ["TWENTY", 0], ["ONE HUNDRED", 0]]));
