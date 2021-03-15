//REQUIRE MODULES
import cookieParser from 'cookie-parser';
import express, { json, static, urlencoded } from 'express';
import { middleware } from 'express-paginate';
import { createServer } from 'http';
import { connect, connection } from 'mongoose';
import logger from 'morgan';
import multer, { diskStorage, memoryStorage } from 'multer';
import { join } from 'path';
import { nconf as _nconf } from './config';
//REQUIRE API
import { get, post, put } from './datasource/api';
import { confirmEmail, forgot, insertNewMtUser, localLogin, localSignup, logout, resendConfirmationEmail, resetPassword, resetPasswordById, ssoUpdateUser, validateResetToken } from './datasource/api/auth';
//REQUIRE MODELS
//REQUIRE CONFIG SUPPORT
import { workspace } from './datasource/fixed';
import { prepareEncUser, prepareMtUser } from './middleware/mtAuth';
import { buildDestination, fileFilter as _fileFilter, filename as _filename } from './middleware/multer';
import { prep, processPath, validateContent, validateId } from './middleware/path';
//REQUIRE MIDDLEWARE
import { protect } from './middleware/userAuth';
import { init } from './socketInit';
import socketListeners from './sockets';

require('dotenv').config();




const nconf = _nconf;

//CREATE EXPRESS APP
const server = express();

let port = nconf.get('port');
let dbConf = nconf.get('database');

console.log('process.env.PORT: ', process.env.PORT);
console.log('process.env.MONGO_URL: ', process.env.MONGO_URL);

switch (process.env.NODE_ENV) {
  case 'test':
    console.log("NODE_ENV == test");
    port = nconf.get('testPort');
    dbConf.name = nconf.get('testDBName');
    break;
  case 'seed':
    console.log("NODE_ENV == seed");
    port = nconf.get('testPort');
    dbConf.name = nconf.get('seedDBName');
    break;
  case 'staging':
    console.log("NODE_ENV == staging");
    port = process.env.PORT;
    dbConf.name = process.env.DB_NAME;
    break;
  case 'production':
    console.log("NODE_ENV == production");
    port = process.env.PORT;
    dbConf.name = process.env.DB_NAME;
    break;
  case 'development':
    console.log("NODE_ENV == development");
    port = nconf.get('devPort');
    dbConf.name = nconf.get('devDBName');
    break;
  default:
    port = nconf.get('devPort');
    dbConf.name = nconf.get('devDBName');
    break;
}

console.log(`database name: '${dbConf.name}'`);

connect(`mongodb://${dbConf.host}:27017/${dbConf.name}`, {
  useMongoClient: true
});

console.info(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);
console.info(`Port: ${port.toString()}`);
console.info(`db name: ${dbConf.name}`);

server.set('port', port);

const mainServer = createServer(server);

init(mainServer);
socketListeners();

mainServer.listen(port);

// mongo >=3.6
//  const uri = `mongodb://${dbConf.user}:${dbConf.pass}@${dbConf.host}:27017/${dbConf.name}`;
// mongoose.connect(uri);
const db = connection;
db.on('error', function (err) {
  console.trace(err);
  throw new Error(err);
});


//MIDDLEWARE
server.use(logger('dev'));
server.use(json({ limit: '100000kb' }));
server.use(urlencoded({
  extended: false
}));
server.use(cookieParser());
server.use(static(join(__dirname, 'public')));
server.use(prep());
server.use(processPath());
server.use(prepareMtUser);
server.use(prepareEncUser);
server.use(protect());
server.use(validateContent());

const upload = multer({
  storage: memoryStorage(),
  fileFilter: _fileFilter,
});

const PDFUpload = multer({
  storage: diskStorage({
    destination: buildDestination,
    filename: _filename
  }),
  fileFilter: _fileFilter
});

// // IMAGE UPLOAD
server.post('/image', upload.array('photo', 200), post.images);
server.post('/pdf', PDFUpload.array('photo', 50), post.images);

// LOCAL AUTHENTICATION CALLS
server.post('/auth/login', localLogin);
server.post('/auth/signup', localSignup);
server.get('/auth/logout', logout);
server.post('/auth/forgot', forgot);
server.get('/auth/reset/:token', validateResetToken);
server.post('/auth/reset/:token', resetPassword);
server.post('/auth/resetuser', resetPasswordById);
server.get('/auth/confirm/:token', confirmEmail);
server.get('/auth/resend/confirm', resendConfirmationEmail);

server.post('/auth/newMtUser', insertNewMtUser);
server.put('/auth/sso/user/:id', ssoUpdateUser);

// VMT
server.get('/api/vmt/rooms/:id', validateId(), get.vmtRoom);

//API CALLS
//ALL GET REQUESTS
server.get('/api/users', get.users);
server.get('/api/users/:id', validateId(), get.user);
server.get('/api/workspaces', middleware(20, 100), get.workspaces);
server.get({ path: '/api/workspaces/:id', version: '0.0.1' }, validateId(), workspace);
server.get('/api/workspaces/:id', validateId(), get.workspace);
server.get('/api/folders', get.folders);
server.get('/api/folders/:id', validateId(), get.folder);
server.get('/api/foldersets', get.folderSets);
server.get('/api/foldersets/:id', validateId(), get.folderSet);
server.get('/api/pdSets', get.pdSets); // For some reason Ember prefers pDSets to pdSets and PDSets
server.get('/api/submissions', get.submissions);
server.get('/api/submissions/:id', validateId(), get.submission);
server.get('/api/selections', get.selections);
server.get('/api/selections/:id', validateId(), get.selection);
server.get('/api/comments', middleware(100, 100), get.comments);
server.get('/api/comments/:id', validateId(), get.comment);
server.get('/api/responses', get.responses);
server.get('/api/responses/:id', validateId(), get.response);
server.get('/api/taggings', get.taggings);
server.get('/api/taggings/:id', validateId(), get.tagging);
server.get('/api/problems', middleware(20, 100), get.problems);
server.get('/api/problems/:id', validateId(), get.problem);
server.get('/api/answers', get.answers);
server.get('/api/answers/:id', validateId(), get.answer);
server.get('/api/sections', get.sections);
server.get('/api/sections/:id', validateId(), get.section);
server.get('/api/categories', get.categories);
server.get('/api/categories/:id', validateId(), get.category);
server.get('/api/organizations', get.organizations);
server.get('/api/organizations/:id', validateId(), get.organization);
server.get('/api/assignments', get.assignments);
server.get('/api/assignments/:id', validateId(), get.assignment);
server.get('/api/images', get.images);
server.get('/api/images/:id', validateId(), get.image);
server.get('/api/images/file/:id', validateId(), get.imageFile);
server.get('/api/stats', get.stats);
server.get('/api/about', get.about);
server.get('/api/notifications', get.notifications);
server.get('/api/notifications/:id', validateId(), get.notification);
server.get('/api/responseThreads/', middleware(25, 100), get.responseThreads);
//ALL POST REQUESTS
server.post('/api/users', post.user);
server.post('/api/workspaces', post.workspace);
server.post('/api/errors', post.error);
server.post('/api/folders', post.folder);
server.post('/api/submissions', post.submission);
server.post('/api/selections', post.selection);
server.post('/api/comments', post.comment);
server.post('/api/responses', post.response);
server.post('/api/taggings', post.tagging);
server.post('/api/problems', post.problem);
server.post('/api/answers', post.answer);
server.post('/api/sections', post.section);
server.post('/api/organizations', post.organization);
server.post('/api/assignments', post.assignment);
server.post('/api/encWorkspaceRequests', post.workspaceEnc);
server.post('/api/copyWorkspaceRequests', post.cloneWorkspace);
server.post('/api/folderSets', post.folderSet);
server.post('/api/updateWorkspaceRequests', post.updateWorkspaceRequest);
server.post('/api/notifications', post.notification);
server.post('/api/parentWorkspaceRequests', post.parentWorkspace);


//ALL PUT REQUESTS
server.put('/api/folders/:id', validateId(), put.folder);
server.put('/api/submissions/:id', validateId(), put.submission);
server.put('/api/selections/:id', validateId(), put.selection);
server.put('/api/comments/:id', validateId(), put.comment);
server.put('/api/responses/:id', validateId(), put.response);
server.put('/api/taggings/:id', validateId(), put.tagging);
server.put('/api/users/:id', validateId(), put.user);
server.put('/api/users/addSection/:id', validateId(), put.user.addSection);
server.put('/api/users/removeSection/:id', validateId(), put.user.removeSection);
server.put('/api/users/addAssignment/:id', validateId(), put.user.addAssignment);
server.put('/api/users/removeAssignment/:id', validateId(), put.user.removeAssignment);
server.put('/api/workspaces/:id', validateId(), put.workspace);
server.put('/api/problems/:id', validateId(), put.problem);
server.put('/api/problems/addCategory/:id', validateId(), put.problem.addCategory);
server.put('/api/problems/removeCategory/:id', validateId(), put.problem.removeCategory);
server.put('/api/answers/:id', validateId(), put.answer);
server.put('/api/sections/:id', validateId(), put.section);
server.put('/api/sections/addTeacher/:id', validateId(), put.section.addTeacher);
server.put('/api/sections/removeTeacher/:id', validateId(), put.section.removeTeacher);
server.put('/api/sections/addStudent/:id', validateId(), put.section.addStudent);
server.put('/api/sections/removeStudent/:id', validateId(), put.section.removeStudent);
server.put('/api/sections/addProblem/:id', validateId(), put.section.addProblem);
server.put('/api/sections/removeProblem/:id', validateId(), put.section.removeProblem);
server.put('/api/organizations/:id', validateId(), put.organization);
server.put('/api/assignments/:id', validateId(), put.assignment);
server.put('/api/notifications/:id', validateId(), put.notification);

//ALL DELETE REQUESTS
server.delete('/api/images/:id', validateId(), delete.image);


let buildDir = 'build';
if (process.env.BUILD_DIR) {
  buildDir = process.env.BUILD_DIR;
}
console.log(`buildDir: ${buildDir}`);
server.get(/.*/, static(buildDir));

server.post({
  name: 'newWorkspaces',
  path: '/api/newWorkspaceRequests',
}, post.newWorkspaceRequest);

server.post('/api/import', post.import);
server.post('/api/importRequests', post.importSubmissionsRequest);
server.post('/api/vmtImportRequests', post.vmtImportRequests);

// error handler
server.use(function (err, req, res, next) {
  err.status = 500;
  next(err);
});

export default mainServer;

