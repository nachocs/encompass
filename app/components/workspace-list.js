import Ember from 'ember';
import CurrentUserMixin from '../mixins/current_user_mixin';






export default Ember.Component.extend(CurrentUserMixin, {
  elementId: 'workspace-list',

  actions: {
    toCopyWorkspace(workspace) {
      this.get("toCopyWorkspace")(workspace);
    }
  }

});