import Model, { attr } from '@ember-data/model';
import Auditable from '../models/_auditable_mixin';


export default Model.extend(Auditable, {
  name: attr('string'),
  privacySetting: attr('string'),
  folders: attr()
});
