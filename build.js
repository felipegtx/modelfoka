const fs = require("fs");
const async = require("async");
const modelfoka = require("./index.js");

module.exports = function(root, callback) {
    catalogs(root, callback);
};

/* welcome to callback hell */

function catalogs(folder, callback) {
    var data = [];
    fs.readdir(folder, (err, files) => {
        if(err) console.log(err);                
        
        async.each(files, 
            (file, callback) => {

                if(file.toLowerCase().indexOf(".") != -1 || file == "__MACOSX") {
                    callback();
                    return;
                }
                
                findSifFile(folder + "/" + file, (err, sifFile) => {
                    if(err) console.log(err);                
                    
                    data.push({
                        name: file,
                        catalogFolder: folder + "/" + file,
                        basemodelsFolder: folder + "/" + file + "/basemodels",
                        supermodelsFolder: folder + "/" + file + "/supermodels",
                        sifFileUrl: sifFile
                    });
                    //TODO: will need multiple instances of the modelfoka?
                    modelfoka.loadSif(sifFile, function(err) {
                        callback();
                    });
                });
            },
            (err) => {
                if(err) console.log(err);                
                
                addGroups(data, callback);
                // callback(null, data);
            });
    });
}

function addGroups(data, callback) {
    async.each(data, (catalog, callback) => {
        groups(catalog, (err) => {
            if(err) console.log(err);                
            
            callback();
        });
    },
    (err) => {
        if(err) console.log(err);                
        
        callback(null, data);
    });
}

function groups(catalog, callback) {
    fs.readdir(catalog.supermodelsFolder, (err, files) => {
        if(err) console.log(err);                
        
        async.each(files, 
            (file, callback) => {

                if(file.toLowerCase().indexOf(".") != -1 || file == "__MACOSX") {
                    callback();
                    return;
                }

                processSupermodel(catalog, file, (err, supermodelData) => {
                    if(err) console.log(err);                
                    
                    callback();
                });
            },
            (err) => {
                if(err) console.log(err);                
                
                callback();
            });
    });
}

function processSupermodel(catalog, group, callback) {
    let groupFolder = catalog.supermodelsFolder + "/" + group;
    fs.readdir(groupFolder, (err, files) => {
        if(err) console.log(err);                
        
        async.each(files, 
            (file, callback) => {
                let jsonUrl = groupFolder + "/" + file;
                if(jsonUrl.toLowerCase().indexOf(".json") == -1) {
                    callback();
                    return;
                }
                    
                
                var summary = modelfoka.disect(jsonUrl); 
                if(!summary)  {
                    callback();
                    return;
                }
                console.log("Building " + summary.name + " found " + summary.products.length  + " products");
                if(summary.products.length == 0) {
                    console.log(":/ no products found for " + summary.name + "!!!!!!!!!!!!!");
                }
                async.each(summary.products, 
                    function(product, callback) {
                        let url = catalog.basemodelsFolder + '/' + product.basemodel + '.json';
                        // callback();
                        fs.writeFile(url, JSON.stringify(product, null, 4), callback);
                    }, 
                    function(err) {
                        if(err) console.log(err);
                        callback();
                    });
            },
            (err) => {
                if(err) console.log(err);                
                callback();
            });
    });
}


function findSifFile(folder, callback) {
    
    let possibleExtensions = ["1", "top", "TOP"];
    let found = "";

    fs.readdir(folder, (err, files) => {
        if(err) console.log(err);                
        
        async.each(files, 
            (file, callback) => {
                if(matchesExtension(file, possibleExtensions)) {
                    found = file;
                }
                callback();
            },
            (err) => {
                if(err) console.log(err);                
                
                callback(null, found);
            });
    });
}

function matchesExtension(fileName, possibleExtensions) {
    let found = false;
    possibleExtensions.forEach((ext) => {
        if(fileName.indexOf("." + ext) != -1) {
            found = true;
        }
    });
    return found;
}

