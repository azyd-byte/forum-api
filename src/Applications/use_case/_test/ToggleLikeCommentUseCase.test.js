import { describe, it, expect, vi } from 'vitest';
import ToggleLikeCommentUseCase from '../ToggleLikeCommentUseCase.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import LikeRepository from '../../../Domains/likes/LikeRepository.js';

describe('ToggleLikeCommentUseCase', () => {
  it('should orchestrating the add like action correctly if not liked yet', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.isThreadExist = vi.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.isCommentExist = vi.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkLikeStatus = vi.fn().mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLike = vi.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.deleteLike = vi.fn().mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(
      useCasePayload.threadId,
      useCasePayload.commentId,
      useCasePayload.userId,
    );

    // Assert
    expect(mockThreadRepository.isThreadExist).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.isCommentExist).toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.checkLikeStatus).toHaveBeenCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId,
    );
    expect(mockLikeRepository.addLike).toHaveBeenCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId,
    );
    expect(mockLikeRepository.deleteLike).not.toHaveBeenCalled();
  });

  it('should orchestrating the delete like action correctly if already liked', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.isThreadExist = vi.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.isCommentExist = vi.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkLikeStatus = vi.fn().mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.addLike = vi.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.deleteLike = vi.fn().mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(
      useCasePayload.threadId,
      useCasePayload.commentId,
      useCasePayload.userId,
    );

    // Assert
    expect(mockThreadRepository.isThreadExist).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.isCommentExist).toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.checkLikeStatus).toHaveBeenCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId,
    );
    expect(mockLikeRepository.deleteLike).toHaveBeenCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId,
    );
    expect(mockLikeRepository.addLike).not.toHaveBeenCalled();
  });
});
