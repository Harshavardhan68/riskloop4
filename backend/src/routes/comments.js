/**
 * Comments Routes
 * API endpoints for market comments and community discussion
 */

import { Router } from 'express';
import { commentService } from '../services/CommentService.js';

const router = Router();

/**
 * Mock authentication middleware
 * In production, replace with actual authentication
 */
const requireAuth = (req, res, next) => {
  // Mock user session - in production, get from JWT, session, or cookies
  const userId = req.headers['x-user-id'] || req.query.userId || 'user_1';
  const username = req.headers['x-username'] || req.query.username || 'Anonymous';
  const userAvatar = req.headers['x-user-avatar'] || '';
  const isPro = req.headers['x-user-pro'] === 'true' || false;

  req.user = {
    id: userId,
    username,
    avatar: userAvatar,
    isPro,
  };

  next();
};

/**
 * GET /api/market/comments
 * Get paginated comments with sorting
 */
router.get('/comments', (req, res) => {
  try {
    const {
      sort = 'recent',
      page = 1,
      limit = 20,
      parentId = null,
    } = req.query;

    const result = commentService.getComments({
      sort,
      page: parseInt(page),
      limit: parseInt(limit),
      parentId,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[Comments API] Error fetching comments:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/market/comments
 * Create a new comment
 */
router.post('/comments', requireAuth, (req, res) => {
  try {
    const { content, parentId = null } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required',
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Comment exceeds 2000 character limit',
      });
    }

    const comment = commentService.createComment(
      req.user.id,
      req.user.username,
      content,
      req.user.avatar,
      req.user.isPro,
      parentId
    );

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      data: comment.toPublicJSON(),
    });
  } catch (error) {
    console.error('[Comments API] Error creating comment:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/market/comments/:id
 * Update an existing comment
 */
router.put('/comments/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required',
      });
    }

    const comment = commentService.updateComment(id, req.user.id, content);

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: comment.toPublicJSON(),
    });
  } catch (error) {
    console.error('[Comments API] Error updating comment:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        error: error.message,
      });
    }
    
    if (error.message === 'Comment not found') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/market/comments/:id
 * Delete a comment
 */
router.delete('/comments/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;

    commentService.deleteComment(id, req.user.id);

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('[Comments API] Error deleting comment:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        error: error.message,
      });
    }
    
    if (error.message === 'Comment not found') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/market/comments/:id/like
 * Like a comment (toggle)
 */
router.post('/comments/:id/like', requireAuth, (req, res) => {
  try {
    const { id } = req.params;

    const result = commentService.likeComment(id, req.user.id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[Comments API] Error liking comment:', error);
    
    if (error.message === 'Comment not found') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/market/comments/:id/dislike
 * Dislike a comment (toggle)
 */
router.post('/comments/:id/dislike', requireAuth, (req, res) => {
  try {
    const { id } = req.params;

    const result = commentService.dislikeComment(id, req.user.id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[Comments API] Error disliking comment:', error);
    
    if (error.message === 'Comment not found') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/market/comments/:id/reply
 * Reply to a comment (shorthand for POST /comments with parentId)
 */
router.post('/comments/:id/reply', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Reply content is required',
      });
    }

    // Verify parent comment exists
    const parentComment = commentService.getComment(id);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        error: 'Parent comment not found',
      });
    }

    const reply = commentService.createComment(
      req.user.id,
      req.user.username,
      content,
      req.user.avatar,
      req.user.isPro,
      id // parentId
    );

    res.status(201).json({
      success: true,
      message: 'Reply posted successfully',
      data: reply.toPublicJSON(),
    });
  } catch (error) {
    console.error('[Comments API] Error creating reply:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/market/comments/:id/report
 * Report a comment
 */
router.post('/comments/:id/report', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Inappropriate content' } = req.body;

    const result = commentService.reportComment(id, req.user.id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('[Comments API] Error reporting comment:', error);
    
    if (error.message === 'Comment not found') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/market/comments/:id
 * Get a single comment with its replies
 */
router.get('/comments/:id', (req, res) => {
  try {
    const { id } = req.params;

    const comment = commentService.getComment(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found',
      });
    }

    // Load replies
    const commentData = comment.toPublicJSON();
    commentData.replies = comment.replies.map(replyId => {
      const reply = commentService.getComment(replyId);
      return reply ? reply.toPublicJSON() : null;
    }).filter(r => r !== null);

    res.json({
      success: true,
      data: commentData,
    });
  } catch (error) {
    console.error('[Comments API] Error fetching comment:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
