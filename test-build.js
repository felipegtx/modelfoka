const build = require("./build.js");
build("./catalogs", function(err, data) {
    if(err) console.log(err);                
    
    console.log(data);
});