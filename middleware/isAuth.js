module.exports = {
    ensureAuth: function(req, res, next) {
        if (req.isAuthenticated ()) {
            return next();
        } else {
            req.flash('error_msg', 'Please login to view resource')
            res.redirect('/')
        }
    },
}