import { AuthenticatedRoute } from '../routes/_authenticated_route';

export default AuthenticatedRoute.extend({
  model: function (params) {
    let usernameLower = typeof params.username === 'string' ? params.username.toLowerCase() : '';
    let user = this.get('store').queryRecord('user', {
      username: usernameLower
    });
    //filter by params id
    return user;
  },

  renderTemplate: function () {
    this.render('users/user');
  }
});
