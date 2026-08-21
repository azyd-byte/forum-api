import express from 'express';

const createCommentsRouter = (handler) => {
  const router = express.Router({ mergeParams: true });

  router.post('/:threadId/comments', handler.postCommentHandler);
  router.delete('/:threadId/comments/:commentId', handler.deleteCommentHandler);
  router.put('/:threadId/comments/:commentId/likes', handler.putLikeCommentHandler);

  return router;
};

export default createCommentsRouter;

