/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of all users
 * /users/{userId}:
 *   get:
 *     summary: Get a single user by ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 *   put:
 *     summary: Update user details
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 */

// Get all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get a single user by ID
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id=?', [userId]);
    if (rows.length === 0) return res.status(404).send('User not found');
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update user
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { name, email, password } = req.body;

  try {
    let query = 'UPDATE users SET name=?, email=?';
    const params = [name, email];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password_hash=?';
      params.push(hashedPassword);
    }

    query += ' WHERE id=?';
    params.push(userId);

    await pool.query(query, params);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating user');
  }
});

module.exports = router;
