import { writeFile } from 'fs';
import { connect, connection, Promise } from 'mongoose';
import { flatten, uniq } from 'underscore';
import { Answer, Submission, Workspace } from '../datasource/schemas';

// eslint-disable-next-line no-undef
Promise = global.Promise;

connect('mongodb://localhost:27017/encompass');

async function getSubsWithoutAnswers() {
  try {
    let missingAnswers = 0;
    let missingPowsSubmIds = [];
    let updatedSubmissions = 0;
    const submissions = await Submission.find({ answer: { $exists: false }, 'thread.currentSubmissionId': { $exists: true, $ne: null } }).lean().exec();
    console.log(`There are ${submissions.length} submissions without an answer field`);
    console.log('This could take several moments for large numbers of submissions');

    // use thread.currentSubmissionId to look up corresponding answer in db
    // set answer field on submission model to corresponding answerId;
    // save;

    // note: should probably be using promise.all to speed things up, but its only a one time op

    for (let sub of submissions) {
      let subId = sub._id; // encompass submission record Id

      let submissionId = sub.thread.currentSubmissionId; // pows submission Id

      let encAnswer = await Answer.find({ powsSubmId: submissionId }).lean().exec();

      if (encAnswer.length === 0) {
        missingPowsSubmIds.push(submissionId);
        missingAnswers++;
      } else {
        let first = encAnswer[0];
        let answerId = first._id;

        let updated = await Submission.update({ _id: subId }, { $set: { answer: answerId } });
        updatedSubmissions++;
      }
    }

    console.log(`Updated ${updatedSubmissions} submissions with the corresponding answer`);



    console.log(`There are ${missingAnswers} missing answers`); // should be all ken ken related

    let uniqueMissing = uniq(missingPowsSubmIds);
    let json = (JSON.stringify(uniqueMissing));

    console.log(`There are  ${uniqueMissing.length} missing submission ids`);
    writeFile('missingPowsSubs.json', json, 'utf8', (err, data) => {
      if (err) {
        console.log('err write file', err);
      }
    });

    let subsRelatedToMissingAnswers = await Submission.find({ 'thread.currentSubmissionId': { $in: uniqueMissing } });

    let workspacesRelated = flatten(subsRelatedToMissingAnswers.map(sub => sub.workspaces));
    console.log('related workspaces', workspacesRelated); // workspace ids that correspond to the subs that are missing corresponding answer

    let workspaces = await Workspace.find({ _id: { $in: workspacesRelated } }).lean().exec();
    console.log('works', workspaces.map(ws => ws.name)); // to confirm that all are ken ken related

    // close mongo connection to encompass
    connection.close();

    console.log('done');

  } catch (err) {
    console.log(err);
  }


}

getSubsWithoutAnswers();