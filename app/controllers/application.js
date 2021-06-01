/**
 * # Application Controller
 * @description The controller for the application. Right now, we use this primarily for keeping track of the current user
 * @authors Damola Mabogunje <damola@mathforum.org>, Amir Tahvildaran <amir@mathforum.org>
 * @since 1.0.0
 */
import Controller from '@ember/controller';
import { computed, action } from '@ember/object';

export default class ApplicationController extends Controller {
  showCategoryList = false;
  isHidden = false;
  selectedCategories = [];
  isTouchScreen = false;

  currentUser = computed('model', function () {
    console.log('application.js');
    return this.model;
  });

  // resizeDisplay: function() {
  //   Ember.run.next(this, Ember.verticalSizing);
  // }.observes('isSmallHeader'),
  @action
  toHome() {
    window.location.href = '/';
  }
  @action
  closeModal() {
    this.showCategoryList = false;
  }
  @action
  searchCategory(cat) {
    this.selectedCategories.pushObject(cat);
  }
  @action
  handleFirstTouch() {
    this.isTouchScreen = true;
  }
}
