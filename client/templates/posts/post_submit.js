Template.postSubmit.onCreated(function() {
    Session.set('postSubmitErrors', {});
});

Template.postSubmit.helpers({
    errorMessage: function (field) {
        // 'field' is called from the postSubmit template as a parameter to the errorClass or
        // errorMessage handlebars
        return Session.get('postSubmitErrors')[field];
    },
    errorClass: function (field) {
        if (!!Session.get('postSubmitErrors')[field]) {
            return 'has-error';
        } else {
            return '';
        }
    }
});

Template.postSubmit.events({
    'submit form': function (e) {
        e.preventDefault();

        var post = {
            url: $(e.target).find('[name=url]').val(),
            title: $(e.target).find('[name=title]').val()
        };

        var errors = validatePost(post);
        if (errors.title || errors.url) {
            // use 'return' so that code stops if there are any errors
            return Session.set('postSubmitErrors', errors);
        }

        Meteor.call('postInsert', post, function(error, result) {
            // display the error and stop
            if (error) {
                return throwError(error.reason);
            }

            // if url already exists, route to the existing url's page
            if (result.postExists) {
                throwError('This link has already been posted');
            }

            Router.go('postPage', {_id: result._id});
        });
    }
});