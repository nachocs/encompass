// attrs passed in by parent
// store
// onUpdate
// primaryFilter
// orgs

/*global _:false */
import Ember from 'ember';
import CategoriesListMixin from '../mixins/categories_list_mixin';
import CurrentUserMixin from '../mixins/current_user_mixin';





export default Ember.Component.extend(CurrentUserMixin, CategoriesListMixin, {
  elementId: 'problem-filter',
  primaryFilterValue: Ember.computed.alias('primaryFilter.value'),
  primaryFilterInputs: Ember.computed.alias('filter.primaryFilters.inputs'),
  secondaryFilter: Ember.computed.alias('primaryFilter.secondaryFilters'),
  showAdminFilters: Ember.computed.equal('primaryFilter.value', 'all'),
  adminFilter: Ember.computed.alias('filter.primaryFilters.inputs.all'),
  showCategoryFilters: false,
  showMoreFilters: false,
  closedMenu: true,


  init: function () {
    this._super(...arguments);
    this.set('categoriesFilter', this.get('selectedCategories'));
  },
  // current subFilter selected values
  currentValues: function () {
    return this.get('secondaryFilter.selectedValues');
  }.property('secondaryFilter.selectedValues.[]'),

  // used for populating the selectize instance
  // orgs passed in from parent are all orgs from db
  orgOptions: function () {
    let orgs = this.get('orgs');
    let toArray = orgs.toArray();
    let mapped = _.map(toArray, (org) => {
      return {
        id: org.id,
        name: org.get('name')
      };

    });
    return mapped;
  }.property('orgs.[]'),

  primaryFilterOptions: function () {
    let mapped = _.map(this.get('primaryFilterInputs'), (val, key) => {
      return val;
    });
    return _.sortBy(mapped, 'label');
  }.property('filter'),

  secondaryFilterOptions: function () {
    return _.map(this.get('primaryFilter.secondaryFilters.inputs'), (val, key) => {
      return val;
    });
  }.property('primaryFilter'),

  actions: {
    updateTopLevel(val) {
      // need to set filter[val] : true
      // but also need to make sure the current selected item is now false
      let currentValue = this.get('primaryFilterValue');
      if (!Ember.isEqual(currentValue, val)) {
        let newPrimaryFilter = this.get('primaryFilterInputs')[val];
        this.set('primaryFilter', newPrimaryFilter);
        if (this.get('onUpdate')) {
          this.get('onUpdate')();
        }
      }
    },
    updateSecondLevel(e) {
      let { id } = e.target;
      let secondaryFilter = this.get('secondaryFilter');

      let targetInput = secondaryFilter.inputs[id];
      if (!targetInput) {
        // not a valid option
        return;
      }
      // valid option, toggle the inputs isApplied value
      targetInput.isApplied = !targetInput.isApplied;

      // filter for inputs who are currently applied
      let appliedInputs = _.filter(secondaryFilter.inputs, (input) => {
        return input.isApplied;
      });

      let appliedValues = _.map(appliedInputs, input => input.value);

      // update selectedValues on secondaryFilter

      this.set('secondaryFilter.selectedValues', appliedValues);

      if (this.get('onUpdate')) {
        this.get('onUpdate')();
      }
    },

    onUpdate() {
      this.get('onUpdate')();
    },

    toggleCategoryFilters() {
      this.set('showCategoryFilters', !this.get('showCategoryFilters'));
    },

    toggleMoreFilters() {
      this.set('showMoreFilters', !this.get('showMoreFilters'));
      this.set('closedMenu', !this.get('closedMenu'));
    },

    toggleTrashedProblems() {
      this.set('toggleTrashed', !this.get('toggleTrashed'));
      this.get('triggerShowTrashed')();
    },

    showCategoryMenu() {
      this.get('store').query('category', {}).then((queryCats) => {
        let categories = queryCats.get('meta');
        this.set('categoryTree', categories.categories);
        this.sendAction('sendtoApplication', this.get('categoryTree'));
      });
    },

    addCategorySelectize(val, $item) {
      if (!val) {
        return;
      }

      let peeked = this.get('store').peekAll('category');
      let cat = peeked.findBy('id', val);
      this.get('categoriesFilter').addObject(cat);

      // clear input
      this.$('select#categories-filter')[0].selectize.clear();
    },

    removeCategory(category) {
      this.get('categoriesFilter').removeObject(category);
    },

    // closeModal() {
    //   this.set('showCategoryList', false);
    // },

    toggleIncludeSubCats() {
      // toggle value
      let doInclude = this.get('doIncludeSubCategories');
      this.set('doIncludeSubCategories', !doInclude);

      let filter = this.get('categoriesFilter');
      // fetch problems if category filter isnt empty
      if (!_.isEmpty(filter)) {
        this.get('onUpdate')();
      }
    }

  }
});