Meteor.publish('posts', function (options) {
    // by checking the options parameter we can ensure that 'fields' cannot be called,
    // potentially exposing data
    check(options, {
        sort: Object,
        limit: Number
    });
    return Posts.find({}, options);
});

Meteor.publish('singlePost', function(id) {
    check(id, String)
    return Posts.find(id);
});

Meteor.publish('comments', function (postId) {
    check(postId, String);
    /* we are passing in a postId parameter that will be specified in the route's subscription
     request */
    return Comments.find({postId: postId});
});

Meteor.publish('notifications', function () {
    // show only the logged-in user's notifications
    return Notifications.find({userId: this.userId, read: false});
});