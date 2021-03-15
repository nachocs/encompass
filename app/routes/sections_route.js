import AuthenticatedRoute from '../routes/_authenticated_route';

export default AuthenticatedRoute.extend({
  model: function () {
    let sections = this.get('store').findAll('section');
    return sections;
  },

  renderTemplate: function () {
    this.render('sections/sections');
  }
});
