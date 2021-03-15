/* eslint-disable no-use-before-define */
/**
 * # Auth API
 * @description This is the API for authentication
 * @author Philip Wisner & Daniel Kelly
 */

//REQUIRE MODULES

import { randomBytes } from 'crypto';
import { writeFile } from 'fs';
import { createTestAccount, createTransport } from 'nodemailer';
import { propertyOf } from 'underscore';
import { clearAccessCookie, clearRefreshCookie, extractBearerToken, setSsoCookie, setSsoRefreshCookie } from '../../middleware/mtAuth';
import { handleError, sendError, sendResponse } from '../../middleware/requestHandler';
import { getEmailAuth, getUser } from '../../middleware/userAuth';
import { confirmEmail as __confirmEmail, forgotPassword, login, resendConfirmEmail, resetPassword as __resetPassword, resetPasswordById as __resetPasswordById, signup, validateResetPasswordToken } from '../../services/sso';
import { verifyJwt } from '../../utils/jwt';
import { areObjectIdsEqual } from '../../utils/mongoose';
import { isNil } from '../../utils/objects';
import emails from '../email_templates';
import { User as _User } from '../schemas';

const User = _User;





let secret;
if (process.env.NODE_ENV === 'seed') {
  secret = process.env.MT_USER_JWT_SECRET_TEST;
} else {
  secret = process.env.MT_USER_JWT_SECRET;
}


const localLogin = async (req, res, next) => {
  try {
    let { message, accessToken, refreshToken } = await login(req.body);
    if (message) {
      return res.json({ message });
    }

    // do we need to verify the accessToken
    // should always be valid coming from the sso server
    // await jwt.verify(accessToken, process.env.MT_USER_JWT_SECRET);

    setSsoCookie(res, accessToken);
    setSsoRefreshCookie(res, refreshToken);
    // send back user?

    return res.json({ message: 'success' });
  } catch (err) {
    handleError(err, res);
  }
};

const localSignup = async (req, res, next) => {
  try {
    let reqUser = getUser(req);
    let isFromSignupForm = !reqUser;
    let { isFromSectionPage } = req.body;

    delete req.body.isFromSectionPage;

    let allowedAccountTypes = [];
    let requestedAccountType = req.body.accountType;

    if (isFromSignupForm) {
      allowedAccountTypes = ['T'];
    } else {
      let creatorAccountType = reqUser.accountType;

      if (creatorAccountType === 'S') {
        // students cannot create other users;
        return sendError.NotAuthorizedError('Your account type is not authorized to create other users');
      }
      if (creatorAccountType === 'T' || creatorAccountType === 'P') {
        allowedAccountTypes = ['S', 'T'];
      } else if (creatorAccountType === 'A') {
        allowedAccountTypes = ['S', 'T', 'P', 'A'];
      }

      let isValidAccountType = allowedAccountTypes.includes(requestedAccountType);

      if (!isValidAccountType) {
        // default to teacher if not valid account type
        // should this return error instead?
        req.body.accountType = 'T';
      }
      let userSections = [];
      if (req.body.sectionId) {
        let section = {
          sectionId: req.body.sectionId,
          role: req.body.sectionRole
        };
        userSections.push(section);
        req.body.sections = userSections;
        delete req.body.sectionId;
        delete req.body.sectionRole;
      }
    }

    let { message, accessToken, refreshToken, encUser, existingUser } = await signup(req.body, reqUser);

    if (message) {
      if (existingUser && isFromSectionPage) {
        // check if can add existing User
        let existingEncId = existingUser.encUserId;

        let existingEncUser = await User.findById(existingEncId).lean();

        if (existingEncUser === null) {
          // should never happen
          return sendError.InternalError(null, res);
        }

        let canAdd = reqUser.accountType === 'A' || areObjectIdsEqual(reqUser.organization, existingEncUser.organization);

        if (canAdd) {
          return res.json({
            user: existingEncUser,
            canAddExistingUser: true
          });
        }

      }
      return res.json({ message });
    }

    if (typeof accessToken === 'string') {
      // accessToken will be undefined if user was created by an already logged in user
      // await jwt.verify(accessToken, process.env.MT_USER_JWT_SECRET);

      setSsoCookie(res, accessToken);
      setSsoRefreshCookie(res, refreshToken);
    }
    return res.json(encUser);
  } catch (err) {
    console.log('err signup', err);
    handleError(err, res);

  }

};


const logout = (req, res, next) => {
  clearAccessCookie(res);
  clearRefreshCookie(res);
  res.redirect('/');
};


const getResetToken = function (size) {
  return new Promise((resolve, reject) => {
    randomBytes(size, (err, buf) => {
      if (err) {
        return reject(err);
      }
      const token = buf.toString('hex');
      return resolve(token);
    });
  });
};

const sendEmailSMTP = function (recipient, host, template, token = null, userObj) {
  console.log(`getEmailAuth() return: ${getEmailAuth().username}`);
  let username = getEmailAuth().username;
  let password = getEmailAuth().password;

  return resolveTransporter(username, password)
    .then((smtpTransport) => {
      const msg = emails[template](recipient, host, token, userObj);
      let mailUsername = propertyOf(smtpTransport)(['options.auth.user']);

      return new Promise((resolve, reject) => {
        smtpTransport.sendMail(msg, (err) => {
          if (err) {
            let errorMsg = `Error sending email (${template}) to ${recipient} from ${mailUsername}: ${err}`;
            console.error(errorMsg);
            console.trace();
            return reject(errorMsg);
          }
          let msg = `Email (${template}) sent successfully to ${recipient} from ${mailUsername}`;
          return resolve(msg);
        });
      });
    });
};

const sendEmailsToAdmins = async function (host, template, relatedUser) {
  try {
    let adminCrit = {
      isTrashed: false,
      accountType: 'A',
      email: { $exists: true, $ne: null },
    };
    let admins = await User.find(adminCrit).lean().exec();
    if (!Array.isArray(admins)) {
      return;
    }

    // relatedUser is who the email is about, i.e. if a new user signed up
    admins.forEach((user) => {
      if (user.email) {
        sendEmailSMTP(user.email, host, template, null, relatedUser);
      }
    });

  } catch (err) {
    console.error(`Error sendEmailsToAdmins: ${err}`);
  }

};

const forgot = async function (req, res, next) {
  try {
    let results = await forgotPassword(req.body);
    return sendResponse(res, results);
  } catch (err) {
    console.error(`Error auth/forgot: ${err}`);
    console.trace();
    handleError(err, res);
  }
};

const validateResetToken = async function (req, res, next) {
  try {
    let results = await validateResetPasswordToken(req.params.token);
    return sendResponse(res, results);

  } catch (err) {
    handleError(err, res);
  }
};

const resetPasswordById = async function (req, res, next) {
  try {
    const reqUser = getUser(req);

    // need to be admin or be teacher and resetting one of your students
    //TODO: update this to only let you reset one of your student's passwords
    const hasPermission = reqUser && !reqUser.isStudent;

    if (!hasPermission) {
      return sendError.NotAuthorizedError('You are not authorized.', res);
    }

    let results = await __resetPasswordById(req.body, reqUser);
    return sendResponse(res, results);

  } catch (err) {
    handleError(err, res);
  }
};

const resetPassword = async function (req, res, next) {
  try {


    let { user, accessToken, refreshToken, message } = await __resetPassword(req.body, req.params.token);

    if (message) {
      res.json(message);
      return;
    }
    // await jwt.verify(accessToken, process.env.MT_USER_JWT_SECRET);

    setSsoCookie(res, accessToken);
    setSsoRefreshCookie(res, refreshToken);

    return sendResponse(res, user);
  } catch (err) {
    console.error(`Error resetPassword: ${err}`);
    console.trace();
    handleError(err, res);
  }
};

const confirmEmail = async function (req, res, next) {
  try {
    let results = await __confirmEmail(req.params.token);

    // do not send user object back if user was not already logged in
    let reqUser = getUser(req);
    let isNotLoggedIn = isNil(reqUser);

    if (isNotLoggedIn) {
      delete results.user;
    }

    return sendResponse(res, results);
  } catch (err) {
    console.log('err conf em: ', err.message);
    handleError(err, res);
  }
};

const resendConfirmationEmail = async function (req, res, next) {
  try {
    let reqUser = getUser(req);
    let results = await resendConfirmEmail(reqUser);
    return sendResponse(res, results);

  } catch (err) {
    console.log('err resend conf: ', err.message);
    handleError(err, res);
  }
};

const insertNewMtUser = async (req, res, next) => {
  try {
    let authToken = extractBearerToken(req);

    await verifyJwt(authToken, secret);

    // valid token
    let newUser = await User.create(req.body);
    return sendResponse(res, newUser);
  } catch (err) {
    console.log('Error insertNewMtUser: ', err);
    handleError(err, res);
  }
};

const ssoUpdateUser = async (req, res, next) => {
  try {
    let authToken = extractBearerToken(req);
    await verifyJwt(
      authToken,
      secret
    );
    let user = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    return res.json(user);
  } catch (err) {
    handleError(err, res);
  }

};

const resolveTransporter = function (
  username,
  password,
) {
  return new Promise(
    (resolve, reject) => {
      let isTestEnv = process.env.NODE_ENV === 'seed';

      if (isTestEnv) {
        createTestAccount(
          (err, account) => {
            // create reusable transporter object using the default SMTP transport
            if (err) {
              reject(err);
            } else {
              // in case we want to look at the sent emails
              let fileName = 'ethereal_creds.json';
              writeFile(
                fileName,
                JSON.stringify({
                  user: account.user,
                  pass: account.pass,
                }),
                (err) => {
                  if (err) {
                    throw err;
                  }
                  console.log('Ethereal creds saved to ', fileName);
                },
              );

              resolve(
                createTransport({
                  host: 'smtp.ethereal.email',
                  port: 587,
                  secure: false, // true for 465, false for other ports
                  auth: {
                    user: account.user, // generated ethereal user
                    pass: account.pass, // generated ethereal password
                  },
                }),
              );
            }
          },
        );
      } else {
        if (typeof username !== 'string') {
          return reject(new Error('Missing gmail username'));
        }

        if (typeof password !== 'string') {
          return reject(new Error('Missing gmail password'));
        }

        resolve(
          createTransport({
            service: 'Gmail',
            auth: {
              user: username,
              pass: password,
            },
          }),
        );
      }
    },
  );
};


const _logout = logout;
export { _logout as logout };
export { _localLogin as localLogin };
export { _localSignup as localSignup };
export { _forgot as forgot };
export { _validateResetToken as validateResetToken };
export { _resetPassword as resetPassword };
export { _resetPasswordById as resetPasswordById };
export { _confirmEmail as confirmEmail };
export { _getResetToken as getResetToken };
export { _sendEmailSMTP as sendEmailSMTP };
export { _resendConfirmationEmail as resendConfirmationEmail };
export { _sendEmailsToAdmins as sendEmailsToAdmins };
export { _insertNewMtUser as insertNewMtUser };
export { _ssoUpdateUser as ssoUpdateUser };
const _localLogin = localLogin;
const _localSignup = localSignup;
const _forgot = forgot;
const _validateResetToken = validateResetToken;
const _resetPassword = resetPassword;
const _resetPasswordById = resetPasswordById;
const _confirmEmail = confirmEmail;
const _getResetToken = getResetToken;
const _sendEmailSMTP = sendEmailSMTP;
const _resendConfirmationEmail = resendConfirmationEmail;
const _sendEmailsToAdmins = sendEmailsToAdmins;
const _insertNewMtUser = insertNewMtUser;
const _ssoUpdateUser = ssoUpdateUser;
