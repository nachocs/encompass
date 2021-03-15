/*global _:false */
import Ember from 'ember';
import $ from 'jquery';
import CategoriesListMixin from '../mixins/categories_list_mixin';
import CurrentUserMixin from '../mixins/current_user_mixin';
import ErrorHandlingMixin from '../mixins/error_handling_mixin';






export default Ember.Component.extend(CurrentUserMixin, CategoriesListMixin, ErrorHandlingMixin, {
  elementId: 'problem-list-container',
  showList: true,
  menuClosed: true,
  toggleTrashed: false,
  searchOptions: ['general', 'title'],
  searchCriterion: 'general',
  sortCriterion: { name: 'A-Z', sortParam: { title: 1 }, doCollate: true, type: 'title' },
  sortOptions: {
    title: [
      { sortParam: null, icon: '' },
      { name: 'A-Z', sortParam: { title: 1 }, doCollate: true, icon: "fas fa-sort-alpha-down sort-icon", type: 'title' },
      { name: 'Z-A', sortParam: { title: -1 }, doCollate: true, icon: "fas fa-sort-alpha-up sort-icon", type: 'title' },
    ],
    createDate: [
      { sortParam: null, icon: '' },
      { id: 3, name: 'Newest', sortParam: { createDate: -1 }, doCollate: false, icon: "fas fa-arrow-down sort-icon", type: 'date' },
      { id: 4, name: 'Oldest', sortParam: { createDate: 1 }, doCollate: false, icon: "fas fa-arrow-up sort-icon", type: 'date' }
    ]
  },
  privacySettingOptions: [
    { id: 1, label: 'All', value: ['M', 'O', 'E'], isChecked: true, icon: 'fas fa-list' },
    { id: 2, label: 'Public', value: ['O', 'E'], isChecked: false, icon: 'fas fa-globe-americas' },
    { id: 3, label: 'Private', value: ['M'], isChecked: false, icon: 'fas fa-unlock' },
  ],
  adminFilterSelect: {
    defaultValue: ['organization'],
    options: [
      { label: 'organization' },
      { label: 'creator' },
      // { label: 'author'}
    ]
  },
  statusOptions: [
    { name: 'status', value: 'approved', fill: '#35A853', text: 'Approved', isChecked: true },
    { name: 'status', value: 'pending', fill: '#FFD204', text: 'Pending', isChecked: true },
    { name: 'status', value: 'flagged', fill: '#EB5757', text: 'Flagged', isChecked: true, teacherHide: true },
  ],
  moreMenuOptions: [
    { label: 'Edit', value: 'edit', action: 'editProblem', icon: 'far fa-edit' },
    { label: 'Assign', value: 'assign', action: 'assignProblem', icon: 'fas fa-list-ul' },
    // {label: 'Recommend', value: 'recommend', action: 'recommendedProblem', icon: 'fas fa-star'},
    { label: 'Pending', value: 'pending', action: 'makePending', icon: 'far fa-clock', adminOnly: true },
    { label: 'Report', value: 'flag', action: 'reportProblem', icon: 'fas fa-exclamation-circle' },
    { label: 'Delete', value: 'delete', action: 'deleteProblem', icon: 'fas fa-trash' },
  ],
  statusFilter: ['approved', 'pending', 'flagged'],

  primaryFilterValue: Ember.computed.alias('primaryFilter.value'),
  doUseSearchQuery: Ember.computed.or('isSearchingProblems', 'isDisplayingSearchResults'),
  selectedPrivacySetting: ['M', 'O', 'E'],
  doIncludeSubCategories: true,
  adminFilter: Ember.computed.alias('filter.primaryFilters.inputs.all'),
  alert: Ember.inject.service('sweet-alert'),

  listResultsMessage: function () {
    let msg;
    let userOrgName = this.get('userOrgName');
    if (this.get('isFetchingProblems')) {
      if (this.get('showLoadingMessage')) {
        msg = 'Loading results... Thank you for your patience.';

      } else {
        msg = '';
      }
      return msg;
    }
    if (this.get('criteriaTooExclusive')) {
      msg = 'No results found. Please try expanding your filter criteria.';
      return msg;
    }
    if (this.get('areNoRecommendedProblems')) {
      msg = `There are currently no recommended problems for ${userOrgName}.`;
      return msg;
    }
    if (this.get('isDisplayingSearchResults')) {
      let countDescriptor = 'problems';
      let verb;
      let criterion = this.get('searchCriterion');
      if (criterion === 'general') {
        verb = 'contain';
      } else {
        verb = 'contains';
      }
      let total = this.get('problemsMetadata.total');
      if (total === 1) {
        countDescriptor = 'problem';
        if (criterion === 'general') {
          verb = 'contains';
        }

      }
      let typeDescription = `whose ${criterion} ${verb}`;
      if (this.get('searchCriterion') === 'general') {
        typeDescription = `that ${verb}`;
      }
      msg = `Based off your filter criteria, we found ${this.get('problemsMetadata.total')} ${countDescriptor} ${typeDescription} "${this.get('searchQuery')}"`;
      return msg;
    }

    msg = `${this.get('problemsMetadata.total')} problems found`;

    let toggleTrashed = this.get('toggleTrashed');

    if (toggleTrashed) {
      msg = `${msg} - <strong>Displaying Trashed Problems</strong>`;
    }
    return msg;

  }.property('criteriaTooExclusive', 'areNoRecommendedProblems', 'isDisplayingSearchResults', 'problems.@each.isTrashed', 'isFetchingProblems', 'showLoadingMessage'),


  privacySettingFilter: function () {
    return {
      $in: this.get('selectedPrivacySetting')
    };
  }.property('selectedPrivacySetting'),

  observeCategoryFilter: function () {
    this.set('categoriesFilter', this.get('selectedCategories'));
    this.send('triggerFetch');
  }.observes('categoriesFilter.[]'),

  init: function () {
    this.getUserOrg()
      .then((name) => {
        this.set('userOrgName', name);
        this.configureFilter();
        this.configurePrimaryFilter();
        this.set('categoriesFilter', this.get('selectedCategories'));
      });
    this._super(...arguments);
  },

  getUserOrg() {
    return this.get('currentUser.organization').then((org) => {
      if (org) {
        return org.get('name');
      } else {
        this.get('alert').showModal('warning', 'You currently do not belong to any organization', 'Please add or request an organization in order to get the best user experience', 'Ok');
        return 'undefined';
      }
    });
  },

  statusOptionsList: function () {
    let statusOptions = this.get('statusOptions');
    let isTeacher = this.get('currentUser.isTeacher');

    if (isTeacher) {
      statusOptions = _.filter(statusOptions, (option) => {
        return !option.teacherHide;
      });
    }

    return statusOptions;
  }.property('problem.status'),

  didInsertElement() {
    let width = this.$().css('width');
    let widthNum = parseInt(width, 10);
    if (widthNum <= 430) {
      this.send('setGrid');
    }

    let doHideOutlet = this.get('doHideOutlet');
    if (_.isUndefined(doHideOutlet)) {
      this.set('doHideOutlet', this.get('model.hideOutlet'));

    }
    if (this.get('doHideOutlet') === false) {
      this.$('#outlet').removeClass('hidden');
    }
    this._super(...arguments);
  },


  didReceiveAttrs: function () {
    let attributes = ['problems', 'sections', 'organizations'];

    for (let attr of attributes) {
      let prop = this.get(attr);
      let modelAttr = this.model[attr];
      if (!Ember.isEqual(prop, modelAttr)) {
        this.set(attr, modelAttr);
        let metaPropName = `${attr}Metadata`;
        let meta = modelAttr.get('meta');
        if (meta) {
          this.set(metaPropName, meta);
        }
      }
    }
  },

  configureFilter: function () {
    let currentUserOrgName = this.get('userOrgName');

    let filter = {
      primaryFilters:
      {
        selectedValue: "mine",
        inputs: {
          mine: {
            label: "Mine", value: "mine", isChecked: true, icon: "fas fa-user"
          },
          myOrg: {
            label: "My Org",
            value: "myOrg",
            isChecked: false,
            icon: "fas fa-university",
            secondaryFilters: {
              selectedValues: ["recommended", "fromOrg"],
              inputs: {
                recommended: {
                  label: "Recommended",
                  value: "recommended",
                  isChecked: true,
                  isApplied: true,
                  icon: "fas fa-star"
                },
                fromOrg: {
                  label: `Created by ${currentUserOrgName} Members`,
                  value: "fromOrg",
                  isChecked: true,
                  isApplied: true,
                  icon: "fas fa-users"
                }
              }
            }
          },
          everyone: {
            label: "Public",
            value: "everyone",
            isChecked: false,
            icon: "fas fa-globe-americas",
          }
        }
      }
    };
    let isAdmin = this.get('currentUser.isAdmin');

    if (isAdmin) {
      filter.primaryFilters.inputs.mine.isChecked = false;
      filter.primaryFilters.inputs.all = {
        label: 'All',
        value: 'all',
        icon: "fas fa-infinity",
        isChecked: true,
        secondaryFilters: {
          selectedValue: 'org',
          initialItems: ['org'],
          inputs: {
            org: {
              label: "Organization",
              value: "org",
              selectedValues: [],
              subFilters: {
                selectedValues: ["recommended", "fromOrg"],
                inputs: {
                  recommended: {
                    label: "Recommended",
                    value: "recommended",
                    isChecked: true,
                    isApplied: true,
                    icon: "fas fa-star"
                  },
                  fromOrg: {
                    label: `Created by Members`,
                    value: "fromOrg",
                    isChecked: true,
                    isApplied: true,
                    icon: "fas fa-users"
                  }
                }
              }
            },
            creator: {
              label: "Creator",
              value: "creator",
              selectedValues: []
            },
            // author: {
            //   label: "Author",
            //   value: "author",
            //   selectedValues: []
            // },
            pows: {
              label: "PoWs",
              value: "pows",
              selectedValues: ['shared', 'unshared'],
              secondaryFilters: {
                selectedValues: ['shared', 'unshared'],
                inputs: {
                  unshared: {
                    label: "Private",
                    value: "unshared",
                    isChecked: true,
                    isApplied: true,
                    icon: 'fas fa-unlock',
                  },
                  shared: {
                    label: "Public",
                    value: "shared",
                    isChecked: true,
                    isApplied: true,
                    icon: 'fas fa-globe-americas',
                  }
                }
              }
            }
          }
        }
      };
    }
    this.set('filter', filter);
  },
  configurePrimaryFilter() {
    let primaryFilters = this.get('filter.primaryFilters');
    if (this.get('currentUser.isAdmin')) {
      primaryFilters.selectedValue = 'all';
      this.set('primaryFilter', primaryFilters.inputs.all);
      return;
    }
    this.set('primaryFilter', primaryFilters.inputs.mine);
  },
  buildMineFilter() {
    let filter = {};
    let userId = this.get('currentUser.id');

    filter.createdBy = userId;

    return filter;
  },
  buildPublicFilter() {
    let filter = {};

    filter.privacySetting = 'E';

    return filter;
  },

  buildMyOrgFilter() {
    let filter = {};

    // 2 options : recommended, fromOrg
    let secondaryValues = this.get('primaryFilter.secondaryFilters.selectedValues');

    let includeRecommended = _.indexOf(secondaryValues, 'recommended') !== -1;
    let includeFromOrg = _.indexOf(secondaryValues, 'fromOrg') !== -1;

    // immediately return 0 results
    if (!includeRecommended && !includeFromOrg) {
      this.set('criteriaTooExclusive', true);
      return;
    }

    filter.$or = [];

    if (includeRecommended) {
      let recommendedProblems = this.get('currentUser.organization.recommendedProblems') || [];
      let ids = recommendedProblems.mapBy('id');

      if (!_.isEmpty(ids)) {
        filter.$or.push({ _id: { $in: ids } });
      } else {
        if (!includeFromOrg) {
          // rec only request, but no recs; immediately return nothing;
          this.set('areNoRecommendedProblems', true);
          this.set('problems', []);
          this.set('problemsMetadata', null);
          return;
        }
      }
    }

    if (includeFromOrg) {
      filter.$or.push({ organization: this.get('currentUser.organization.id') });
    }

    return filter;
  },
  // eslint-disable-next-line complexity
  buildAllFilter() {
    let filter = {};
    let adminFilter = this.get('adminFilter');
    let currentVal = adminFilter.secondaryFilters.selectedValue;
    let selectedValues = adminFilter.secondaryFilters.inputs[currentVal].selectedValues;

    let isEmpty = _.isEmpty(selectedValues);

    // if empty, do nothing - means include all orgs
    if (currentVal === 'org') {
      // no org selected yet, so no filter applied yet
      if (isEmpty) {
        return {};
      }



      // recommended, fromOrg
      let secondaryValues = this.get('adminFilter.secondaryFilters.inputs.org.subFilters.selectedValues');

      let includeRecommended = _.indexOf(secondaryValues, 'recommended') !== -1;
      let includeFromOrg = _.indexOf(secondaryValues, 'fromOrg') !== -1;

      // immediately return 0 results
      if (!includeRecommended && !includeFromOrg) {
        this.set('criteriaTooExclusive', true);
        return;
      }
      filter.all = {};
      filter.all.org = {};

      //fromOrg only
      if (includeFromOrg && !includeRecommended) {
        filter.all.org.organizations = selectedValues;
      }
      // recommendedOnly
      if (includeRecommended && !includeFromOrg) {
        filter.all.org.recommended = selectedValues;
      }

      if (includeRecommended && includeFromOrg) {
        filter.all.org.organizations = selectedValues;
        filter.all.org.recommended = selectedValues;
      }
    }

    if (currentVal === 'creator') {
      if (!isEmpty) {
        filter.createdBy = { $in: selectedValues };
      }
    }

    if (currentVal === 'author') {
      if (!isEmpty) {
        filter.author = { $in: selectedValues };
      }
    }
    if (currentVal === 'pows') {
      // public box is checked
      let doShared = _.indexOf(selectedValues, 'shared') !== -1;

      // private box is checked
      let doUnshared = _.indexOf(selectedValues, 'unshared') !== -1;

      if (doShared && doUnshared) {
        filter.pows = "all";
      }

      if (_.isEmpty(selectedValues)) {
        // should this immediately return no results?
        this.set('criteriaTooExclusive', true);
        return;
        // filter.pows="none";

      }
      if (doShared && !doUnshared) {
        filter.pows = "publicOnly";
      }
      if (!doShared && doUnshared) {
        filter.pows = "privateOnly";
      }

      // otherwise both checked, no restrictions
      // should this only show PoWs problems? currently showing all
    }

    return filter;
  },

  buildPrivacySettingFilter: function () {
    //privacy setting determined from privacy drop down on main display
    let privacySetting = this.get('privacySettingFilter');
    return {
      $in: privacySetting
    };
  },

  buildSortBy: function () {
    if (this.get('searchByRelevance')) {
      return {
        sortParam: {
          score: { $meta: "textScore" }
        },
        doCollate: false,
        byRelevance: true
      };
    }

    let criterion = this.get('sortCriterion');
    if (!criterion) {
      return { title: 1, doCollate: true };
    }
    let { sortParam, doCollate } = criterion;
    return {
      sortParam,
      doCollate
    };
  },

  buildSearchBy: function () {
    let criterion = this.get('searchCriterion');
    let query = this.get('searchQuery');
    return {
      criterion,
      query
    };
  },

  buildFilterBy: function () {
    let primaryFilterValue = this.get('primaryFilterValue');
    let filterBy;

    if (primaryFilterValue === 'mine') {
      filterBy = this.buildMineFilter();
    }

    if (primaryFilterValue === 'everyone') {
      filterBy = this.buildPublicFilter();
    }

    if (primaryFilterValue === 'myOrg') {
      filterBy = this.buildMyOrgFilter();
    }

    if (primaryFilterValue === 'all') {
      filterBy = this.buildAllFilter();
    }
    if (_.isUndefined(filterBy) || _.isNull(filterBy)) {
      filterBy = {};
    }
    // primary public filter should disable privacy setting dropdown?
    if (primaryFilterValue === 'everyone') {
      filterBy.privacySetting = { $in: ['E'] };
    } else {
      let privacySetting = this.get('privacySettingFilter');
      filterBy.privacySetting = privacySetting;
    }
    let categoriesFilter = this.get('categoriesFilter');

    if (!_.isEmpty(categoriesFilter)) {
      let filterType = 'or';
      let includeSubCats = this.get('doIncludeSubCategories');
      let ids = categoriesFilter.mapBy('id');
      filterBy.categories = {};

      if (filterType === 'or') {
        filterBy.categories.ids = ids;
        filterBy.categories.includeSubCats = includeSubCats;
      } else if (filterType === 'and') {
        // todo and filter
      }
    }

    let statusFilter = this.get('statusFilter');
    if (!_.isEmpty(statusFilter)) {
      filterBy.status = { $in: statusFilter };
    } else {
      this.set('criteriaTooExclusive', true);
      return;
    }
    return filterBy;
  },

  displayProblems: function () {
    let problems = this.get('problems');
    if (problems) {
      if (this.get('toggleTrashed')) {
        return problems;
      } else {
        return problems.rejectBy('isTrashed');
      }
    }
  }.property('problems.@each.isTrashed', 'toggleTrashed'),

  buildQueryParams: function (page, isTrashedOnly) {
    let params = {};
    if (page) {
      params.page = page;
    }
    if (isTrashedOnly) {
      params.isTrashedOnly = true;
      return params;
    }
    let sortBy = this.buildSortBy();
    let filterBy = this.buildFilterBy();

    if (this.get('criteriaTooExclusive' || this.get('areNoRecommendedProblems'))) {
      // display message or just 0 results
      this.set('problems', []);
      this.set('problemsMetadata', null);
      this.set('isFetchingProblems', false);
      return;
    }
    params = {
      sortBy,
      filterBy
    };

    if (page) {
      params.page = page;
    }

    if (this.get('doUseSearchQuery')) {
      let searchBy = this.buildSearchBy();
      params.searchBy = searchBy;
    }
    return params;
  },
  handleLoadingMessage: function () {
    const that = this;
    if (!this.get('isFetchingProblems')) {
      this.set('showLoadingMessage', false);
      return;
    }
    Ember.run.later(function () {
      if (that.isDestroyed || that.isDestroying || !that.get('isFetchingProblems')) {
        return;
      }
      that.set('showLoadingMessage', true);
    }, 300);
  }.observes('isFetchingProblems'),

  getProblems: function (page, isTrashedOnly = false) {
    this.set('isFetchingProblems', true);
    let queryParams = this.buildQueryParams(page, isTrashedOnly);

    if (this.get('criteriaTooExclusive') || this.get('areNoRecommendedProblems')) {
      if (this.get('isFetchingProblems')) {
        this.set('isFetchingProblems', false);
      }
      return;
    }

    this.store.query('problem',
      queryParams
    ).then((results) => {
      this.removeMessages('problemLoadErrors');
      this.set('problems', results);
      this.set('problemsMetadata', results.get('meta'));
      this.set('isFetchingProblems', false);


      let isSearching = this.get('isSearchingProblems');

      if (isSearching) {
        this.set('isDisplayingSearchResults', true);
        this.set('isSearchingProblems', false);
      }

      if (this.get('searchByRelevance')) {
        this.set('searchByRelevance', false);
      }

      if (this.get('isChangingPage')) {
        this.set('isChangingPage', false);
      }
    }).catch((err) => {
      this.handleErrors(err, 'problemLoadErrors');
      this.set('isFetchingProblems', false);

    });
  },

  actions: {
    clearSearchResults: function () {
      this.set('searchQuery', null);
      this.set('searchInputValue', null);
      this.set('isDisplayingSearchResults', false);
      this.send('triggerFetch');
    },
    updatePageResults(results) {
      this.set('problems', results);
    },
    refreshList() {
      let isTrashedOnly = this.get('toggleTrashed');
      // $('.refresh-icon').addClass('fa-spin');
      // Ember.run.later(() => {
      //   $('.refresh-icon').removeClass('fa-spin');
      // }, 2000);
      this.getProblems(null, isTrashedOnly);
    },
    searchProblems(val, criterion) {
      if (criterion === 'general' || criterion === 'category') {
        this.set('searchByRelevance', true);
      }
      this.set('searchQuery', val);
      this.set('searchCriterion', criterion);
      this.set('isSearchingProblems', true);
      this.send('triggerFetch');
    },
    initiatePageChange: function (page) {
      this.set('isChangingPage', true);
      let isTrashedOnly = this.get('toggleTrashed');
      this.getProblems(page, isTrashedOnly);
    },
    addCategory: function (cat) {
      let filterCategories = this.get('filter.categories');
      filterCategories.addObject(cat);
    },
    removeCategory: function (cat) {
      let filterCategories = this.get('filter.categories');
      filterCategories.removeObject(cat);
    },
    updateFilter: function (id, checked) {
      let filter = this.get('filter');
      let keys = Object.keys(filter);
      if (!keys.includes(id)) {
        return;
      }
      filter[id] = checked;
      this.send('triggerFetch');
    },
    updateSortCriterion(criterion) {
      this.set('sortCriterion', criterion);
      this.send('triggerFetch');
    },
    triggerFetch(isTrashedOnly = false) {
      for (let prop of ['criteriaTooExclusive', 'areNoRecommendedProblems']) {
        if (this.get(prop)) {
          this.set(prop, null);
        }
      }
      this.getProblems(null, isTrashedOnly);
    },
    triggerShowTrashed() {
      this.send('triggerFetch', this.get('toggleTrashed'));
    },
    sendtoApplication(categories) {
      this.sendAction('sendtoApplication', categories);
    },
    setGrid: function () {
      $('#layout-view').addClass('grid-view');
      this.set('showGrid', true);
      this.set('showList', false);
    },
    setList: function () {
      $('#layout-view').removeClass('grid-view');
      this.set('showList', true);
      this.set('showGrid', false);
    },
    updatePrivacySetting(val) {
      if (!val) {
        return;
      }
      this.set('selectedPrivacySetting', val);
      this.send('triggerFetch');
    },
    toggleMenu: function () {
      $('#filter-list-side').toggleClass('collapse');
      $('#arrow-icon').toggleClass('fa-rotate-180');
      $('#filter-list-side').addClass('animated slideInLeft');
    },

    updateStatusFilter: function (status) {
      let allowedValues = ['approved', 'pending', 'flagged'];
      if (!_.contains(allowedValues, status)) {
        return;
      }
      let statusFilter = this.get('statusFilter');

      if (_.contains(statusFilter, status)) {
        statusFilter.removeObject(status);
      } else {
        statusFilter.addObject(status);
      }
      this.send('triggerFetch');

    },
    toProblemInfo(problem) {
      this.sendAction('toProblemInfo', problem);
      this.$('#outlet').removeClass('hidden');
    }
  }
});