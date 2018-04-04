const sifScanner = require("sif-scanner");
const fs = require('fs');
const interpolate = require("interpolate");
const domains = require("./domains.js");


module.exports = {
    allModels: [],
    loadSif: function(sifUrl, callback) {
        
        var self = this;
        
        sifScanner({path: sifUrl }, /^PN\=/, null, filter, done);
 
        function filter(item) {
          return true;
        }
        
        function done(err, items) {
            items.forEach(function(item) {
                self.allModels.push(item.PN);
            });
            callback();
        }
        
    },
    disect: function(jsonUrl) {
        
        let self = this;
        
        let rawdata = fs.readFileSync(jsonUrl);  
        let definition = {};
        try {
            definition = JSON.parse(rawdata);
        }
        catch(e) {
            console.log("Pau no geison ", jsonUrl);
            return null;
        }
        definition.propTypes = {};
        definition.propIndex = Object.keys(definition.options);
        let unchecked = expandDefinition(definition);
        
        let checked = [];
        
        unchecked.forEach(function(possibility) {
            let basemodels = extractBasemodels(possibility, definition.format);
            basemodels.forEach(basemodel => {
                if(self.allModels.includes(basemodel)) {
                    //got a match in the catalog
                    
                    let props = {};
                    possibility.forEach(function(prop) {
                       props[prop.name] = prop.text;
                    });
                    checked.push({
                        basemodel: basemodel,
                        props: props
                    });
                }
            });
        });

        if(!definition.default && checked.length > 0) {
            definition.default = checked[0].basemodel;
            //update json
            fs.writeFile(jsonUrl, JSON.stringify(definition, null, 4), (err) => {});
        }
        
        var data = {
            name: definition.name,
            description:definition.description,
            format: definition.format,
            propTypes: definition.propTypes,
            count: checked.length,
            products: checked,
            propIndex: definition.propIndex
        };
        
        data = domains(data);
        replicateSuperModelInfo(data);

        return data;
    }
}

function replicateSuperModelInfo(data) {
    data.products.forEach(product => {
        product.supermodel = {
            name: data.name,
            description: data.description,
            format: data.format,
            propTypes: data.propTypes,
            count: data.count,
            propIndex: data.propIndex
        };
    });
}

function expandDefinition(definition) {
    let matrix = makeMatrix(definition);
    let all = allPossibleCases(matrix, null, []);
    return all;
}

function makeMatrix(definition) {
    let keys = Object.keys(definition.options);
    let rows = [];
    keys.forEach(function(key) {
        rows.push(makeMatrixRow(definition.options[key], key, definition));        
    });
    return rows;
}

function makeMatrixRow(option, optionKey, definition) {
    let row = [];
    
    //numbers
    if(Array.isArray(option)) {
        definition.propTypes[optionKey] = "number";
        row.push({
            name: optionKey,
            key: "",
            text: null
        });
        option.forEach(function(option) {
           row.push({
              name: optionKey,
              key: option.toString(),
              text: option
           });
        });
    }
    
    //bool
    else if(typeof option === "string") {
        definition.propTypes[optionKey] = "bool";
        row.push({
            name: optionKey,
            key: "",
            text: false
        });
        row.push({
            name: optionKey,
            key: option.toString(),
            text: true
        });
    }
    
    //text
    else if(typeof option === "object") {
        definition.propTypes[optionKey] = "text";
        row.push({
            name: optionKey,
            key: "",
            text: ""
        });
        let keys = Object.keys(option);
        keys.forEach(function(key) {
            row.push({
                name: optionKey,
                key: key,
                text: option[key]
            });
        });
    }
    
    return row;
}

function allPossibleCases(arr, previous, result) {
    let acumulation = previous ? previous.slice(0) : [];
    if(arr.length == 0) {
        result.push(acumulation);
        return;
    }
    let current = arr[0];
    let next = arr.slice(1);
    current.forEach(function(item) {
        let thisOne = acumulation.slice(0);
        thisOne.push(item);
       allPossibleCases(next, thisOne, result);
    });
    return result;
}


function extractBasemodels(possibility, formatProp) {
    let formatStrs = null;
    let results = [];
    if(typeof formatProp === "string") {
        formatStrs = [ formatProp ];
    } else  {
        //assume array
        formatStrs = formatProp;
    }

    formatStrs.forEach(formatStr => {
        let data = {};
        possibility.forEach(function(prop) {
           data[prop.name] = prop.key;
        });
        results.push(interpolate(formatStr, data));

    });
    return results;
}