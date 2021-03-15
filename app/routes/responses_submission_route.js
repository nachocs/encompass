import Ember from 'ember';
import AuthenticatedRoute from '../routes/_authenticated_route';


export default AuthenticatedRoute.extend({
  utils: Ember.inject.service('utility-methods'),
  queryParams: {
    responseId: {
      refreshModel: true
    }
  },

  beforeModel(transition) {
    let responseId = transition.queryParams.responseId;
    let allResponses = this.get('store').peekAll('response');

    if (this.get('utils').isValidMongoId(responseId)) {
      let response = allResponses.findBy('id', responseId);

      this.set('response', response);
    } else {
      this.set('response', null);
    }
  },
  resolveSubmission(submissionId) {
    let peeked = this.get('store').peekRecord('submission', submissionId);
    if (peeked) {
      return Ember.RSVP.resolve(peeked);
    }
    return this.get('store').findRecord('submission', submissionId);
  },

  resolveWorkspace(workspaceId) {
    let peeked = this.get('store').peekRecord('workspace', workspaceId);
    if (peeked) {
      return Ember.RSVP.resolve(peeked);
    }
    return this.get('store').findRecord('workspace', workspaceId);

  },

  model(params) {
    if (!params.submission_id) {
      return null;
    }

    let allResponses = this.get('store').peekAll('response');

    return this.resolveSubmission(params.submission_id)
      .then((submission) => {
        let wsIds = submission.hasMany('workspaces').ids();
        let wsId = wsIds.get('firstObject');
        return Ember.RSVP.hash({
          submission,
          workspace: this.resolveWorkspace(wsId),
        });
      })
      .then((hash) => {
        return Ember.RSVP.hash({
          submission: hash.submission,
          workspace: hash.workspace,
          submissions: hash.workspace.get('submissions'),
        });
      })
      .then((hash) => {
        let studentSubmissions = hash.submissions.filterBy('student', hash.submission.get('student'));

        let associatedResponses = allResponses.filter((response) => {
          let subId = response.belongsTo('submission').id();
          return response.get('id') && !response.get('isTrashed') && subId === hash.submission.get('id');
        });

        let response = this.get('response');
        if (!this.get('response')) {
          response = associatedResponses
            .filterBy('responseType', 'mentor')
            .sortBy('createDate').get('lastObject');
        }

        return {
          submission: hash.submission,
          workspace: hash.workspace,
          submissions: studentSubmissions,
          responses: associatedResponses,
          response: response,
          allResponses,
        };

      });
  },

  redirect(model, transition) {
    if (!model) {
      this.transitionTo('responses');
    }
  },
  actions: {
    toResponseSubmission(subId) {
      this.transitionTo('responses.submission', subId);
    },
    toResponse(submissionId, responseId) {
      this.transitionTo('responses.submission', submissionId, { queryParams: { responseId: responseId } });
    },
    toResponses() {
      this.transitionTo('responses');
    },
    toNewResponse: function (submissionId, workspaceId) {
      this.transitionTo('responses.new.submission', submissionId, { queryParams: { workspaceId: workspaceId } });
    }
  },

  renderTemplate() {
    this.render('responses/response');
  }
});