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

var cu = [
    ["a", "b", "c"],
    [0, 1],
    ["x", "y"]
];


console.log(allPossibleCases(cu, null, []));