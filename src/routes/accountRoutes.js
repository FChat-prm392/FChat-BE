const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const upload = require('../middleware/upload');

/**
 * @swagger
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         fullname:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         gender:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         imageURL:
 *           type: string
 *         currentStatus:
 *           type: string
 *         status:
 *           type: boolean
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Create account (with image upload)
 *     tags: [Accounts]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               gender:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               currentStatus:
 *                 type: string
 *               fcmToken:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Account created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/', upload.single('image'), accountController.create);

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get all accounts (with optional search)
 *     tags: [Accounts]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for fullname, username, or email
 *     responses:
 *       200:
 *         description: List of accounts
 */
router.get('/', accountController.getAll);


/**
 * @swagger
 * /api/accounts/non-friends:
 *   get:
 *     summary: Get non-friend accounts for a user
 *     tags: [Accounts]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the current user
 *     responses:
 *       200:
 *         description: List of non-friend accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Account'
 *       400:
 *         description: userId is required or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/non-friends', accountController.getNonFriends);

/**
 * @swagger
 * /api/accounts/search:
 *   get:
 *     summary: Search accounts by name, username, or email
 *     tags: [Accounts]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of matching accounts
 */
router.get('/search', accountController.search);

/**
 * @swagger
 * /api/accounts/update-fcm-token:
 *   patch:
 *     summary: Update FCM token
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: FCM token updated
 */
router.patch('/update-fcm-token', accountController.updateFcmToken);

/**
 * @swagger
 * /api/accounts/login:
 *   post:
 *     summary: Login
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', accountController.login);

/**
 * @swagger
 * /api/accounts/status/{userId}:
 *   get:
 *     summary: Get user status
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User status
 */
router.get('/status/:userId', accountController.getUserStatus);

// ⚠️ IMPORTANT: Put parameterized routes (:id) AFTER all specific routes
// This prevents "search" from being interpreted as an ID parameter

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: Get account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account found
 */
router.get('/:id', accountController.getById);

/**
 * @swagger
 * /api/accounts/{id}:
 *   put:
 *     summary: Update account (with optional image)
 *     tags: [Accounts]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the account to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               gender:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               currentStatus:
 *                 type: string
 *               status:
 *                 type: boolean
 *               lastOnline:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Account updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', upload.single('image'), accountController.update);


/**
 * @swagger
 * /api/accounts/{id}:
 *   delete:
 *     summary: Delete account
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account deleted
 */
router.delete('/:id', accountController.remove);




module.exports = router;
