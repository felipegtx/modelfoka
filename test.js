var modelfoka = require("./index.js");
var fs = require('fs');
var async = require("async");

modelfoka.loadSif("./JSL.TOP", function (err) {
    var summary = modelfoka.disect("./Flux-Desk1.json");
    async.each(summary.products,
        function (product, callback) {
            if (product.basemodel == "FLB3049WMMBG") {
                console.log(JSON.stringify(product, null, 4));
                var file = './output/' + product.basemodel + '.json';
                // fs.unlinkSync(file);
                fs.writeFileSync(file, JSON.stringify(product, null, 4));
                        callback(err);
            }
        },
        function (err) {
            console.log("We're done, baby. I know... it was fast. But seriously, it's done.");
        });
});