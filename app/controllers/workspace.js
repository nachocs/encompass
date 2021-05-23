import { computed } from '@ember/object';
/**
 * # Workspace Controller
 * @description This controller for the workspace assists in linking between submissions
 * @todo Linking between submissions should really be moved to workspace_submissions_index_controller
 * @author Amir Tahvildaran <amir@mathforum.org>, Damola Mabogunje <damola@mathforum.org>
 * @since 1.0.0
 */
import Controller, { inject as controller } from '@ember/controller';
import CurrentUserMixin from "../mixins/current_user_mixin";

export default Controller.extend(CurrentUserMixin, {
  comments: controller(),

  currentSelection: null, //ENC-397, ENC-398

  showOverlay: computed("makingSelection", "taggingSelection", function () {
    return this.makingSelection || this.taggingSelection;
  }),

  actions: {
    popupMaskClicked: function () {
      this.transitionToRoute(
        "workspace.submission",
        this.currentSubmission
      );
    },
    tagSelection: function (selection, tags) {},
  },
});
