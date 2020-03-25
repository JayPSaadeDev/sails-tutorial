module.exports = {
  friendlyName: 'Delete user Controller',

  description: "Deletes the user's document based on the request param",

  extendedDescription: `First, we fetch the user's key from req.param.id
        Once fetched, delete the user from the db and return a status code
      `,

  exits: {
    success: {
      description: 'User is deleted successfully'
    },

    userIsAdminOrNotFound: {
      statusCode: 423,
      description:
        "User with given key is either not found or an admin, thus deleting the related document won't work"
    }
  },
  fn: async function(inputs, exits) {
    const aql = sails.config.db.aql;
    const db = sails.config.db.instance();

    let key = parseInt(this.req.param('key'), 10);

    // if key is a valid number, then proceed to execute query
    if (!_.isNaN(key)) {
      key = key.toString(10);
      // deletes the user if the key is found and the user is not an admin
      const cursor = await db.query(aql`
        For u IN Users
        FILTER u.isAdmin != true && u._key == ${key}
        REMOVE u IN Users
        RETURN OLD._key
      `);

      const res = await cursor.all();
      db.close();

      // document not found, throw error
      if (res.length === 0) {
        throw 'userIsAdminOrNotFound';
      }
      return exits.success();
    }
    // key isn't a valid number, so immediately throw an error
    throw 'userIsAdminOrNotFound';
  }
};
