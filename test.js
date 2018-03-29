var modelfoka = require("./index.js");
var fs = require('fs');
modelfoka.loadSif("./JSL.TOP", function(err) {
   var summary = modelfoka.disect("./Flux-Desk1.json"); 
   fs.writeFile('summary.json', JSON.stringify(summary, null, 4), function(err){
       console.log("We're done, baby. I know... it was fast. But seriously, it's done.");
   });
});
