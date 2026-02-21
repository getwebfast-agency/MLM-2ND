const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const {
    getAllUsers,
    getSystemStats,
    updateUserStatus,
    getMemberDetails,
    getFullNetwork,
    getSalesReports,
    getCategoryStats,
    resetUserPassword,
    changeSponsor,
    deleteUser
} = require('../controllers/adminController');

router.use(authenticateToken);
router.use(isAdmin);

router.get('/users', getAllUsers);
router.get('/stats', getSystemStats);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/password', resetUserPassword);
router.put('/users/:id/sponsor', changeSponsor);
router.delete('/users/:id', deleteUser);
router.get('/users/:id', getMemberDetails);
router.get('/network', getFullNetwork);
router.get('/sales', getSalesReports);
router.get('/earnings', require('../controllers/adminController').getMemberEarnings);
router.get('/categories', getCategoryStats);

module.exports = router;
