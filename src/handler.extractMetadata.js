class Handler {
    constructor(dynamoDbSvc, S3) {
        this.dynamoDbSvc = dynamoDbSvc,
        this.S3Svc = S3
    }
    async main({ Records: records }, context, callback) {
        try {
            await Promisse.all(records.map(async record => { 
                const { key } = record.s3.object;
    
                const image = await S3.getObject({
                    Bucket: process.env.BUCKET_NAME,
                    Key: key
                }).promise()
    
                console.log(image)
    
            }));
            return {
                statusCode: 201,
                body:{}
            }
        } catch(error) {
            return {
                statusCode: 500,
                body: `Internal Error + ${error}`
            }
        }
    }

    async extractMetadata() {

    }
}

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const S3 = new AWS.S3();
const handler = new Handler(dynamoDb, S3)
module.exports = handler.main.bind(handler);
