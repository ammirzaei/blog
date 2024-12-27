const yup = require('yup');

module.exports.contactValidationSchema = yup.object().shape({
    fullName : yup.string().required('وارد کردن این فیلد اجباری است').min(4,'این فیلد نباید کمتر از 4 کاراکتر باشد').max(150,'این فیلد نباید بیشتر از 150 کاراکتر باشد'),
    email : yup.string().email('ایمیل وارد شده معتبر نیست').required('وارد کردن این فیلد اجباری است'),
    message : yup.string().required('وارد کردن این فیلد اجباری است').min(4,'این فیلد نباید کمتر از 4 کاراکتر باشد').max(500,'این فیلد نباید بیشتر از 500 کاراکتر باشد'),
});