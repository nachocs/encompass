/**
  * # Fake Login API
  * @description This is the API for logging into Encompass w/o CAS
  * @authors Amir Tahvildaran <amir@mathforum.org>
  * @since 1.0.3
  */

//REQUIRE MODULES
import { serialize } from 'cookie';
import { format } from 'util';
import { v4 } from 'uuid';
//REQUIRE FILES
import { nconf } from './config';
import { User } from './datasource/schemas';



function fakeLogin(req, res, next) {
  var username = req.params.username;
  var name = username.toLowerCase();
  var key = v4();
  var webConf = nconf.get('web');

  // Create the user
  var user = new User({
    username: name,
    key: key
  });

  var upsertData = user.toObject();
  delete upsertData._id;
  delete upsertData.history;

  // Create login event
  var loggedIn = user.history.create({
    event: 'Login',
    creator: name,
    message: format("User %s (fake) logged in", name)
  });


  User.update({ username: name }, upsertData, { upsert: true }, function (err, count, result) {
    if (err) {
      res.send(err); // This should never happen
    } else {
      // Give them a session cookie
      res.header('Set-Cookie', serialize('EncAuth', key, { path: '/' }));
      res.header('Location', webConf.base);
      res.send(301);
    }
  });
}

const _fakeLogin = fakeLogin;
export { _fakeLogin as fakeLogin };
