## Module Report
### Unknown Global

**Global**: `Ember.Copyable`

**Location**: `app/models/tagging.js` at line 11

```js


export default DS.Model.extend(Ember.Copyable, Auditable, {
  workspace: DS.belongsTo('workspace', { async: false }),
  selection: DS.belongsTo('selection'),
```
