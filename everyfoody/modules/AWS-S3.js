const aws = require('aws-sdk');
aws.config.loadFromPath('./config/aws_config.json');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = new aws.S3();

module.exports = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'everyfoody',
        acl: 'public-read',
        key: function(req, file, cb) {
            cb(null, Date.now() + '.' + file.originalname.split('.').pop());
        }
    })
});