Encompass.Answer = DS.Model.extend(Encompass.Auditable, {
  answerId: Ember.computed.alias('id'),
  studentName: DS.attr('string'),
  problem: DS.belongsTo('problem'),
  answer: DS.attr('string'),
  explanation: DS.attr('string'),
  explanationImage: DS.belongsTo('image', { inverse: null }),
  section: DS.belongsTo('section'),
  isSubmitted: DS.attr('boolean'),
  students: DS.hasMany('users', { inverse: null }),
  priorAnswer: DS.belongsTo('answer'),
  assignment: DS.belongsTo('assignment', { async: true }),
  additionalImage: DS.belongsTo('image', { inverse: null }),
});
