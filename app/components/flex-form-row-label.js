Encompass.FlexFormRowLabelComponent = Ember.Component.extend({
  classNames: ['input-label'],
  tagName: 'p',

  defaultIconClass: 'fas fa-info-circle',
  defaultSimptipValues: {
    position: 'right',
    numLines: 'multiline',
    appearance: 'smooth'
  },

  tooltipOptions: Ember.computed.alias('options.tooltip'),

  didReceiveAttrs() {
    let simptipPosition =
      this.get('tooltipOptions.simptipPosition') || this.get('defaultSimptipValues.position');
    let simptipLines =
      this.get('tooltipOptions.simptipLines') || this.get('defaultSimptipValues.numLines');
    let simptipAppearance =
      this.get('tooltipOptions.simptipAppearance') ||
      this.get('defaultSimptipValues.appearance');

    let simptipClass = this.getSimtipClassFromValues(
      simptipPosition,
      simptipLines,
      simptipAppearance
    );

    this.set('tooltipClass', `info-text-tip ${simptipClass}`);

    let iconClass = this.get('iconClass') || this.get('defaultIconClass');

    let fullIconClass = `${iconClass} info-icon`;
    this.set('fullIconClass', fullIconClass);
  },

  getSimtipClassFromValues(position, numLines, appearance) {
    return `simptip-position-${position} simptip-${numLines} simptip-${appearance}`;
  },


});
