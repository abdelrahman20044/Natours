const express = require('express');

const router = express.Router();
const {
  signup,
  login,
  forgetPassword,
  resetPassword,
  updatePassword,
  protected,
} = require('../controller/authController');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
  updateMe,
  deleteMe,
  // eslint-disable-next-line import/no-useless-path-segments
} = require('./../controller/userController');
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgetPassword', forgetPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', protected, updatePassword);
router.patch('/updateMe', protected, updateMe);
router.delete('/deleteMe', protected, deleteMe);
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
module.exports = router;
