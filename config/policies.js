/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  '*': 'is-logged-in',

  // must be an admin too
  'users/delete-user': ['is-logged-in', 'is-admin'],
  'users/get-users': ['is-logged-in', 'is-admin'], 

  // bypass 'is-logged-in' for the following:
  'auth/*': true,

};
