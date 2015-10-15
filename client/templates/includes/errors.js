Template.errors.helpers({
    errors: function() {
        return Errors.find();
    }
});

// once template is rendered, execute this function
Template.error.onRendered(function() {
    // this.data accesses the error object
    var error = this.data;
    Meteor.setTimeout(function() {
        Errors.remove(error._id);
    }, 3000);
});