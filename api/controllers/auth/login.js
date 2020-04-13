module.exports = {
  friendlyName: 'Login Controller',

  description: 'Logs in the user with the same email',

  extendedDescription:
    'If the email exists in the db, and the passwords match, return the user object in the response (temporary)',

  inputs: {
    email: {
      type: 'string',
      description: "User's email, duh..",
      isEmail: true,
      required: true,
    },

    password: {
      type: 'string',
      description: "User's password without hashing",
      minLength: 6,
      required: true,
    },
  },

  exits: {
    wrongCredentials: {
      statusCode: 421,
      description: 'Wrong credentials',
    },
  },
  fn: async function (inputs, exits) {
    inputs.password = await sails.helpers.passwords.hashPassword(
      inputs.password
    );
    const aql = sails.config.db.aql;
    const db = sails.config.db.instance();
    const cursor = await db.query(aql`
      FOR doc IN Users
      FILTER doc.email == ${inputs.email} AND doc.password == ${inputs.password}
      RETURN doc
    `);
    const res = await cursor.all();
    db.close();
    // if user not found or incorrect password
    if (res.length === 0) {
      throw 'wrongCredentials';
    }

    const user = res[0]
    // else success
    const token = await sails.helpers.auth.createJwt(user._id);
    return exits.success({token});
  },
};
