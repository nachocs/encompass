import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';


export default DS.Model.extend(Auditable, {
  identifier: DS.attr('string'),
  description: DS.attr('string'),
  url: DS.attr('string'),
});
