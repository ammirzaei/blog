
exports.truncateString = (str, num = 30) => {
    if (str) {
        let string = str.toString();
        if (string.length <= num) {
            return string;
        }
        return string.slice(0, num) + "...";
    } else {
        return str;
    }
}