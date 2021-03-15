import Ember from "ember";
import CurrentUserMixin from "../mixins/current_user_mixin";

export default Ember.Controller.extend(CurrentUserMixin, {
  isCompDirty: false,
  confirmLeaving: false,

  actions: {
    doConfirmLeaving: function (value) {
      this.set("confirmLeaving", value);
    },
  },
});
