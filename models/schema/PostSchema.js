const yup = require('yup');

module.exports.postValidationSchema = yup.object().shape({
    title : yup.string().required('وارد کردن عنوان پست الزامی است').min(4,'عنوان پست نباید کمتر از 4 کاراکتر باشد').max(150,'عنوان پست نباید بیشتر از 150 کاراکتر باشد'),
    body : yup.string().required('وارد کردن متن پست الزامی است'),
    status : yup.mixed().oneOf(['خصوصی','عمومی'],'یکی از دو وضعیت را انتخاب کنید'),
    image : yup.object().shape({
        name : yup.string().required('انتخاب عکس پست الزامی است'),
        size : yup.number().max(3200000,'حجم عکس نباید بیشتر از 3 مگابایت باشد'),
    }),
    shortDescription : yup.string().required('وارد کردن توضیحات کوتاه پست الزامی است').min(8,'توضیحات کوتاه پست نباید کمتر از 8 کاراکتر باشد').max(1000,'توضیحات کوتاه پست نباید بیشتر از 1000 کاراکتر باشد')
});