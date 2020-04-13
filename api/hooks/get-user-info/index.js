/**
 * get-user-info hook
 *
 * @description :: This hook runs before each route, checking if there's a token in the 'Authorization' header,
 * if a token exists, then verify the token using 'jsonwebtoken' library; if the token is valid then proceeds to fetch the user data from the db.
 * if a token doesn't exist, proceeds normally.
 *
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function defineGetUserInfoHook(sails) {
  return {
    /**
     * Runs when this Sails app loads/lifts.
     */
    initialize: async function () {
      /**
       * Nothing to do on initialization
       */
      sails.log.info('Initializing custom hook (`get-user-info`)');
    },

    routes: {
      /**
       * Runs before every matching route.
       *
       * @param {Ref} req
       * @param {Ref} res
       * @param {Function} next
       */
      before: {
        '/*': {
          fn: async function (req, res, next) {
            await sails.helpers.auth.verifyJwt(req);
            return next();
          },
        },
      },
    },
  };
};
