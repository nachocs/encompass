import Namespace from '@ember/application/namespace';
import { App as Encompass } from '../app';






export default Namespace.create();


Encompass.DragNDrop.cancel = function (event) {
  event.preventDefault();
  return false;
};
