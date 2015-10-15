Template.postPage.helpers({
    comments: function () {
        return Comments.find({postId: this._id});
        // 'this' refers to the current post
    }
});