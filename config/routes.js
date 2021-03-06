/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  'post /register': 'auth.register',
  'post /login': 'auth.login',

  'get /users': 'users.get-users',
  'delete /users/:key': 'users.delete-user',

  'put /me/edit': 'me.edit',

  'post /friends/add': 'friends.add-friend',
  'post /friends/remove': 'friends.remove-friend',
};
