import $ from 'jquery';
import Route from '@ember/routing/route';






export default Route.extend({

  beforeModel: function () {
    return $.get('/auth/logout'
    )
      .then(() => {
        window.location.href = '/';
      });

  }

});
