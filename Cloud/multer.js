const multer = require('multer')

const storage = multer.memoryStorage();

const filter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png',"application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // accept file   causing request.file to be defined
  } else {
    cb(null, false); // reject file  causing request.file to be undefined
  }
}

exports.upload = multer({storage, fileFilter:filter})