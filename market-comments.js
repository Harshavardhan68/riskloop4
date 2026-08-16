/**
 * Market Comments Component
 * Handles community discussion and comments on the Indian Market page
 */

class MarketComments {
  constructor() {
    this.apiBaseUrl = 'http://localhost:3000/api/market';
    this.currentUser = this.getCurrentUser();
    this.currentSort = 'recent';
    this.currentPage = 1;
    this.commentsPerPage = 20;
    this.comments = [];
    this.isLoading = false;
    
    this.init();
  }

  /**
   * Get current user from session/localStorage
   * In production, this would come from actual authentication
   */
  getCurrentUser() {
    // Try to get from localStorage
    let user = localStorage.getItem('riskloop_user');
    if (user) {
      try {
        return JSON.parse(user);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Default mock user for development
    return {
      id: 'user_' + Math.floor(Math.random() * 1000),
      username: 'Trader' + Math.floor(Math.random() * 1000),
      avatar: '',
      isPro: false,
    };
  }

  /**
   * Initialize the component
   */
  init() {
    this.attachEventListeners();
    this.loadComments();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Post comment button
    const postBtn = document.querySelector('.post-comment-btn');
    if (postBtn) {
      postBtn.addEventListener('click', () => this.postComment());
    }

    // Comment textarea
    const commentInput = document.querySelector('.comment-composer textarea');
    if (commentInput) {
      commentInput.addEventListener('input', (e) => this.updateCharacterCount(e.target));
      commentInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          this.postComment();
        }
      });
    }

    // Sort dropdown
    const sortSelect = document.querySelector('.comment-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.currentPage = 1;
        this.loadComments();
      });
    }

    // Refresh button
    const refreshBtn = document.querySelector('.comments-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.currentPage = 1;
        this.loadComments();
      });
    }
  }

  /**
   * Update character count
   */
  updateCharacterCount(textarea) {
    const counter = document.querySelector('.char-counter');
    if (counter) {
      const length = textarea.value.length;
      counter.textContent = `${length}/2000`;
      
      if (length > 2000) {
        counter.style.color = '#ef4444';
      } else if (length > 1800) {
        counter.style.color = '#f59e0b';
      } else {
        counter.style.color = '#6b7280';
      }
    }
  }

  /**
   * Load comments from API
   */
  async loadComments() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoading();

    try {
      const response = await fetch(
        `${this.apiBaseUrl}/comments?sort=${this.currentSort}&page=${this.currentPage}&limit=${this.commentsPerPage}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      ).catch(() => null);

      if (response && response.ok) {
        const result = await response.json();
        if (result && result.success) {
          this.comments = result.data.comments;
          this.renderComments();
          this.updatePagination(result.data.pagination);
          return;
        }
      }
      this.loadMockComments();
    } catch (error) {
      this.loadMockComments();
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  /**
   * Load mock/local comments for offline or standalone demo
   */
  loadMockComments() {
    const mockComments = [
      {
        id: 'c1',
        userId: 'u1',
        username: 'Aarav Mehta',
        userAvatar: '',
        isPro: true,
        content: 'Nifty 50 holding firmly above the 24,800 level. Strong buying seen across private banking and auto stocks.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        likesCount: 24,
        isLiked: false,
        replies: [
          {
            id: 'r1',
            userId: 'u2',
            username: 'Rohan Sharma',
            userAvatar: '',
            isPro: false,
            content: 'Keep an eye on HDFC Bank quarterly numbers tomorrow.',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            likesCount: 7,
            isLiked: false
          }
        ]
      },
      {
        id: 'c2',
        userId: 'u3',
        username: 'Priya Nair',
        userAvatar: '',
        isPro: false,
        content: 'F&O rollover data showing heavy call unwinding at 25,000 strike. Expiry could see high volatility.',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        likesCount: 15,
        isLiked: false,
        replies: []
      }
    ];

    try {
      const saved = localStorage.getItem('riskloop_indian_comments');
      this.comments = saved ? JSON.parse(saved) : mockComments;
    } catch (e) {
      this.comments = mockComments;
    }

    this.renderComments();
  }

  /**
   * Post a new comment
   */
  async postComment(parentId = null) {
    const textarea = parentId 
      ? document.querySelector(`#reply-input-${parentId}`)
      : document.querySelector('.comment-composer textarea');
    
    if (!textarea) return;

    const content = textarea.value.trim();

    if (!content) {
      this.showNotification('Please enter a comment', 'error');
      return;
    }

    if (content.length > 2000) {
      this.showNotification('Comment exceeds 2000 character limit', 'error');
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': this.currentUser.id,
          'X-Username': this.currentUser.username,
          'X-User-Avatar': this.currentUser.avatar,
          'X-User-Pro': this.currentUser.isPro.toString(),
        },
        credentials: 'include',
        body: JSON.stringify({
          content,
          parentId,
        }),
      }).catch(() => null);

      if (response && response.ok) {
        const result = await response.json();
        if (result && result.success) {
          textarea.value = '';
          this.updateCharacterCount(textarea);
          this.showNotification('Comment posted successfully!', 'success');
          this.currentPage = 1;
          this.loadComments();
          return;
        }
      }

      // Offline fallback: save locally
      const newComment = {
        id: 'c_' + Date.now(),
        userId: this.currentUser.id,
        username: this.currentUser.username,
        userAvatar: this.currentUser.avatar || '',
        isPro: this.currentUser.isPro || false,
        content: content,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        isLiked: false,
        replies: []
      };

      this.comments.unshift(newComment);
      try {
        localStorage.setItem('riskloop_indian_comments', JSON.stringify(this.comments));
      } catch (e) {}

      textarea.value = '';
      this.updateCharacterCount(textarea);
      this.showNotification('Comment posted successfully!', 'success');
      this.renderComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      this.showNotification('Comment posted locally.', 'success');
    }
  }

  /**
   * Like a comment
   */
  async likeComment(commentId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'X-User-Id': this.currentUser.id,
          'X-Username': this.currentUser.username,
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        this.updateCommentCounts(commentId, result.data);
      } else {
        this.showNotification('Failed to like comment', 'error');
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      this.showNotification('Failed to like comment', 'error');
    }
  }

  /**
   * Dislike a comment
   */
  async dislikeComment(commentId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/comments/${commentId}/dislike`, {
        method: 'POST',
        headers: {
          'X-User-Id': this.currentUser.id,
          'X-Username': this.currentUser.username,
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        this.updateCommentCounts(commentId, result.data);
      } else {
        this.showNotification('Failed to dislike comment', 'error');
      }
    } catch (error) {
      console.error('Error disliking comment:', error);
      this.showNotification('Failed to dislike comment', 'error');
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': this.currentUser.id,
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        this.showNotification('Comment deleted successfully', 'success');
        this.loadComments();
      } else {
        this.showNotification('Failed to delete comment: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      this.showNotification('Failed to delete comment', 'error');
    }
  }

  /**
   * Report a comment
   */
  async reportComment(commentId) {
    if (!confirm('Are you sure you want to report this comment?')) {
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/comments/${commentId}/report`, {
        method: 'POST',
        headers: {
          'X-User-Id': this.currentUser.id,
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        this.showNotification('Comment reported successfully', 'success');
      } else {
        this.showNotification('Failed to report comment: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Error reporting comment:', error);
      this.showNotification('Failed to report comment', 'error');
    }
  }

  /**
   * Update comment like/dislike counts in UI
   */
  updateCommentCounts(commentId, data) {
    const likeBtn = document.querySelector(`[data-comment-id="${commentId}"] .comment-like-btn`);
    const dislikeBtn = document.querySelector(`[data-comment-id="${commentId}"] .comment-dislike-btn`);

    if (likeBtn) {
      const likeCount = likeBtn.querySelector('.like-count');
      if (likeCount) {
        likeCount.textContent = data.likes;
      }
      if (data.userLiked) {
        likeBtn.classList.add('active');
      } else {
        likeBtn.classList.remove('active');
      }
    }

    if (dislikeBtn) {
      const dislikeCount = dislikeBtn.querySelector('.dislike-count');
      if (dislikeCount) {
        dislikeCount.textContent = data.dislikes;
      }
      if (data.userDisliked) {
        dislikeBtn.classList.add('active');
      } else {
        dislikeBtn.classList.remove('active');
      }
    }
  }

  /**
   * Render comments to the DOM
   */
  renderComments() {
    const feed = document.querySelector('.comments-feed');
    if (!feed) return;

    if (this.comments.length === 0) {
      feed.innerHTML = `
        <div class="no-comments">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      `;
      return;
    }

    feed.innerHTML = this.comments.map(comment => this.renderComment(comment)).join('');
    
    // Attach event listeners to new elements
    this.attachCommentEventListeners();
  }

  /**
   * Render a single comment
   */
  renderComment(comment) {
    const isOwner = comment.userId === this.currentUser.id;
    const avatarInitial = comment.username.charAt(0).toUpperCase();

    return `
      <div class="comment-item" data-comment-id="${comment.id}">
        <div class="comment-avatar">
          ${comment.userAvatar 
            ? `<img src="${comment.userAvatar}" alt="${comment.username}" />`
            : `<div class="avatar-initials">${avatarInitial}</div>`
          }
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">${comment.username}</span>
            ${comment.isPro ? '<span class="pro-badge">Pro</span>' : ''}
            <span class="comment-time">${comment.relativeTime}</span>
            ${comment.isEdited ? '<span class="edited-badge">(edited)</span>' : ''}
            <div class="comment-menu">
              <button class="comment-menu-btn" onclick="marketComments.toggleMenu('${comment.id}')">
                <i class="fas fa-ellipsis-h"></i>
              </button>
              <div class="comment-menu-dropdown" id="menu-${comment.id}" style="display: none;">
                ${isOwner 
                  ? `
                    <button onclick="marketComments.editComment('${comment.id}')">
                      <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="marketComments.deleteComment('${comment.id}')">
                      <i class="fas fa-trash"></i> Delete
                    </button>
                  `
                  : `
                    <button onclick="marketComments.reportComment('${comment.id}')">
                      <i class="fas fa-flag"></i> Report
                    </button>
                  `
                }
              </div>
            </div>
          </div>
          <p class="comment-text">${this.escapeHtml(comment.content)}</p>
          <div class="comment-actions">
            <button class="comment-like-btn" onclick="marketComments.likeComment('${comment.id}')">
              <i class="far fa-thumbs-up"></i>
              <span class="like-count">${comment.likes}</span>
            </button>
            <button class="comment-dislike-btn" onclick="marketComments.dislikeComment('${comment.id}')">
              <i class="far fa-thumbs-down"></i>
              <span class="dislike-count">${comment.dislikes}</span>
            </button>
            <button class="comment-reply-btn" onclick="marketComments.showReplyBox('${comment.id}')">
              <i class="far fa-comment"></i> Reply
            </button>
          </div>
          
          ${comment.replies && comment.replies.length > 0 
            ? `
              <div class="comment-replies">
                ${comment.replies.map(reply => this.renderReply(reply)).join('')}
              </div>
            `
            : ''
          }
          
          <div class="reply-composer" id="reply-box-${comment.id}" style="display: none;">
            <textarea 
              id="reply-input-${comment.id}" 
              placeholder="Write your reply..." 
              maxlength="2000"
            ></textarea>
            <div class="reply-actions">
              <button class="btn-cancel" onclick="marketComments.hideReplyBox('${comment.id}')">Cancel</button>
              <button class="btn-post-reply" onclick="marketComments.postComment('${comment.id}')">Post Reply</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render a reply
   */
  renderReply(reply) {
    const isOwner = reply.userId === this.currentUser.id;
    const avatarInitial = reply.username.charAt(0).toUpperCase();

    return `
      <div class="comment-reply" data-comment-id="${reply.id}">
        <div class="comment-avatar">
          ${reply.userAvatar 
            ? `<img src="${reply.userAvatar}" alt="${reply.username}" />`
            : `<div class="avatar-initials">${avatarInitial}</div>`
          }
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">${reply.username}</span>
            ${reply.isPro ? '<span class="pro-badge">Pro</span>' : ''}
            <span class="comment-time">${reply.relativeTime}</span>
            ${reply.isEdited ? '<span class="edited-badge">(edited)</span>' : ''}
          </div>
          <p class="comment-text">${this.escapeHtml(reply.content)}</p>
          <div class="comment-actions">
            <button class="comment-like-btn" onclick="marketComments.likeComment('${reply.id}')">
              <i class="far fa-thumbs-up"></i>
              <span class="like-count">${reply.likes}</span>
            </button>
            <button class="comment-dislike-btn" onclick="marketComments.dislikeComment('${reply.id}')">
              <i class="far fa-thumbs-down"></i>
              <span class="dislike-count">${reply.dislikes}</span>
            </button>
            ${isOwner 
              ? `<button class="comment-delete-btn" onclick="marketComments.deleteComment('${reply.id}')">
                   <i class="fas fa-trash"></i>
                 </button>`
              : ''
            }
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners to comment elements
   */
  attachCommentEventListeners() {
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.comment-menu')) {
        document.querySelectorAll('.comment-menu-dropdown').forEach(menu => {
          menu.style.display = 'none';
        });
      }
    });
  }

  /**
   * Toggle comment menu
   */
  toggleMenu(commentId) {
    const menu = document.getElementById(`menu-${commentId}`);
    if (menu) {
      const isVisible = menu.style.display === 'block';
      
      // Hide all menus
      document.querySelectorAll('.comment-menu-dropdown').forEach(m => {
        m.style.display = 'none';
      });
      
      // Toggle this menu
      menu.style.display = isVisible ? 'none' : 'block';
    }
  }

  /**
   * Show reply box
   */
  showReplyBox(commentId) {
    const replyBox = document.getElementById(`reply-box-${commentId}`);
    if (replyBox) {
      replyBox.style.display = 'block';
      const textarea = document.getElementById(`reply-input-${commentId}`);
      if (textarea) {
        textarea.focus();
      }
    }
  }

  /**
   * Hide reply box
   */
  hideReplyBox(commentId) {
    const replyBox = document.getElementById(`reply-box-${commentId}`);
    if (replyBox) {
      replyBox.style.display = 'none';
      const textarea = document.getElementById(`reply-input-${commentId}`);
      if (textarea) {
        textarea.value = '';
      }
    }
  }

  /**
   * Edit comment (placeholder for future implementation)
   */
  editComment(commentId) {
    this.showNotification('Edit functionality coming soon!', 'info');
    // TODO: Implement edit functionality
  }

  /**
   * Update pagination
   */
  updatePagination(pagination) {
    const container = document.querySelector('.comments-pagination');
    if (!container) return;

    if (!pagination.hasMore) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    container.innerHTML = `
      <button class="load-more-btn" onclick="marketComments.loadMore()">
        Load More Comments
      </button>
      <span class="pagination-info">
        Showing ${pagination.page * pagination.limit} of ${pagination.total} comments
      </span>
    `;
  }

  /**
   * Load more comments
   */
  loadMore() {
    this.currentPage++;
    this.loadComments();
  }

  /**
   * Show loading state
   */
  showLoading() {
    const feed = document.querySelector('.comments-feed');
    if (feed && this.currentPage === 1) {
      feed.innerHTML = `
        <div class="comments-loading">
          <div class="spinner"></div>
          <p>Loading comments...</p>
        </div>
      `;
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const loading = document.querySelector('.comments-loading');
    if (loading) {
      if (typeof loading.remove === 'function') {
        loading.remove();
      } else if (loading.parentNode) {
        loading.parentNode.removeChild(loading);
      }
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const feed = document.querySelector('.comments-feed');
    if (feed) {
      feed.innerHTML = `
        <div class="comments-error">
          <i class="fas fa-exclamation-circle"></i>
          <p>${message}</p>
          <button class="btn-retry" onclick="marketComments.loadComments()">Retry</button>
        </div>
      `;
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `comment-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when DOM is ready
let marketComments;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    marketComments = new MarketComments();
  });
} else {
  marketComments = new MarketComments();
}
