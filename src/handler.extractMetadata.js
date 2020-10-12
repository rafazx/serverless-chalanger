class Handler {
    constructor(dynamoDbSvc, s3Services) {
        this.dynamoDbSvc = dynamoDbSvc,
        this.S3Svc = s3Services,
        this.dynamoTable = process.env.DYNAMODB_TABLE,
        this.bucketName =  process.env.BUCKET_NAME
    }
    async main({ Records: records }, context, callback) {
        try {
            await this.extractMetadata(records)
        } catch(error) {
            return error
        }
    }

    async extractMetadata(records) {
        for(const record of records) {
            const s3 = record.s3
            const { key, size } = s3.object
            const image = await this.S3Svc.getImageFromBucket(key)
            const { height, width, type } = sizeOf(image.Body)  
            await this.insert(height, width, type, key, size)
        }
    }

    async insert(height, width, type, key, size) {
        const params = {
            TableName: this.dynamoTable,
            Item: {
                height,
                width,
                type,
                s3objectkey: key,
                size,
                createdAt: new Date().toISOString()
            }
        }
       await this.dynamoDbSvc.put(params).promise()
    }
}

const sizeOf = require('image-size');
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3Services = require('./services/s3Services');
const handler = new Handler(dynamoDb, s3Services)
module.exports = handler.main.bind(handler);
