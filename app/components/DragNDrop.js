import Ember from 'ember';
import { App as Encompass } from '../app';






export default Ember.Namespace.create();


Encompass.DragNDrop.cancel = function (event) {
  event.preventDefault();
  return false;
};
