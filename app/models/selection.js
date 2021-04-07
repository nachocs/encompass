import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';

export default DS.Model.extend(Auditable, {
  selectionId: alias('id'),
  text: DS.attr('string'),
  coordinates: DS.attr('string'),
  taggings: DS.hasMany('tagging', { async: true }),
  comments: DS.hasMany('comment', { async: true }),
  submission: DS.belongsTo('submission', { async: true }),
  workspace: DS.belongsTo('workspace', { async: false }),
  relativeCoords: DS.attr(),
  relativeSize: DS.attr(),
  folders: computed('taggings.@each.isTrashed', 'taggings.[]', function () {
    return this.taggings
      .filterBy('isTrashed', false)
      .getEach('folder')
      .toArray();
  }),
  link: computed('workspace', 'submission', 'id', function () {
    return (
      '#/workspaces/' +
      this.get('workspace.id') +
      '/submissions/' +
      this.get('submission.id') +
      '/selections/' +
      this.id
    );
    //https://github.com/emberjs/ember.js/pull/4718
    //ENC-526
  }),
  imageSrc: DS.attr('string'),
  imageTagLink: DS.attr('string'),
  vmtInfo: DS.attr(''),
  originalSelection: DS.belongsTo('selection', { inverse: null }),
});
