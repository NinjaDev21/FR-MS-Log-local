'use strict'
const AWS = require("aws-sdk");
const crypto = require("crypto");

const deleteStateMachine = async (AWS, stateArn, region) => {
    const stepfunctions = new AWS.StepFunctions({
        region: region
    });
    const params = {
        stateMachineArn: stateArn
    };
    stepfunctions.deleteStateMachine(params).promise();
};
const startExecution = async (arn, body, region, execName = null) => {
    let stepfunctions = new AWS.StepFunctions({
        region: region
    });
    if (execName === null) {
        const testName = crypto.randomBytes(8).toString("hex");
        execName = 'Test_' + testName
    }
    let params = {
        stateMachineArn: arn, /* required */
        input: body, /* The input parameter to send it to the starting state */
        name: execName /* Either provide an unique name every time or remove this field to generate by AWS automatically */
    };
    console.log("Before executing step function", params)
    let executionReturn = await stepfunctions.startExecution(params).promise();
    console.log("step function expectation => ", executionReturn);
    return executionReturn;
};
const getExecutionHistory = async (arn, region) => {
    let stepfunctions = new AWS.StepFunctions({
        region: region
    });
    let params = {
        "executionArn": arn,
        "includeExecutionData": false,
        "maxResults": 1000,
        "reverseOrder": false
    };
    return await stepfunctions.getExecutionHistory(params).promise();
};
const createUniqueName = async (type = "RBG_TEST") => {
    const uniqueName = crypto.randomBytes(8).toString("hex");
    return type.toString() + "_" + uniqueName;
}
class OpenSearch {
    AWS;
    api_type; method;
    // Private Variables
    #domain = process.env.SEARCH_DOMAIN;
    #index = process.env.HISTORY_INDEX;
    #endpoint; #request; #credentials; #signer;
    #initialPath;

    constructor(AWS, apiType = '', method = '') {
        this.api_type = apiType || "_search";
        this.method = method || 'GET';
        this.AWS = AWS;
        this.#endpoint = this.#endpoint instanceof AWS.Endpoint || new AWS.Endpoint(this.#domain);
        this.#request = this.#request instanceof AWS.HttpRequest || new AWS.HttpRequest(this.#endpoint, process.env.REGION);
        this.#initialPath = this.#request.path;
    }

    #resetVariables(method, apitype, index = "automations") {
        this.#index = index;
        this.method = method;
        this.api_type = apitype;
    }
    // Private Method
    #setRequestandSign(params = '', historyId = null) {
        try {
            this.#request.method = this.method;
            this.#request.path = this.#initialPath + this.#index + '/' + this.api_type;
            console.log("Request Path", this.#request.path);
            // this.#request.path += this.#index + '/' + this.api_type + "/?from=0&size=20";
            if (typeof params === 'object') {
                this.#request.body = JSON.stringify(params);
            }
            if(params.length) this.#request.path += "?q=" + params;
            if(historyId) this.#request.path += '/' + historyId;
            this.#request.headers['host'] = this.#endpoint.host;
            this.#request.headers['Content-Type'] = 'application/json';
            this.#request.headers['Content-Length'] = Buffer.byteLength(this.#request.body);
            // // Enable the below code before deployment
            this.#credentials = new this.AWS.EnvironmentCredentials('AWS');
            // // To be removed before deployment.
            // this.#credentials = new this.AWS.Credentials('AKIAZYBKF4SPXSNK5ZNI', 'yvQVZYMNUiQdV5UbThShotqH40k9RKq9FDZ/ZmlD', null);
            this.#signer = new this.AWS.Signers.V4(this.#request, 'es');
            this.#signer.addAuthorization(this.#credentials, new Date());
            return new this.AWS.HttpClient();
        } catch (e) {
            throw e
        }
    }

    fetch(params = '') {
        this.#resetVariables('GET', '_search');
        const client = this.#setRequestandSign(params);
        return new Promise((resolve, reject) => {
            client.handleRequest(this.#request, null, (response) => {
                    const { statusCode, statusMessage, headers } = response;
                    let body = '';
                    response.on('data', (chunk) => {
                        body += chunk;
                    });
                    response.on('end', () => {
                        const data = { statusCode, statusMessage, headers };
                        if (body) {
                            data.body = body;
                        }
                        // console.log("Responded Data", JSON.stringify(JSON.parse(data.body), null, 2));
                        const parsed = JSON.parse(data.body);
                        const resolvedParam = {
                            data: parsed.hits.hits.map(el => ({ "_id": el._id, ...el._source }))
                        }
                        // console.log(resolvedParam);
                        resolve(resolvedParam);
                    });
                },
                (error) => {
                    reject(error);
                    console.log("Error:" + error.message);
                }
            );
        })
    }

    insert(obj) {
        this.#resetVariables('POST', '_doc');
        const client = this.#setRequestandSign(obj);
        return new Promise((resolve, reject) => {
            client.handleRequest(this.#request, null, (response) => {
                    const { statusCode, statusMessage, headers } = response;
                    let body = '';
                    response.on('data', (chunk) => {
                        body += chunk;
                    });
                    response.on('end', () => {
                        const data = { statusCode, statusMessage, headers };
                        if (body) {
                            data.body = body;
                        }
                        // console.log("Responded Data", JSON.stringify(JSON.parse(data.body), null, 2));
                        console.log("Response", data);
                        const parsed = JSON.parse(data.body);
                        resolve(parsed);
                    });
                },
                (error) => {
                    reject(error);
                    console.log("Error:" + error.message);
                }
            );
        })
    }

    update(obj, historyId) {
        this.#resetVariables('POST', '_update');
        const client = this.#setRequestandSign(obj, historyId);
        return new Promise((resolve, reject) => {
            client.handleRequest(this.#request, null, (response) => {
                    const { statusCode, statusMessage, headers } = response;
                    let body = '';
                    response.on('data', (chunk) => {
                        body += chunk;
                    });
                    response.on('end', () => {
                        const data = { statusCode, statusMessage, headers };
                        if (body) {
                            data.body = body;
                        }
                        // console.log("Responded Data", JSON.stringify(JSON.parse(data.body), null, 2));
                        // console.log("Response", data);
                        const parsed = JSON.parse(data.body);
                        resolve(parsed);
                    });
                },
                (error) => {
                    reject(error);
                    console.log("Error:" + error.message);
                }
            );
        })
    }

    searchSQL(query = 'SELECT * FROM '+this.#index) {
        this.#resetVariables('POST', "_sql?format=json", "_plugins");
        const obj = {
            "query": query
        }
        const client = this.#setRequestandSign(obj);
        return new Promise((resolve, reject) => {
            client.handleRequest(this.#request, null, (response) => {
                    const { statusCode, statusMessage, headers } = response;
                    let body = '';
                    response.on('data', (chunk) => {
                        body += chunk;
                    });
                    response.on('end', () => {
                        const data = { statusCode, statusMessage, headers };
                        if (body) {
                            data.body = body;
                        }
                        // console.log("Responded Data", JSON.stringify(JSON.parse(data.body), null, 2));
                        // console.log("Response", data);
                        const parsed = JSON.parse(data.body);
                        resolve({aggregations: parsed?.aggregations || {}, ...parsed.hits});
                    });
                },
                (error) => {
                    reject(error);
                    console.log("Error:" + error.message);
                }
            );
        })
    }
}
module.exports = {
    deleteStateMachine,
    startExecution,
    createUniqueName,
    getExecutionHistory,
    OpenSearch
}