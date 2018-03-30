module.exports = function(data) {
    let propToModelIndex = makePropToModelIndex(data);
    let modelToPropIndex = makeModelToPropIndex(data);
    data.products.forEach(product => {
        addDomainsToProduct(product, propToModelIndex, modelToPropIndex);
    });
    return data;
}

function makePropToModelIndex(data) {
    let index = {};
    data.products.forEach(element => {
        Object.keys(element.props).forEach(key => {
            let indexKey = makeIndexKey(key, element.props[key]);
            if(!index[indexKey]) index[indexKey] = [];
            index[indexKey].push(element.basemodel);
        });
    });
    return index;
}

function makeModelToPropIndex(data) {
    let index = {};
    data.products.forEach(product => {
        index[product.basemodel] = product.props;
    });
    return index;
}

function makeIndexKey(propKey, propValue) {
    return propKey + "|" + propValue.toString();
}

function addDomainsToProduct(product, propToModelIndex, modelToPropIndex) {
    Object.keys(product.props).forEach(key => {
        let models = filter(key, product.props, propToModelIndex);
        let domain = [];
        models.forEach(model => {
            let props = modelToPropIndex[model];
            domain.push({
                basemodel: model,
                value: props[key]
            });
        });
        if(!product.domains) product.domains = {};
        product.domains[key] = domain;
    });
}

function filter(referenceKey, props, propToModelIndex) {
    let results = null;
    Object.keys(props).forEach(key => {
        if(key != referenceKey) {
            let filterKey = makeIndexKey(key, props[key]);
            let subResults = propToModelIndex[filterKey];
            if(!results) {
                results = subResults;
            } else {
                results = intersection(results, subResults);
            }
        }
    });
    return distinct(results);
}

function distinct(array) {
    function onlyUnique(value, index, self) { 
        return self.indexOf(value) === index;
    }
    var unique = array.filter( onlyUnique ); 
    return unique;
}

function intersection(array1, array2) {
    return array1.filter(function(n) {
        return array2.includes(n);
    });
}