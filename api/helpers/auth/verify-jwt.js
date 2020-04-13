const jwt = require('jsonwebtoken');

module.exports = {
  friendlyName: 'Verify JWT',
  description:
    "Verify a JWT token. If a token doesn't exist, proceeds normally",
  inputs: {
    req: {
      type: 'ref',
      friendlyName: 'Request',
      description: 'A reference to the request object (req).',
      required: true,
    },
  },
  exits: {
    invalid: {
      description: 'Invalid token or no authentication present.',
    },
    idNotFound: {
      description:
        "The token was valid, however the user id wasn't found in the db",
    },
  },
  fn: function (inputs, exits) {
    const req = inputs.req;
    if (req.header('authorization')) {
      // if one exists, attempt to get the header data
      const token = req.header('authorization').split('Bearer ')[1];
      // if there's nothing after "Bearer", no go
      if (!token) throw 'invalid';
      // if there is something, attempt to parse it as a JWT token
      return jwt.verify(token, sails.config.custom.JWT_SECRET, async function (
        err,
        payload
      ) {
        console.log(payload);

        if (err || !payload.sub) throw 'invalid';

        // checking for user in db
        const db = sails.config.db.instance();
        const aql = sails.config.db.aql;
        const cursor = await db.query(aql`
              FOR doc IN Users
              FILTER doc._id == ${payload}
              RETURN doc
            `);
        const user = await cursor.all();

        // if user is not found
        if (user.length === 0) {
          sails.log.warn(
            `Hmmm, it seems that the requested id ${payload._id} couldn't be found in the db`
          );
          throw 'idNotFound';
        }

        // else fill req.me with sanitized user
        const sanitizedUser = _.extend({}, user[0]);
        delete sanitizedUser.password;

        req.me = sanitizedUser;
        return exits.success();
      });
    }
    // if user isn't logged in, proceed normally
    return exits.success();
  },
};
