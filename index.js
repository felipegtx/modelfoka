const sifScanner = require("sif-scanner");
const fs = require('fs');
const interpolate = require("interpolate");


module.exports = {
    allModels: [],
    loadSif: function(sifUrl, callback) {
        
        var self = this;
        
        sifScanner({path: "./JSL.TOP" }, /^PN\=/, null, filter, done);
 
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
        let definition = JSON.parse(rawdata); 
        definition.propTypes = {};
        let unchecked = expandDefinition(definition);
        
        let checked = [];
        
        unchecked.forEach(function(possibility) {
            let basemodel = extractBasemodel(possibility, definition.format);
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
        
        return {
            name: definition.name,
            description:definition.description,
            icon: definition.icon,
            format: definition.format,
            propTypes: definition.propTypes,
            count: checked.length,
            products: checked
        };
    }
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
    let row = [{
        name: optionKey,
        key: "",
        text: ""
    }];
    
    //numbers
    if(Array.isArray(option)) {
        definition.propTypes[optionKey] = "number";
        option.forEach(function(option) {
           row.push({
              name: optionKey,
              key: option.toString(),
              text: option.toString() + '"'
           });
        });
    }
    
    //bool
    else if(typeof option === "string") {
        definition.propTypes[optionKey] = "bool";
        row.push({
            name: optionKey,
            key: option.toString(),
            text: "Yes"
        });
    }
    
    //text
    else if(typeof option === "object") {
        definition.propTypes[optionKey] = "text";
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


function extractBasemodel(possibility, formatStr) {
    let data = {};
    possibility.forEach(function(prop) {
       data[prop.name] = prop.key;
    });
    return interpolate(formatStr, data);
}