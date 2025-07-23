import multer from "multer"

//configuration for disk_storage
const storage = multer.diskStorage({
    filename: function(req, res, callback){
        callback(null, res.originalname)
    }
});

const upload  = multer({storage});

export default upload;