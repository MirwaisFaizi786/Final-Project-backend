const Location = require("../model/locationModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");


exports.addLocation = factory.createOne(Location);
exports.updateLocation = factory.updateOne(Location);
exports.deleteLocation = factory.deleteOne(Location);
exports.getAllLocations = factory.getAll(Location);
exports.getLocation = factory.getOne(Location);




