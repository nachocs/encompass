import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';

export default DS.Model.extend(Auditable, {
  imageId: alias('id'),
  encoding: DS.attr('string'),
  mimetype: DS.attr('string'),
  imageData: DS.attr('string'),
  sourceUrl: DS.attr('string'),
  originalname: DS.attr('string'),
  pdfPageNum: DS.attr('number'),

  pdfFileDisplay: computed('pdfPageNum', function () {}),

  fileNameDisplay: computed('originalname', 'pdfPageNum', function () {
    let num = this.pdfPageNum;
    if (typeof num === 'number') {
      return `${this.originalname} (pg. ${num})`;
    }

    return this.originalname;
  }),
});
