import Ember from 'ember';
import { App as Encompass } from '../app';
import './DragNDrop';






Encompass.DragNDrop.Droppable = Ember.Mixin.create({
  dragEnter: Encompass.DragNDrop.cancel,
  dragOver: Encompass.DragNDrop.cancel,
  drop: function (event) {
    event.preventDefault();
    return false;
  }
});
