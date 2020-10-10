class Handler {
    constructor() {
    }
    async main(event, context, callback) {
        try {
            return {
                statusCode: 201,
                body: 'Funcionou'
            }
        } catch(error) {
            return {
                statusCode: 500,
                body: `Internal Error + ${error}`
            }
        }
    }
}


const handler = new Handler()
module.exports = handler.main.bind(handler);
