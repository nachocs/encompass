import AuthenticatedRoute from '../routes/_authenticated_route';

export default AuthenticatedRoute.extend({
  model: function (params) {
    const answer = this.get('store').findRecord('answer', params.id);
    return answer;
  },

  renderTemplate: function () {
    this.render('answers/answer');
  }
});
