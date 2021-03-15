import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';


export default DS.Model.extend(Auditable, {
  pdSetName: DS.attr('string'),
  folderSetName: DS.attr('string'),
  result: DS.belongsTo('workspace')
});
