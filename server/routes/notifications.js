const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

// GET /api/notifications -> List notifications for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT n.*, p.name AS project_name 
       FROM notifications n
       LEFT JOIN projects p ON n.project_id = p.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC;`,
      [req.user.id]
    );

    const unreadCount = result.rows.filter(n => !n.is_read).length;

    res.json({
      notifications: result.rows,
      unread_count: unreadCount
    });
  } catch (err) {
    console.error('[NOTIFICATIONS GET ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve notification alerts.' });
  }
});

// PATCH /api/notifications/:id/read -> Mark single notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notifId = parseInt(req.params.id, 10);

    const result = await query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2 
       RETURNING *;`,
      [notifId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification alert not found.' });
    }

    res.json({
      message: 'Notification marked as read.',
      notification: result.rows[0]
    });
  } catch (err) {
    console.error('[NOTIFICATION READ ERROR]:', err);
    res.status(500).json({ error: 'Failed to acknowledge notification.' });
  }
});

// PATCH /api/notifications/mark-all-read -> Mark all as read
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1;`,
      [req.user.id]
    );

    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('[MARK ALL READ ERROR]:', err);
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

module.exports = router;
