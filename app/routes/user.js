import AuthenticatedRoute from './_authenticated_route';

export default class UserRoute extends AuthenticatedRoute {
  model(params) {
    let usernameLower =
      typeof params.username === 'string' ? params.username.toLowerCase() : '';
    let user = this.store.queryRecord('user', {
      username: usernameLower,
    });
    //filter by params id
    return user;
  }
}
