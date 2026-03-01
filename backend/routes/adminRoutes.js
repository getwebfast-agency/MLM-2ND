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
    deleteUser,
    getChartStats,
    getCancellationRequests,
    approveCancellation,
    rejectCancellation,
    adminDirectCancelOrder
} = require('../controllers/adminController');

router.use(authenticateToken);
router.use(isAdmin);

router.get('/users', getAllUsers);
router.get('/stats', getSystemStats);
router.get('/chart-stats', getChartStats);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/password', resetUserPassword);
router.put('/users/:id/sponsor', changeSponsor);
router.delete('/users/:id', deleteUser);
router.get('/users/:id', getMemberDetails);
router.get('/network', getFullNetwork);
router.get('/sales', getSalesReports);
router.get('/earnings', require('../controllers/adminController').getMemberEarnings);
router.get('/earnings/:id', require('../controllers/adminController').getMemberEarningDetails);
router.get('/categories', getCategoryStats);

// Cancellation Routes
router.get('/cancellation-requests', getCancellationRequests);
router.put('/orders/:id/cancel', adminDirectCancelOrder);            // Admin direct cancel (any active order)
router.put('/orders/:id/approve-cancellation', approveCancellation); // Approve a customer cancellation request
router.put('/orders/:id/reject-cancellation', rejectCancellation);   // Reject a customer cancellation request

module.exports = router;
