/**
 * get-user-info hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function defineGetUserInfoHook(sails) {
  return {
    /**
     * Runs when this Sails app loads/lifts.
     */
    initialize: async function() {
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
          fn: async function(req, res, next) {
            // checking if user is logged in
            if (req.session.userId) {
              const db = sails.config.db.instance();
              const aql = sails.config.db.aql;
              const cursor = await db.query(aql`
                FOR doc IN Users
                FILTER doc._id == ${req.session.userId}
                RETURN doc
              `);
              const res = await cursor.all();

              // if user is not found
              if (res.length === 0) {
                sails.log.warn(
                  `Hmmm, it seems that the requested id ${req.session.userIds} couldn't be found in the db`
                );
                delete req.session.userId;
                return next();
              }

              // else fill req.me with sanitized user
              const sanitizedUser = _.extend({}, res[0]);
              delete sanitizedUser.password;

              req.me = sanitizedUser;
              return next();
            } else {
              // if user is not logged in, then proceed normally
              return next();
            }
          }
        }
      }
    }
  };
};
