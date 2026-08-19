import AddCommentUseCase from '../../../../Applications/use_case/AddCommentUseCase.js';
import DeleteCommentUseCase from '../../../../Applications/use_case/DeleteCommentUseCase.js';
import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';
import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js';

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(req, res, next) {
    try {
      const headerAuth = req.headers.authorization;
      if (!headerAuth || !headerAuth.startsWith('Bearer ')) {
        throw new AuthenticationError('Missing authentication');
      }

      const token = headerAuth.replace('Bearer ', '');
      const authenticationTokenManager = this._container.getInstance(AuthenticationTokenManager.name);
      await authenticationTokenManager.verifyAccessToken(token);
      const { id: owner } = await authenticationTokenManager.decodePayload(token);

      const { threadId } = req.params;
      const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
      const addedComment = await addCommentUseCase.execute(req.body, threadId, owner);

      res.status(201).json({
        status: 'success',
        data: {
          addedComment,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentHandler(req, res, next) {
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
      const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
      await deleteCommentUseCase.execute(threadId, commentId, owner);

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CommentsHandler;
