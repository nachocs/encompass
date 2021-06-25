import AuthenticatedRoute from './_authenticated_route';
/**
 * # Assignments Route
 * @description Route for dealing with all assignment objects
 * @todo This is really the assignments_index route and should be named as such by convention
 */
export default AuthenticatedRoute.extend({
  model: function () {
    let assignments = this.store.findAll('assignment');
    return assignments;
  },
});
