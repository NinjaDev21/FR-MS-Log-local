# Lib Development Process

All libs should be placed under `src` directory under `libs`. Also there is index.js file under `libs` directory. All individual libs will be exported to index.js file.

## Example Libs

![Example Libs Folder Structure](../../docs/images/example-libs.png)

## Example Index Js File

```javascript
'use strict'

const example1 = require('./src/example-lib-1');
const example2 = require('./src/example-lib-2');
const example3 = require('./src/example-lib-3');

module.exports = {
    email: example1,
    app: example2,
    response: example3
};
```

## Example lib File

```javascript
let response = {};

response.success = async data => {
    return {
        body: JSON.stringify(data),
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"  
        }
    }
}

response.failure = async data => {
    return {
        body: JSON.stringify(data),
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"  
        }
    }
}

module.exports = response;
```
