var modelfoka = require("./index.js");
var fs = require('fs');
modelfoka.loadSif("./coco.1", function(err) {
   var summary = modelfoka.disect("./Flux-Desk1.json"); 
   fs.writeFile('summary.json', JSON.stringify(summary, null, 4));
});
