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