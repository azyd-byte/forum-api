import express from 'express';

const createRepliesRouter = (handler) => {
  const router = express.Router({ mergeParams: true });

  router.post('/:threadId/comments/:commentId/replies', handler.postReplyHandler);
  router.delete('/:threadId/comments/:commentId/replies/:replyId', handler.deleteReplyHandler);

  return router;
};

export default createRepliesRouter;
