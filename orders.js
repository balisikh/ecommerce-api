const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     responses:
 *       200:
 *         description: List of all orders
 * /orders/{orderId}:
 *   get:
 *     summary: Get details of a specific order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 */

// Get all orders
router.get('/', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching orders');
  }
});

// Get a specific order by ID (including order items)
router.get('/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id=?', [orderId]);
    if (orders.length === 0) return res.status(404).send('Order not found');

    const [items] = await pool.query(
      `SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name, p.description
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.json({
      order: orders[0],
      items
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching order details');
  }
});

module.exports = router;
