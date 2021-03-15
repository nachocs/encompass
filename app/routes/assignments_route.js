import AuthenticatedRoute from '../routes/_authenticated_route';
/**
  * # Assignments Route
  * @description Route for dealing with all assignment objects
  * @todo This is really the assignments_index route and should be named as such by convention
  */
export default AuthenticatedRoute.extend({
  model: function () {
    let assignments = this.get('store').findAll('assignment');
    return assignments;
  },

  renderTemplate: function () {
    this.render('assignments/assignments');
  }
});
