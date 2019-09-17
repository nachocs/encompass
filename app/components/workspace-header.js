Encompass.WorkspaceHeaderComponent = Ember.Component.extend(
  Encompass.CurrentUserMixin,
  Encompass.ErrorHandlingMixin,
  {
    elementId: "workspace-header",
    classNames: ["workspace-flex-item"],
    classNameBindings: ["isHidden:hidden"],
    actions: {
      hideHeader() {
        this.get("hideHeader")();
      },
      startTour() {
        this.get("startTour")();
      },
      doneTour() {
        this.get("doneTour")();
      }
    }
  }
);
