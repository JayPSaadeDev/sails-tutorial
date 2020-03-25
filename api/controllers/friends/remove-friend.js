module.exports = {
  friendlyName: 'Remove Friend Controller',

  description: "Removes a friend from the current user's friend list",

  extendedDescription:
    "Removes the friend from the friends list, throw an error if the friend wasn't found",

  inputs: {
    email: {
      type: 'string',
      description: 'Email of the stranger to be added',
      isEmail: true,
      required: true
    }
  },

  exits: {
    cantRemoveSelf: {
      statusCode: 427,
      description: 'You cannot remove yourself as a friend'
    },
    friendNotFound: {
      statusCode: 428,
      description: 'Friend not found, perhaps you mistyped the email?'
    }
  },

  fn: async function(inputs, exits) {
    const friendEmail = inputs.email;

    // if request email is the same as current session email, throw an error
    if (friendEmail === this.req.me.email) {
      throw 'cantRemoveSelf';
    }

    // else proceed normally
    const db = sails.config.db.instance();
    const currentId = this.req.me._id;
    const cursor = await db.query(
      `
        FOR v, e IN 1..1 ANY @currentId friendOf
        FILTER v.email == @friendEmail
        LIMIT 1
        REMOVE e in friendOf
        RETURN OLD
    `,
      {
        friendEmail,
        currentId
      }
    );
    const res = await cursor.all();

    // if friend isn't found, throw an error
    if (res.length === 0) {
      throw 'friendNotFound';
    }

    // else success
    return exits.success();
  }
};
