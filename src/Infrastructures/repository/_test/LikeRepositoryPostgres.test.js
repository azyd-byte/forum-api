import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import pool from '../../database/postgres/pool.js';
import LikeRepositoryPostgres from '../LikeRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import UserCommentLikesTableTestHelper from '../../../../tests/UserCommentLikesTableTestHelper.js';

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-456', threadId: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await UserCommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist like and add like to database', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike('comment-123', 'user-123');

      // Assert
      const likes = await UserCommentLikesTableTestHelper.findLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });
      expect(likes).toHaveLength(1);
      expect(likes[0].id).toBe('like-123');
    });
  });

  describe('deleteLike function', () => {
    it('should delete like from database', async () => {
      // Arrange
      await UserCommentLikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: 'comment-123',
        userId: 'user-123',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      await likeRepositoryPostgres.deleteLike('comment-123', 'user-123');

      // Assert
      const likes = await UserCommentLikesTableTestHelper.findLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });
      expect(likes).toHaveLength(0);
    });
  });

  describe('checkLikeStatus function', () => {
    it('should return true when comment has been liked by user', async () => {
      // Arrange
      await UserCommentLikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: 'comment-123',
        userId: 'user-123',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLiked = await likeRepositoryPostgres.checkLikeStatus('comment-123', 'user-123');

      // Assert
      expect(isLiked).toBe(true);
    });

    it('should return false when comment has not been liked by user', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLiked = await likeRepositoryPostgres.checkLikeStatus('comment-123', 'user-123');

      // Assert
      expect(isLiked).toBe(false);
    });
  });

  describe('getLikeCountByCommentId function', () => {
    it('should return correct like count for a comment', async () => {
      // Arrange
      await UserCommentLikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: 'comment-123',
        userId: 'user-123',
      });
      await UserCommentLikesTableTestHelper.addLike({
        id: 'like-456',
        commentId: 'comment-123',
        userId: 'user-456',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeCount = await likeRepositoryPostgres.getLikeCountByCommentId('comment-123');

      // Assert
      expect(likeCount).toBe(2);
    });
  });

  describe('getLikeCountsByThreadId function', () => {
    it('should return like counts grouped by comment_id for a thread', async () => {
      // Arrange
      await UserCommentLikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: 'comment-123',
        userId: 'user-123',
      });
      await UserCommentLikesTableTestHelper.addLike({
        id: 'like-456',
        commentId: 'comment-123',
        userId: 'user-456',
      });
      await UserCommentLikesTableTestHelper.addLike({
        id: 'like-789',
        commentId: 'comment-456',
        userId: 'user-123',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeCounts = await likeRepositoryPostgres.getLikeCountsByThreadId('thread-123');

      // Assert
      expect(likeCounts).toHaveLength(2);
      const comment123 = likeCounts.find((c) => c.comment_id === 'comment-123');
      const comment456 = likeCounts.find((c) => c.comment_id === 'comment-456');
      expect(comment123.like_count).toBe('2');
      expect(comment456.like_count).toBe('1');
    });
  });
});
