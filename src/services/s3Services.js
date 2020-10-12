class S3Services {
    constructor() {
        this.bucketName =  process.env.BUCKET_NAME,
        this.S3Svc = S3
    }

    async getImageFromBucket(key) {
        try {
            return await this.S3Svc.getObject({
                Bucket: this.bucketName,
                Key: key
            }).promise()
        }
        catch(error) {
            console.log('Error no s3' + error)
        }
    }


    async getSignedUrl(key) {
        try {
            return await this.S3Svc.getSignedUrlPromise('getObject',{
                Bucket: this.bucketName,
                Key: key,
                Expires: 5 * 60
            })
        }
        catch(error) {
            console.log('Error no s3' + error)
        }
    }
}


const AWS = require('aws-sdk')
const S3 = new AWS.S3()
const s3Services = new S3Services(S3)
module.exports = s3Services