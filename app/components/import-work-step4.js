/*global _:false */
Encompass.ImportWorkStep4Component = Ember.Component.extend(Encompass.CurrentUserMixin, {
  elementId: 'import-work-step4',

  actions: {
    next() {
      const uploadedFiles = this.get('uploadedFiles');
      if (uploadedFiles.length >= 1) {
        this.get('onProceed')();
        return;
      }
      this.set('missingFiles', true);

    },
    back() {
      this.get('onBack')(-1);
    }
  }
});