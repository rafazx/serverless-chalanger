class Handler {
    constructor(dynamoDbSvc, s3Services) {
        this.dynamoDbSvc = dynamoDbSvc,
        this.dynamoTable = process.env.DYNAMODB_TABLE,
        this.S3Svc = s3Services
    }

    async getItem(s3ObjectKey, size) {
        const params = {
            TableName: this.dynamoTable,
            Key: {
                "s3objectkey": s3ObjectKey,
                size
            }
        }
        return await this.dynamoDbSvc.get(params).promise()
    }

    async main(event, context, callback) {
        try {
            if(!event.queryStringParameters || !event.queryStringParameters.key) {
                return {
                    statusCode: 400,
                    body: 'Não enviou os parametros necessários'
                }
            }
            const key = event.queryStringParameters.key
            const { ContentLength } = await this.S3Svc.getImageFromBucket(key)
            if(!ContentLength) {
                return {
                    statusCode: 400,
                    body: 'Imagem não encontrada no bucket'
                }
            }
            const { Item } = await this.getItem(key, ContentLength)
            if(!Item)  {
                return {
                    statusCode: 200,
                    body: 'Não existe nenhum registro com essa Key'
                }
            }
            const response = `
            Os Metadados da imagem são:
            tamanho: ${Item.size},
            altura: ${Item.height},
            largura: ${Item.width}
            `
            return {
                statusCode: 200,
                body: response
            }
        } catch(error) {
            return {    
                statusCode: 500,
                body: `Internal Error + ${error}`
            }
        }
    }
}

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3Services = require('./services/s3Services');
const handler = new Handler(dynamoDb, s3Services)
module.exports = handler.main.bind(handler);
