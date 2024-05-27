const factory = require('./handlerFactory');
const fs = require('fs');
const AppError = require('../utils/appError');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');

function getImageDataAsBase64(imagePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(imagePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(Buffer.from(data).toString('base64'));
        }
      });
    });
  }
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next(); 
}
exports.getAllUsers = factory.getAll(User);
// exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);
exports.createUser = factory.createOne(User);



exports.getUser = catchAsync(async (req, res, next) => {
    let doc = await User.findById(req.params.id);
    if (!doc) {
        return next(new AppError('No document found with that ID Exact ', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc,
            image: await getImageDataAsBase64(`./public/img/users/${doc.photo}`).then((data) => data)
        }
    })
})



