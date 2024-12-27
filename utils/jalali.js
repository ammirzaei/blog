const moment = require('jalali-moment');

module.exports.formatDateTime = dateTime => {
    return moment(dateTime).locale('fa').format('HH:mm:ss - DD MMM YYYY');
}
exports.formatDate = date => {
    return moment(date).locale('fa').format('DD MMM YYYY');
}