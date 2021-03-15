import Ember from 'ember';
import $ from 'jquery';
import CurrentUserMixin from '../mixins/current_user_mixin';






export default Ember.Component.extend(CurrentUserMixin, {
  elementId: 'problem-home',
  classNames: ['home-view'],
  showCategories: false,

  publicProblems: function () {
    var problems = this.problems.filterBy('isTrashed', false);
    var publicProblems = problems.filterBy('privacySetting', 'E');
    var sorted = publicProblems.sortBy('createDate').reverse();
    return sorted.slice(0, 10);
  }.property('problems.@each.isTrashed', 'currentUser.isStudent'),


  actions: {
    showCategories: function () {
      this.get('store').query('category', {}).then((queryCats) => {
        let categories = queryCats.get('meta');
        this.set('categoryTree', categories.categories);
      });
      this.set('showCategories', !(this.get('showCategories')));
      Ember.run.later(() => {
        $('html, body').animate({ scrollTop: $(document).height() });
      }, 5);
    },
  }

});
