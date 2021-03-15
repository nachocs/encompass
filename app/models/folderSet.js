import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';


export default DS.Model.extend(Auditable, {
  name: DS.attr('string'),
  privacySetting: DS.attr('string'),
  folders: DS.attr()
});
