var ELEMENTS = {
    Ac: {element: 'Actinium', atomicNumber: 89, atomicWeight: 227, electroNegatives: 1.1,},
    Al: {element: 'Aluminum', atomicNumber: 13, atomicWeight: 26.9815, electroNegatives: 1.5,},
    Am: {element: 'Americium', atomicNumber: 95, atomicWeight: 243, electroNegatives: 1.3,},
    Sb: {element: 'Antimony', atomicNumber: 51, atomicWeight: 121.75, electroNegatives: 1.9,},
    Ar: {element: 'Argon', atomicNumber: 18, atomicWeight: 39.948, electroNegatives: null,},
    As: {element: 'Arsenic', atomicNumber: 33, atomicWeight: 74.9216, electroNegatives: 2,},
    At: {element: 'Astatine', atomicNumber: 85, atomicWeight: 210, electroNegatives: 2.2,},
    Ba: {element: 'Barium', atomicNumber: 56, atomicWeight: 137, electroNegatives: 0.9,},
    Bk: {element: 'Berkelium', atomicNumber: 97, atomicWeight: 247, electroNegatives: 1.3,},
    Be: {element: 'Beryllium', atomicNumber: 4, atomicWeight: 9.0122, electroNegatives: 1.5,},
    Bi: {element: 'Bismuth', atomicNumber: 83, atomicWeight: 208.98, electroNegatives: 1.9,},
    B: {element: 'Boron', atomicNumber: 5, atomicWeight: 10.81, electroNegatives: 2,},
    Br: {element: 'Bromine', atomicNumber: 35, atomicWeight: 79.904, electroNegatives: 2.8,},
    Cd: {element: 'Cadmium', atomicNumber: 48, atomicWeight: 112.4, electroNegatives: 1.7,},
    Ca: {element: 'Calcium', atomicNumber: 20, atomicWeight: 40.08, electroNegatives: 1,},
    Cf: {element: 'Californium', atomicNumber: 98, atomicWeight: 251, electroNegatives: 1.3,},
    C: {element: 'Carbon', atomicNumber: 6, atomicWeight: 12.011, electroNegatives: 2.5,},
    Ce: {element: 'Cerium', atomicNumber: 58, atomicWeight: 140.12, electroNegatives: 1.1,},
    Cs: {element: 'Cesium', atomicNumber: 55, atomicWeight: 132.9054, electroNegatives: 0.7,},
    Cl: {element: 'Chlorine', atomicNumber: 17, atomicWeight: 35.453, electroNegatives: 3,},
    Cr: {element: 'Chromium', atomicNumber: 24, atomicWeight: 51.996, electroNegatives: 1.6,},
    Co: {element: 'Cobalt', atomicNumber: 27, atomicWeight: 58.9332, electroNegatives: 1.8,},
    Cu: {element: 'Copper', atomicNumber: 29, atomicWeight: 63.546, electroNegatives: 1.9,},
    Cm: {element: 'Curium', atomicNumber: 96, atomicWeight: 247, electroNegatives: 1.3,},
    Dy: {element: 'Dysprosium', atomicNumber: 66, atomicWeight: 162.5, electroNegatives: 1.1,},
    Es: {element: 'Einsteinium', atomicNumber: 99, atomicWeight: 254, electroNegatives: 1.3,},
    Er: {element: 'Erbium', atomicNumber: 68, atomicWeight: 167.26, electroNegatives: 1.1,},
    Eu: {element: 'Europium', atomicNumber: 63, atomicWeight: 151.96, electroNegatives: 1.1,},
    Fm: {element: 'Fermium', atomicNumber: 100, atomicWeight: 257, electroNegatives: 1.3,},
    F: {element: 'Fluorine', atomicNumber: 9, atomicWeight: 18.9984, electroNegatives: 4,},
    Fr: {element: 'Francium', atomicNumber: 87, atomicWeight: 223, electroNegatives: 0.7,},
    Gd: {element: 'Gadolinium', atomicNumber: 64, atomicWeight: 157.25, electroNegatives: 1.1,},
    Ga: {element: 'Gallium', atomicNumber: 31, atomicWeight: 69.72, electroNegatives: 1.6,},
    Ge: {element: 'Germanium', atomicNumber: 32, atomicWeight: 72.59, electroNegatives: 1.8,},
    Au: {element: 'Gold', atomicNumber: 79, atomicWeight: 196.966, electroNegatives: 2.4,},
    Hf: {element: 'Hafnium', atomicNumber: 72, atomicWeight: 178.49, electroNegatives: 1.3,},
    He: {element: 'Helium', atomicNumber: 2, atomicWeight: 4.0026, electroNegatives: null,},
    Ho: {element: 'Holmium', atomicNumber: 67, atomicWeight: 164.93, electroNegatives: 1.1,},
    H: {element: 'Hydrogen', atomicNumber: 1, atomicWeight: 1.0079, electroNegatives: 2.1,},
    In: {element: 'Indium', atomicNumber: 49, atomicWeight: 114.82, electroNegatives: 1.7,},
    I: {element: 'Iodine', atomicNumber: 53, atomicWeight: 126.904, electroNegatives: 2.5,},
    Ir: {element: 'Iridium', atomicNumber: 77, atomicWeight: 192.22, electroNegatives: 2.2,},
    Fe: {element: 'Iron', atomicNumber: 26, atomicWeight: 55.847, electroNegatives: 1.8,},
    Kr: {element: 'Krypton', atomicNumber: 36, atomicWeight: 83.8, electroNegatives: null,},
    La: {element: 'Lanthanum', atomicNumber: 57, atomicWeight: 138.905, electroNegatives: 1.1,},
    Lr: {element: 'Lawrencium', atomicNumber: 103, atomicWeight: 256, electroNegatives: null,},
    Pb: {element: 'Lead', atomicNumber: 82, atomicWeight: 207.2, electroNegatives: 1.8,},
    Li: {element: 'Lithium', atomicNumber: 3, atomicWeight: 6.941, electroNegatives: 1,},
    Lu: {element: 'Lutetium', atomicNumber: 71, atomicWeight: 174.97, electroNegatives: 1.2,},
    Mg: {element: 'Magnesium', atomicNumber: 12, atomicWeight: 24.305, electroNegatives: 1.2,},
    Mn: {element: 'Manganese', atomicNumber: 25, atomicWeight: 54.938, electroNegatives: 1.5,},
    Md: {element: 'Mendelevium', atomicNumber: 101, atomicWeight: 258, electroNegatives: 1.3,},
    Hg: {element: 'Mercury', atomicNumber: 80, atomicWeight: 200.59, electroNegatives: 1.9,},
    Mo: {element: 'Molybdenum', atomicNumber: 42, atomicWeight: 95.94, electroNegatives: 1.8,},
    Nd: {element: 'Neodymium', atomicNumber: 60, atomicWeight: 144.24, electroNegatives: 1.1,},
    Ne: {element: 'Neon', atomicNumber: 10, atomicWeight: 20.179, electroNegatives: null,},
    Np: {element: 'Neptunium', atomicNumber: 93, atomicWeight: 237.048, electroNegatives: 1.3,},
    Ni: {element: 'Nickel', atomicNumber: 28, atomicWeight: 58.7, electroNegatives: 1.8,},
    Nb: {element: 'Niobium', atomicNumber: 41, atomicWeight: 92.9064, electroNegatives: 1.6,},
    N: {element: 'Nitrogen', atomicNumber: 7, atomicWeight: 14.0067, electroNegatives: 3,},
    No: {element: 'Nobelium', atomicNumber: 102, atomicWeight: 255, electroNegatives: 1.3,},
    Os: {element: 'Osmium', atomicNumber: 76, atomicWeight: 190.2, electroNegatives: 2.2,},
    O: {element: 'Oxygen', atomicNumber: 8, atomicWeight: 15.9994, electroNegatives: 3.5,},
    Pd: {element: 'Palladium', atomicNumber: 46, atomicWeight: 106.4, electroNegatives: 2.2,},
    P: {element: 'Phosphorus', atomicNumber: 15, atomicWeight: 30.9738, electroNegatives: 2.1,},
    Pt: {element: 'Platinum', atomicNumber: 78, atomicWeight: 195.09, electroNegatives: 2.2,},
    Pu: {element: 'Plutonium', atomicNumber: 94, atomicWeight: 244, electroNegatives: 1.3,},
    Po: {element: 'Polonium', atomicNumber: 84, atomicWeight: 210, electroNegatives: 2,},
    K: {element: 'Potassium', atomicNumber: 19, atomicWeight: 39.098, electroNegatives: 0.8,},
    Pr: {element: 'Praseodymium', atomicNumber: 59, atomicWeight: 140.908, electroNegatives: 1.1,},
    Pm: {element: 'Promethium', atomicNumber: 61, atomicWeight: 147, electroNegatives: 1.1,},
    Pa: {element: 'Protactinium', atomicNumber: 91, atomicWeight: 231.036, electroNegatives: 1.4,},
    Ra: {element: 'Radium', atomicNumber: 88, atomicWeight: 226.025, electroNegatives: 0.9,},
    Rn: {element: 'Radon', atomicNumber: 86, atomicWeight: 222, electroNegatives: null,},
    Re: {element: 'Rhenium', atomicNumber: 75, atomicWeight: 186.207, electroNegatives: 1.9,},
    Rh: {element: 'Rhodium', atomicNumber: 45, atomicWeight: 102.906, electroNegatives: 2.2,},
    Rb: {element: 'Rubidium', atomicNumber: 37, atomicWeight: 85.4678, electroNegatives: 0.8,},
    Ru: {element: 'Ruthenium', atomicNumber: 44, atomicWeight: 101.07, electroNegatives: 2.2,},
    Rf: {element: 'Rutherfordium', atomicNumber: 104, atomicWeight: 261, electroNegatives: null,},
    Sm: {element: 'Samarium', atomicNumber: 62, atomicWeight: 150.4, electroNegatives: 1.1,},
    Sc: {element: 'Scandium', atomicNumber: 21, atomicWeight: 44.9559, electroNegatives: 1.3,},
    Se: {element: 'Selenium', atomicNumber: 34, atomicWeight: 78.96, electroNegatives: 2.4,},
    Si: {element: 'Silicon', atomicNumber: 14, atomicWeight: 28.086, electroNegatives: 1.8,},
    Ag: {element: 'Silver', atomicNumber: 47, atomicWeight: 107.868, electroNegatives: 1.9,},
    Na: {element: 'Sodium', atomicNumber: 11, atomicWeight: 22.9898, electroNegatives: 0.9,},
    Sr: {element: 'Strontium', atomicNumber: 38, atomicWeight: 87.62, electroNegatives: 1,},
    S: {element: 'Sulfur', atomicNumber: 16, atomicWeight: 32.06, electroNegatives: 2.5,},
    Ta: {element: 'Tantalum', atomicNumber: 73, atomicWeight: 180.948, electroNegatives: 1.5,},
    Tc: {element: 'Technetium', atomicNumber: 43, atomicWeight: 98.9062, electroNegatives: 1.9,},
    Te: {element: 'Tellurium', atomicNumber: 52, atomicWeight: 127.6, electroNegatives: 2.1,},
    Tb: {element: 'Terbium', atomicNumber: 65, atomicWeight: 158.925, electroNegatives: 1.1,},
    Tl: {element: 'Thallium', atomicNumber: 81, atomicWeight: 204.37, electroNegatives: 1.8,},
    Th: {element: 'Thorium', atomicNumber: 90, atomicWeight: 232.038, electroNegatives: 1.2,},
    Tm: {element: 'Thulium', atomicNumber: 69, atomicWeight: 168.934, electroNegatives: 1.1,},
    Sn: {element: 'Tin', atomicNumber: 50, atomicWeight: 118.69, electroNegatives: 1.8,},
    Ti: {element: 'Titanium', atomicNumber: 22, atomicWeight: 47.9, electroNegatives: 1.5,},
    W: {element: 'Tungsten', atomicNumber: 74, atomicWeight: 183.85, electroNegatives: 1.7,},
    U: {element: 'Uranium', atomicNumber: 92, atomicWeight: 238.029, electroNegatives: 1.5,},
    V: {element: 'Vanadium', atomicNumber: 23, atomicWeight: 50.9414, electroNegatives: 1.6,},
    Xe: {element: 'Xenon', atomicNumber: 54, atomicWeight: 131.3, electroNegatives: null,},
    Yb: {element: 'Ytterbium', atomicNumber: 70, atomicWeight: 173.04, electroNegatives: 1.1,},
    Y: {element: 'Yttrium', atomicNumber: 39, atomicWeight: 88.9059, electroNegatives: 1.2,},
    Zn: {element: 'Zinc', atomicNumber: 30, atomicWeight: 65.38, electroNegatives: 1.6,},
    Zr: {element: 'Zirconium', atomicNumber: 40, atomicWeight: 91.22, electroNegatives: 1.4,},

}

function mapItem() {
    this.elements = "";
    this.symbols = "";
    this.weight = 0;
}

function spellWithChemistry(word) {
    var map = {};

    var options = spellWord(word,word.length,map);
    options.sort((a,b) => b.weight - a.weight);
    var list = "";
    options.forEach(function(mapItem) {
        console.log(mapItem.symbols.toUpperCase());
        if (mapItem.symbols.toUpperCase() == word.toUpperCase()) {
            list += `${mapItem.symbols} (${mapItem.elements}), weight: ${mapItem.weight}\n`;
        }
    });
    if (list.length == 0) {
        list = "This word cannot be spelled with chemistry";
    }
    console.log(options);
    return list;
}

function getSymbol(numChars,word, nthLetter) {
    console.log(nthLetter)
    symbol = word.substr(nthLetter-numChars,numChars);
    symbol = symbol.charAt(0).toUpperCase() + symbol.charAt(1).toLowerCase();
    console.log(symbol);
    return symbol;
}
    
function spellWord(word,nthLetter,map) {
    if (nthLetter <= 0) {
        var endLevel = [];
        endLevel[0] = new mapItem();
        console.log(endLevel);
        return endLevel;
    }

    var thisLevel = [];
    [1, 2]
        .filter((numChars) => nthLetter - numChars >=0)
        .map(numChars => getSymbol(numChars,word, nthLetter))
        .forEach(function(symbol) {
            var key = `l${nthLetter}sym${symbol}`;
            
            console.log(key);
            if (map[key]) {
                console.log(key);
                thisLevel =  map[key];
                return;
            }
            var subLevel = [];
            if (ELEMENTS[symbol] == undefined) {
                var newItem = new mapItem();
                var endLevel = [];
                endLevel[0] = newItem;
                map[key] = endLevel;
                console.log(symbol);
                return map[key];
            }
            var oneChar = spellWord(word,nthLetter-symbol.length,map);

            if (oneChar != undefined) {
                console.log(nthLetter-symbol.length);
                oneChar.forEach(function(mapItem) {
                    console.log(mapItem);
                    var path = addPath(mapItem,symbol);
                    console.log(path);
                    subLevel.push(path);
                    thisLevel.push(path);
                });
            }

        console.log(map);
        map[key] = subLevel.slice();
        return;

    }, this);
        
    return thisLevel;
}

function addPath(currPath,symbol) {
    var newItem = new mapItem();
    newItem.elements = currPath.elements.length == "" ? ELEMENTS[symbol].element : currPath.elements + `, ${ELEMENTS[symbol].element}`;
    console.log(currPath.elements);
    console.log(newItem.elements)
    newItem.symbols = currPath.symbols + symbol;
    newItem.weight = currPath.weight + ELEMENTS[symbol].atomicWeight;
    console.log(newItem);
    return newItem;
}

console.log(spellWithChemistry("sickness"));
