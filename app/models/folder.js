import { computed } from '@ember/object';
import { sort } from '@ember/object/computed';
import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';

export default DS.Model.extend(Auditable, {
  name: DS.attr('string'),
  weight: DS.attr('number'),
  taggings: DS.hasMany('tagging', { async: true }),
  parent: DS.belongsTo('folder', { inverse: 'children', async: true }),
  children: DS.hasMany('folder', { inverse: 'parent', async: true }),
  workspace: DS.belongsTo('workspace', { async: true }),
  isTopLevel: DS.attr('boolean'),
  isExpanded: false,
  sortProperties: ['weight', 'name'],

  cleanTaggings: computed('taggings.content.@each.isTrashed', function () {
    return this.get('taggings.content').rejectBy('isTrashed');
  }),

  taggedSelections: computed('cleanTaggings.[]', function () {
    return this.cleanTaggings.mapBy('selection.content').compact();
  }),

  cleanSelections: computed('taggedSelections.@each.isTrashed', function () {
    return this.taggedSelections.rejectBy('isTrashed');
  }),

  cleanChildren: computed('children.content.@each.isTrashed', function () {
    return this.get('children.content').rejectBy('isTrashed');
  }),

  hasChildren: computed('cleanChildren.[]', function () {
    return this.get('cleanChildren.length') > 0;
  }),

  childSelections: computed(
    'children.@each._selections',
    'cleanSelections.[]',
    function () {
      let selections = this.cleanSelections;

      let results = [];

      results.addObjects(selections);

      let children = this.cleanChildren;

      if (this.hasChildren) {
        children.getEach('_selections').forEach(function (childSelections) {
          results.pushObjects(childSelections);
        });
      }
      return results.uniqBy('id');
    }
  ),

  _selections: computed('childSelections.@each.isTrashed', function () {
    return this.childSelections;
  }),

  submissions: computed('cleanSelections.@each.submission', function () {
    let results = this.cleanSelections;
    let submissions = results.mapBy('submission.content');
    let clean = submissions.compact();
    return clean.uniqBy('id');
  }),

  _submissions: computed(
    'cleanChildren.[]',
    'submissions.[]',
    'children.@each._submissions',
    function () {
      let submissions = this.submissions;

      let results = [];
      results.addObjects(submissions);

      this.cleanChildren
        .getEach('_submissions')
        .forEach(function (childSubmissions) {
          results.pushObjects(childSubmissions);
        });

      return results.uniqBy('id');
    }
  ),

  hasSelection: function (selectionId) {
    return this.cleanSelections.find((sel) => {
      return sel.get('id') === selectionId;
    });
  },

  sortedChildren: sort('cleanChildren', 'sortProperties'),
  originalFolder: DS.belongsTo('folder', { inverse: null }),
});
