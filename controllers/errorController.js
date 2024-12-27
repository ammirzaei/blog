// Not Found Page -- GET
module.exports.get404 = (req, res) => {
    res.status(404).render('error/404', {
        pageTitle: "خطای 404",
        path: '',
        layout: false
    });
}

// Error Server Page -- GET
module.exports.get500 = (req, res) => {
    res.status(500).render('error/500', {
        pageTitle: 'خطای 500',
        path: '',
        layout: false
    });
}