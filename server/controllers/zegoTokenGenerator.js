import crypto from 'crypto';

/**
 * Generate a token for ZEGOCLOUD
 */
export function generateToken04(appId, userId, serverSecret, effectiveTimeInSeconds, payload) {
  const createTime = Math.floor(Date.now() / 1000);
  const expireTime = createTime + effectiveTimeInSeconds;

  const payloadObject = {
    app_id: appId,
    user_id: userId,
    nonce: Math.floor(Math.random() * 2147483647),
    ctime: createTime,
    expire: expireTime,
    payload,
  };

  const payloadString = JSON.stringify(payloadObject);
  const base64Payload = Buffer.from(payloadString).toString('base64');

  const hash = crypto
    .createHmac('sha256', serverSecret)
    .update(base64Payload)
    .digest('hex');

  const token = `${base64Payload}.${hash}`;
  return token;
}
