/*global _:false */
Encompass.SelectizeInputMixin = Ember.Mixin.create({
  // Component must have access to store to use this mixin
  // Or should store be injected here to be safe?

  actions: {
    updateSelectizeSingle(val, $item, propToUpdate, model) {
      // val is the value of the selected item
      // propToUpdate is string name of property to set
      // model is string used to look up in store, i.e. Problem
      let isRemoval = _.isNull($item);

      if (isRemoval) {
        this.set(propToUpdate, null);
        return;
      }

      let record = this.get('store').peekRecord(model, val);
      if (!record) {
        // for item to be selected in selectize dropdown
        // it must be in the store
        return;
      }
      this.set(propToUpdate, record);
    },

  }
});