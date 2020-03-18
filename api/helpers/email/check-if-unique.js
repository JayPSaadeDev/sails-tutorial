module.exports = {
  friendlyName: 'Checks if email is unique in DB',

  description: 'Queries the db and checks if the email already exists or not',

  inputs: {
    email: {
      type: 'string',
      description: "User's email, duh..",
      isEmail: true,
      required: true
    },

    req: {
      type: 'ref',
      description: 'The current incoming request (req).',
      required: true
    }
  },

  exits: {
    success: {
      description: "User's email is unique"
    },

    emailNotUnique: {
      description: 'Email already exists in the database'
    }
  },

  fn: async function(inputs, exits) {
    const aql = sails.config.db.aql;
    const db = sails.config.db.instance();
    const cursor = await db.query(aql`FOR doc IN Users
      FILTER doc.email == ${inputs.email}
      RETURN doc`);
    const res = await cursor.all();

    // first, we check if the email already exists
    if (res.length !== 0) {
      const user = res[0];
      // then we check if the email is associated with the current user, if not, then throw an error
      if (user._id !== inputs.req.me._id) {
        throw 'emailNotUnique';
      }
    }

    return exits.success();
  }
};
