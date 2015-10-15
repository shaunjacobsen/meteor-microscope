Template.header.helpers({
    activeRouteClass: function () {
        // 'arguments' gets an unspecified amount of arguments from the activeRouteClass helper
        var args = Array.prototype.slice.call(arguments, 0);
        args.pop();

        var active = _.any(args, function (name) {
            return Router.current() && Router.current().route.getName() === name
        });

        return active && 'active';
    }
});