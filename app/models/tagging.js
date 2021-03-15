import Ember from 'ember';
import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';







export default DS.Model.extend(Ember.Copyable, Auditable, {
  workspace: DS.belongsTo('workspace', { async: false }),
  selection: DS.belongsTo('selection'),
  folder: DS.belongsTo('folder'),
  originalTagging: DS.belongsTo('tagging', { inverse: null }),

  copy: function (deep) {
    var clone = this.toJSON();

    delete clone.id;
    return this.store.createRecord('tagging', clone).save();
  }
});
