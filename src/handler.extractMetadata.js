class Handler {
    constructor(dynamoDbSvc, S3) {
        this.dynamoDbSvc = dynamoDbSvc,
        this.S3Svc = S3,
        this.dynamoTable = process.env.DYNAMODB_TABLE
    }
    async main(event, context, callback) {
        try {
            await this.extractMetadata(event)
        } catch(error) {
            return {
                statusCode: 500,
                body: `Internal Error + ${error}`
            }
        }
    }

    async extractMetadata({ Records: records}) {
        await Promise.all(records.map(async record => { 
            const { key } = record.s3.object

            const image = await S3.getObject({
                Bucket: process.env.BUCKET_NAME,
                Key: key
            }).promise()
            console.log(image)
            const { height, width, type } = sizeOf(image.Body)
            await this.insert(height, width, type, key)
        }));
    }

    async insert(height, width, type, key) {
        const params = {
            TableName: this.dynamoTable,
            Item: {
                height,
                width,
                type,
                s3objectkey: key,
                createdAt: new Date().toISOString()
            }
        }
       await this.dynamoDbSvc.put(params).promise()
    }
}

const sizeOf = require('image-size');
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const S3 = new AWS.S3();
const handler = new Handler(dynamoDb, S3)
module.exports = handler.main.bind(handler);
