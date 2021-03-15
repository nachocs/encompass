/**
  * # Workspace Submissions Route
  * @description This route resolves the submissions for the workspace
  * @author Amir Tahvildaran <amir@mathforum.org>
  * @since 1.0.1
  */

// Is this route necessary?
// workspace submissions are being sideloaded when workspace is fetched
import Ember from 'ember';






export default Ember.Route.extend({
  model() {
    let workspace = this.modelFor('workspace');

    let submissions = workspace.hasMany('submissions').value();
    if (submissions !== null) {
      return submissions;
    }
    return workspace.get('submissions');
  }
});
