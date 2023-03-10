class Storage {
    storage: any;
    temporalStorage: any;

    constructor() {
        //import multer storages
        const multer = require('multer');

        this.storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'uploads/');
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, file.fieldname + '-' + uniqueSuffix + '.png');
            }
        });

        //set temporal storage method
        this.temporalStorage = multer.memoryStorage();
    }

    //handler for files to upload
    _handleFile = function _handleFile(req, file, cb) {
        try {
            var isTemporal = false;
            if (req.temporalFiles && req.temporalFiles.includes(file.fieldname)) {
                isTemporal = true;
            }
            if (isTemporal) this.temporalStorage._handleFile(req, file, cb)
            else this.storage._handleFile(req, file, cb);
        } catch (error) {
            console.log("Failed to upload file", error);
        }
    }

    //handler for files to remove
    _removeFile = function _removeFile(req, file, cb) {
        this.storage._removeFile(req, file, cb);
    }

    //middleware to add temporal files
    temporal = function (temporalFiles) {
        return async (req, res, next) => {
            req.temporalFiles = temporalFiles;
            next();
        }
    }
}

export default Storage;
