Encompass.WorkspaceHeaderComponent = Ember.Component.extend(
  Encompass.CurrentUserMixin,
  Encompass.ErrorHandlingMixin,
  {
    elementId: "workspace-header",
    classNames: ["workspace-flex-item"],
    classNameBindings: ["isHidden:hidden"],
    alert: Ember.inject.service("sweet-alert"),
    utils: Ember.inject.service("utility-methods"),
    weighting: 1,
    sortProperties: ["weight", "name"],
    createRecordErrors: [],
    updateRecordErrors: [],
    permissions: Ember.inject.service("workspace-permissions"),
    actions: {
      hideHeader() {
        this.get("hideHeader")();
      }
    }
  }
);
