import Service from '@ember/service';

export default class CurrentUserService extends Service {
  user = {};

  setUser = function (data) {
    this.user.set(data);
  };
}
