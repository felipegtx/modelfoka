const extend = require("extend");

function copy(a) {
    let b =  {};
    Object.keys(a).forEach(key => {
        b[key] = a[key];
    });
    return b;
}

module.exports = function(data) {
    data.products.forEach(product => {
        let productDomains = {};
        Object.keys(data.domains).forEach(propKey => {
            data.domains[propKey].forEach(option => {
                let desiredState = copy(product.props);
                desiredState[propKey] = option.value;
                let closestProduct = closest(data.products, desiredState, propKey);
                if(closestProduct) {
                    if(!productDomains[propKey]) productDomains[propKey] = [];
                    productDomains[propKey].push({
                        basemodel: closestProduct.basemodel,
                        value: option.value,
                        distance: closestProduct.distance
                    });
                }
            });
        });
        product.domains = productDomains;
    });
    return data;
}


function closest(products, desiredState, referenceProp) {
    
    let bestDistance = 999; //good enough?
    let closest = null;
    let closestChange = null;

    products.forEach(product => {
        let distance = 0;
        let change = {};
        Object.keys(product.props).forEach(key => {
            //make sure reference prop is equal on both sides
            if(product.props[referenceProp] != desiredState[referenceProp]) {
                distance += 999; //sabotage
            }
            if(product.props[key] != desiredState[key]) {
                distance ++;
                change[key] = {
                    desired: desiredState[key],
                    found: product.props[key]
                }
            }
        });
        if(distance < bestDistance) {
            bestDistance = distance;
            closest = product;
            closestChange = change;
        }
    });

    if(!closest) return null;

    return {
        distance: bestDistance,
        basemodel: closest.basemodel
    };
}