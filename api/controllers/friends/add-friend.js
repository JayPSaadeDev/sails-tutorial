module.exports = {
  friendlyName: 'Add Friend Controller',

  description: "Adds a user as a friend to the current user's friend list",

  extendedDescription:
    "If the stranger's email exists in the db, then adds this stranger as a friend of the current session's user",

  inputs: {
    email: {
      type: 'string',
      description: 'Email of the stranger to be added',
      isEmail: true,
      required: true
    }
  },

  exits: {
    isAlreadyAFriend: {
      statusCode: 424,
      description: "This isn't a stranger, that's already a friend"
    },
    cantAddSelf: {
      statusCode: 425,
      description: 'You cannot add yourself as a friend'
    },
    userNotFound: {
      statusCode: 426,
      description: 'User not found, perhaps you mistyped the email?'
    }
  },

  fn: async function(inputs, exits) {
    const strangerEmail = inputs.email;

    // if request email is the same as current session email, throw an error
    if (strangerEmail === this.req.me.email) {
      throw 'cantAddSelf';
    }

    // else proceed normally
    const db = sails.config.db.instance();
    const currentId = this.req.me._id;
    const cursor = await db.query(
      `
        FOR u IN Users
        FILTER u.email == @strangerEmail
        LIMIT 1
        LET alreadyFriends = FIRST(
            FOR v, e IN 1..1 ANY u._id friendOf
            FILTER v._id == @currentId
            LIMIT 1
            RETURN e
        )
        UPSERT {
            _from: alreadyFriends._from, to: alreadyFriends._to
        }
        INSERT { _from: @currentId, _to: u._id }
        UPDATE {} IN friendOf
        RETURN { addedFriend: u, alreadyFriends: alreadyFriends != null }
    `,
      {
        strangerEmail,
        currentId
      }
    );
    const res = await cursor.all();

    // if user isn't found, throw an error
    if (res.length === 0) {
      throw 'userNotFound';
    }

    // if user is already a friend of the user, throw an error
    if (res[0].alreadyFriends) {
      throw 'isAlreadyAFriend';
    }

    // else success
    const addedFriend = res[0].addedFriend;
    delete addedFriend.password;

    return exits.success({ addedFriend });
  }
};
