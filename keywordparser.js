
console.log(parseQuery('andrew mattick and menomonee falls'));



function parseQuery(query, optionalQueryParameters) {

    String.prototype.replaceAt = function (index, strLength, replacement) {
        let end = this.substr(index + strLength, this.length);
        return this.substr(0, index) + replacement + end;
    };

    let pristine = query;
    query = pristine.replace(/[^\w\s+[)(]/gi, '');
    let keywords = [];
    let operators = [];
    let queryFields = [
        'id:',
        'name:',
        'companyName:',
        'type:',
        'occupation:',
        'description:',
        'fileAttachments.description:'
    ];
    queryFields = optionalQueryParameters ? queryFields.concat(optionalQueryParameters) : queryFields;
    let bools = [
        ' OR ',
        ' AND ',
        ' NOT ',
        ' AND NOT '
    ];
    bools = bools.map(x => {
        return { value: x };
    });

    let splitString = getSplitString(bools);
    keywords = query.split(new RegExp(splitString, 'gi'));
    keywords = keywords.map(x => {
        return { value: x.replace(/[{()}]/gi, '').trim(), index: null, isKeyword: true };
    });

    if (keywords.length > 0) {
        for (i = keywords.length - 1; i >= 0; i--) {
            keywords[i].index = query.lastIndexOf(keywords[i].value);
            query = query.slice(0, query.lastIndexOf(keywords[i].value));
        }
    }
    else {
        growl.warn("Please enter keywords before searching");
    }

    query = pristine.replace(/[^\w\s+[)(]/gi, '');
    splitString = getSplitString(keywords);
    operators = query.split(new RegExp(splitString, 'gi'));

    operators = operators.map(x => {
        return { value: x.replace(/[{()}]/g, ''), index: null, isKeyword: false };
    }).filter(x => { return x.value !== "" ? x : null; });

    for (i = operators.length - 1; i >= 0; i--) {
        operators[i].index = query.lastIndexOf(operators[i].value);
        query = query.slice(0, query.lastIndexOf(operators[i].value));
    }
    query = pristine.replace(/[^\w\s+[)(]/gi, '');
    let join = operators.concat(keywords).sort(function (a, b) { return b.index - a.index; });
    join.forEach(x => {
        query = query.replaceAt(x.index, x.value.length, x.isKeyword ? queryField(x.value, queryFields) : x.value);
    })
    return 'isDeleted:0 AND (' + query + ') AND NOT status:Archive';
}

function getSplitString(valArray) {
    let splitString = '';
    for (i = 0; i < valArray.length; i++) {
        splitString = splitString + valArray[i].value + "|";

    }
    return splitString.slice(0, -1);
}

function queryField(keyword, fields) {
    let keywordQuery = '';

    fields.forEach(x => {
        keywordQuery = keywordQuery + `${x}"${keyword}" `;
    });
    return "(" + keywordQuery + ")";
}