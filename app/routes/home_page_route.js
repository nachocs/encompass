import AuthenticatedRoute from '../routes/_authenticated_route';

export default AuthenticatedRoute.extend({
  model: function () {
    let assignments = this.store.findAll('assignment');
    return assignments;
  },
});
