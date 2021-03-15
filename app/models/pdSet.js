
import DS from 'ember-data';

export default DS.Model.extend({
  count: DS.attr('number'),
  label: function () {
    return this.get('id') + ' (' + this.get('count') + ' submissions)';
  }.property('count')
});
