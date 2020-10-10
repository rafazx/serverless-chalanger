class Handler {
    constructor() {
    }
    async main(event, context, callback) {
        try {
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
}


const handler = new Handler(dynamoDb, S3)
module.exports = handler.main.bind(handler);
