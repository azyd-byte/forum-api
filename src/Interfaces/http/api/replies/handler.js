import AddReplyUseCase from '../../../../Applications/use_case/AddReplyUseCase.js';
import DeleteReplyUseCase from '../../../../Applications/use_case/DeleteReplyUseCase.js';
import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';
import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js';

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(req, res, next) {
    try {
      const headerAuth = req.headers.authorization;
      if (!headerAuth || !headerAuth.startsWith('Bearer ')) {
        throw new AuthenticationError('Missing authentication');
      }

      const token = headerAuth.replace('Bearer ', '');
      const authenticationTokenManager = this._container.getInstance(AuthenticationTokenManager.name);
      await authenticationTokenManager.verifyAccessToken(token);
      const { id: owner } = await authenticationTokenManager.decodePayload(token);

      const { threadId, commentId } = req.params;
      const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
      const addedReply = await addReplyUseCase.execute(req.body, threadId, commentId, owner);

      res.status(201).json({
        status: 'success',
        data: {
          addedReply,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReplyHandler(req, res, next) {
    try {
      const headerAuth = req.headers.authorization;
      if (!headerAuth || !headerAuth.startsWith('Bearer ')) {
        throw new AuthenticationError('Missing authentication');
      }

      const token = headerAuth.replace('Bearer ', '');
      const authenticationTokenManager = this._container.getInstance(AuthenticationTokenManager.name);
      await authenticationTokenManager.verifyAccessToken(token);
      const { id: owner } = await authenticationTokenManager.decodePayload(token);

      const { threadId, commentId, replyId } = req.params;
      const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
      await deleteReplyUseCase.execute(threadId, commentId, replyId, owner);

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default RepliesHandler;
