const yup = require('yup');

const registerSchema = yup.object().shape({
    fullName: yup.string().required('نام و نام خانوادگی اجباری است').min(4, 'نام و نام خانوادگی نباید کمتر از 4 کاراکتر باشد').max(150, 'نام و نام خانوادگی نباید بیشتر از 150 کاراکتر باشد'),
    email: yup.string().email("ایمیل وارد شده معتبر نیست").required("ایمیل اجباری است"),
    password: yup.string().required("رمز عبور اجباری است").min(8, 'رمز عبور نباید کمتر از 8 کاراکتر باشد').max(150, "رمز عبور نباید بیشتر از 150 کاراکتر باشد"),
    repassword: yup.string().required("تکرار رمز عبور اجباری است").oneOf([yup.ref('password')], 'رمز های عبور یکسان نیستند')
});

const resetPasswordSchema = yup.object().shape({
    password: yup.string().required("وارد کردن رمز عبور الزامی است").min(8, 'رمز عبور نباید کمتر از 8 کاراکتر باشد').max(150, "رمز عبور نباید بیشتر از 150 کاراکتر باشد"),
    repassword: yup.string().required('وارد کردن تکرار رمز عبور الزامی است').oneOf([yup.ref('password')], 'رمز های عبور یکسان نیستند')
});
module.exports = { registerSchema, resetPasswordSchema };