const { randomUUID } = require('node:crypto');
const { sessionTtlMs } = require('../config/cookie');

const sessions = new Map();

function create(userId) {
  const session = {
    userId,
    expiresAt: new Date(Date.now() + sessionTtlMs),
  };
  const id = randomUUID();
  sessions.set(id, session);
  return { id, ...session };
}

function get(id) {
  const session = sessions.get(id);
  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    sessions.delete(id);
    return null;
  }

  return { ...session };
}

function destroy(id) {
  if (typeof id === 'string') sessions.delete(id);
}

module.exports = { create, get, destroy };
