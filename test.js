var modelfoka = require("./index.js");
var fs = require('fs');
var async = require("async");

modelfoka.loadSif("./JSL.TOP", function(err) {
   var summary = modelfoka.disect("./Flux-Desk1.json"); 
   async.each(summary.products, 
        function(product, callback) {
            fs.writeFile('./output/' + product.basemodel + '.json', JSON.stringify(product, null, 4), callback);
        }, 
        function(err) {
            console.log("We're done, baby. I know... it was fast. But seriously, it's done.");
        });
});
