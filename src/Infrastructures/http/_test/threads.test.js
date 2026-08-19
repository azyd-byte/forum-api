import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ username: 'dicoding', id: 'user-123' });

      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual(requestPayload.title);
      expect(response.body.data.addedThread.owner).toEqual('user-123');
    });

    it('should response 401 when request without authentication', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/threads')
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ username: 'dicoding', id: 'user-123' });

      const requestPayload = {
        title: 'sebuah thread',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ username: 'dicoding', id: 'user-123' });

      const requestPayload = {
        title: 123,
        body: true,
      };
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread detail correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: 'user-123',
        date: '2021-08-08T07:19:09.775Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        threadId: 'thread-123',
        content: 'sebuah comment',
        owner: 'user-456',
        date: '2021-08-08T07:22:33.555Z',
        isDelete: false,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        threadId: 'thread-123',
        content: 'komentar rahasia',
        owner: 'user-123',
        date: '2021-08-08T07:26:21.338Z',
        isDelete: true,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-1',
        commentId: 'comment-1',
        content: 'balasan terhapus',
        owner: 'user-456',
        date: '2021-08-08T07:59:48.766Z',
        isDelete: true,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-2',
        commentId: 'comment-1',
        content: 'sebuah balasan',
        owner: 'user-123',
        date: '2021-08-08T08:07:01.522Z',
        isDelete: false,
      });

      const app = await createServer(container);

      // Action
      const response = await request(app).get('/threads/thread-123');

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.id).toEqual('thread-123');
      expect(response.body.data.thread.title).toEqual('sebuah thread');
      expect(response.body.data.thread.body).toEqual('sebuah body thread');
      expect(response.body.data.thread.username).toEqual('dicoding');
      expect(response.body.data.thread.comments).toHaveLength(2);

      // First comment check
      const firstComment = response.body.data.thread.comments[0];
      expect(firstComment.id).toEqual('comment-1');
      expect(firstComment.username).toEqual('johndoe');
      expect(firstComment.content).toEqual('sebuah comment');
      expect(firstComment.replies).toHaveLength(2);
      expect(firstComment.replies[0].id).toEqual('reply-1');
      expect(firstComment.replies[0].content).toEqual('**balasan telah dihapus**');
      expect(firstComment.replies[0].username).toEqual('johndoe');
      expect(firstComment.replies[1].id).toEqual('reply-2');
      expect(firstComment.replies[1].content).toEqual('sebuah balasan');
      expect(firstComment.replies[1].username).toEqual('dicoding');

      // Second comment check
      const secondComment = response.body.data.thread.comments[1];
      expect(secondComment.id).toEqual('comment-2');
      expect(secondComment.username).toEqual('dicoding');
      expect(secondComment.content).toEqual('**komentar telah dihapus**');
      expect(secondComment.replies).toEqual([]);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).get('/threads/thread-not-found');

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });
});
