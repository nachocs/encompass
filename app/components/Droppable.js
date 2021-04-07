import Mixin from '@ember/object/mixin';
import { App as Encompass } from '../app';
import './DragNDrop';






Encompass.DragNDrop.Droppable = Mixin.create({
  dragEnter: Encompass.DragNDrop.cancel,
  dragOver: Encompass.DragNDrop.cancel,
  drop: function (event) {
    event.preventDefault();
    return false;
  }
});
