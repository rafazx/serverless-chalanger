class Handler {
    constructor(dynamoDbSvc, s3Services) {
        this.dynamoDbSvc = dynamoDbSvc,
        this.dynamoTable = process.env.DYNAMODB_TABLE
    }

    async main(event, context, callback) {
        try {
            const { Items } = await this.getItens()
            const itemsSort = this.sortArray(Items)
            const bigestSize = itemsSort[itemsSort.length -1]
            const smallerSize = itemsSort[0]
            const arrayOfTypes = Object.values(itemsSort.map(e => e.type))
            const imagesTypes = [...new Set(arrayOfTypes)]
            const countImageTypes = arrayOfTypes.reduce(function( object , item ){  
                if (!object[item] ) {
                   object[item]=1;
                } else {
                   object[item]++;
                }
                return object; 
              },{}) 
            return {
                statusCode: 200,
                body: `
                A imagem ${bigestSize.s3objectkey} tem o maior tamanhado de ${bigestSize.size}
                A imagem ${smallerSize.s3objectkey} tem o maior tamanhado de ${smallerSize.size}
                Os tipos de images salvas são: ${imagesTypes}
                A quantidade de cada Item são: ${JSON.stringify(countImageTypes)}
                `
            }
        } catch(error) {
            return error
        }
    }

    sortArray(array) {
       return array.sort((a,b) => a.size - b.size)
    }

    async getItens() {
        const params = {
            TableName: this.dynamoTable,
            key: {},
        }
        return await this.dynamoDbSvc.scan(params).promise()
    }
}

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const handler = new Handler(dynamoDb)

module.exports = handler.main.bind(handler);
