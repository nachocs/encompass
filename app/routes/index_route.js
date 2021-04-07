/**
  */
import Route from '@ember/routing/route';






export default Route.extend({
  model: function () {
    let user = this.modelFor('application');
    let assignments = this.store.findAll("assignment");
    return { "assignments": assignments, "user": user };
  },
  renderTemplate: function () {
    this.render("index");
  },
});
