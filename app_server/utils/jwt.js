import { sign, verify } from 'jsonwebtoken';

export function verifyJwt(token, key, options) {
  return new Promise((resolve, reject) => {
    verify(token, key, options || {}, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

export function signJwt(payload, secret, options) {
  return new Promise((resolve, reject) => {
    sign(payload, secret, options || {}, (err, encoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(encoded);
      }
    });
  });
}
