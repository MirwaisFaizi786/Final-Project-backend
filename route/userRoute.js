const express = require('express');
const { signup, login, forgotPassword, resetPassword, updatePassword, protect, updateMe, deleteMe, getAllUsers, restrictTo, uploadUserPhoto } = require('../controller/authController');
const { deleteUser, updateUser, createUser, getMe, getUser, getGuide, getNormalUserDetails} = require('../controller/userController');

const router = express.Router();

// user route


// Authentication
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword) //resetPassword
router.get("/normalUsers", getNormalUserDetails);
router.get("/me/guide", getGuide);
// This is middleware to protect all routes after this middleware. 
router.use(protect)

router.patch('/updatePassword', updatePassword)
router.patch('/updateMe', uploadUserPhoto, updateMe)
router.delete('/deleteMe', deleteMe)
router.get('/me', getMe, getUser)

// User
// This is middleware to protect all routes after this middleware. To restrict only admin can access 
router.use(restrictTo('admin'))

router.route('/')
    .get(getAllUsers)
    .post(createUser);

router.route('/:id')
    .delete(deleteUser)
    .put(updateUser)


module.exports = router