module.exports = {
  friendlyName: 'Get all users Controller',

  description: 'Fetches all the users from the db with pagination',

  extendedDescription: `First, we check for pagination in the query params, then return the users in that search area`,

  exits: {
    success: {
      description: 'Users are fetched successfully'
    }
  },
  fn: async function(inputs, exits) {
    const aql = sails.config.db.aql;
    const db = sails.config.db.instance();

    // check for query param, if no query params were, then default to predefined custom variables
    const offset =
      parseInt(this.req.query.from, 10) ||
      sails.config.custom.DEFAULT_PAGINATION_OFFSET;
    const size =
      parseInt(this.req.query.size, 10) ||
      sails.config.custom.DEFAULT_PAGINATION_SIZE;

     // fetching results with pagination 
    const cursor = await db.query(aql`For u IN Users
              SORT u.timestamp
              LIMIT ${offset}, ${size}
              RETURN u
              `);

    const res = await cursor.all();

    // remove password attribute before returning result
    res.map(u => delete u.password)
    db.close();
    return exits.success(res);
  }
};
