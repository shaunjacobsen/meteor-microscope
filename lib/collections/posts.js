Posts = new Mongo.Collection('posts');

Posts.allow({
    update: function(userId, post) { return ownsDocument(userId, post); },
    remove: function(userId, post) { return ownsDocument(userId, post); }
});

Posts.deny({
    update: function(userId, post, fieldNames) {
        // users can only edit the following fields:
        return (_.without(fieldNames, 'url', 'title').length > 0);
        // if the array is longer than 0, 'true' is returned and the denial succeeds
    }
});

Posts.deny({
    update: function(userId, post, fieldNames, modifier) {
        var errors = validatePost(modifier.$set);
        // if either title or url has errors, 'true' is returned and the denial succeeds
        return errors.title || errors.url;
    }
});

validatePost = function (post) {
    var errors = {};
    if (!post.title) {
        errors.title = "Please fill in a headline";
    }
    if (!post.url) {
        errors.url = "Please fill in a URL";
    }
    return errors;
}

Meteor.methods({
    postInsert: function(postAttributes) {
        check(Meteor.userId(), String);
        // check if the postAttributes are entered and the correct data type
        check(postAttributes, {
            title: String,
            url: String
        });

        // throw server error in case user attempts to add invalid post via browser console
        var errors = validatePost(postAttributes);
        if (errors.title || errors.url) {
            throw new Meteor.Error('invalid-post', 'You must set a title and URL for this post.');
        }

        var postWithSameLink = Posts.findOne({url: postAttributes.url});
        if (postWithSameLink) {
            return {
                postExists: true,
                _id: postWithSameLink._id
            };
            // if a post with the same url already exists, the return statement lets the
            // client know; the return statement also stops the rest of the script from executing
        }

        var user = Meteor.user();
        // extend the postAttributes to include the userId, username, and the current timestamp
        // on the server side
        var post = _.extend(postAttributes, {
            userId: user._id,
            author: user.username,
            submitted: new Date(),
            commentsCount: 0,
            upvoters: [],
            votes: 0
        });
        // insert the post and its 5 attributes
        var postId = Posts.insert(post);
        // send the newly-created post's _id back to the client
        return {
            _id: postId
        };
    },

    upvote: function (postId) {
        check(this.userId, String);
        check(postId, String);

        var affected = Posts.update({
            // find all posts where the _id is equal to this one...
            _id: postId,
            // ...and where the current user hasn't already upvoted it
            upvoters: {$ne: this.userId}
        }, {
            $addToSet: {upvoters: this.userId},
            $inc: {votes: 1}
        });

        if (! affected) {
            throw new Meteor.Error('invalid', 'You could not upvote this post');
        }
    }
});