class Handler {
    constructor(s3Services) {
        this.S3Svc = s3Services
    }
  
    async main(event, context, callback) {
        try {
            if(!event.queryStringParameters || !event.queryStringParameters.key) {
                return {
                    statusCode: 400,
                    body: 'Não enviou os parametros necessários'
                }
            }
            const query = event.queryStringParameters.key
            const image = await this.S3Svc.getImageFromBucket(query)
            return {
                statusCode: 200,
                headers: {
                    "content-type": 'image/jpeg',
                },
                body: image.Body.toString('base64'),
                isBase64Encoded:true
            }
        } catch(error) {
            return {    
                statusCode: 500,
                body: `Internal Error + ${error}`
            }
        }
    }
}
const s3Services = require('./services/s3Services');
const handler = new Handler(s3Services)
module.exports = handler.main.bind(handler);
