const factory = require('./handlerFactory');
const User = require('../model/userModel');


exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next(); 
}
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);
exports.createUser = factory.createOne(User);