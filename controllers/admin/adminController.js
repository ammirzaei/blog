const path = require('path');

const sharp = require('sharp');
const shortId = require('shortid');

const Blog = require('../../models/blogModel');
const Saved = require('../../models/savedModel');
const Like = require('../../models/likeModel');
const Particiption = require('../../models/participtionModel');
const Contact = require('../../models/contactModel');

const { formatDateTime } = require('../../utils/jalali');
const { get500 } = require('../errorController');
const rootDir = require('../../utils/rootDir');
const { truncateString } = require('./../../utils/helpers');


// Dashboard Page -- GET
module.exports.getDashboard = async (req, res) => {
    try {
        const pageId = +req.query.pageId || 1; // aceess to the page id for paging
        const blogPerPage = 10; // limit blog

        const search = req.body.search;

        let countBlogs;
        let blogs;
        const participtions = await Particiption.find({ user: req.user.id, status: true });
        if (search) {
            countBlogs = await Blog.count({ user: req.user.id, $text: { $search: search } }); // get count blog user

            blogs = await Blog.find({
                $or: [
                    {
                        _id: {
                            $in: participtions?.map((item) => item.blog),
                        }
                    },
                    {
                        user: req.user.id
                    }
                ],
                $text: { $search: search }
            }).skip((pageId - 1) * blogPerPage)
                .limit(blogPerPage);
        } else {
            countBlogs = await Blog.count({ user: req.user.id }); // get count blog user

            blogs = await Blog.find({
                $or: [
                    {
                        _id: {
                            $in: participtions?.map((item) => item.blog),
                        }
                    },
                    {
                        user: req.user.id
                    }
                ],
            }).skip((pageId - 1) * blogPerPage)
                .limit(blogPerPage);
        }
        countBlogs += participtions.length;

        const saved = await Saved.find();
        blogs?.forEach(async (itemBlog, index) => {
            blogs[index].saved = saved.filter((itemSave) => itemSave.blog == itemBlog.id)?.length || 0;
        });

        const like = await Like.find();
        blogs?.forEach(async (itemBlog, index) => {
            blogs[index].like = like.filter((itemLike) => itemLike.blog == itemBlog.id)?.length || 0;
        });

        const pagination = {
            currentPage: pageId,
            nextPage: pageId + 1,
            previousPage: pageId - 1,
            hasNextPage: (pageId * blogPerPage) < countBlogs,
            hasPreviousPage: pageId > 1,
            lastPage: Math.ceil(countBlogs / blogPerPage)
        };

        // set header for clear backward
        res.set('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

        res.render('admin/dashboard', {
            pageTitle: 'صفحه داشبورد',
            path: '/dashboard',
            layout: './layouts/adminlayout',
            fullName: req.user.fullName,
            blogs,
            isAdmin: req.user.isAdmin,
            participtions,
            formatDateTime,
            pagination
        });
    } catch (err) {
        console.log(err);
        get500(req, res);
    }

}

// Upload Image
module.exports.uploadImage = async (req, res) => {
    try {
        if (req.files) {
            const image = req.files.imageUpload; // access to the image upload

            // Validation
            // Size
            if (image.size > 4200000) {
                return res.status(400).send('حجم عکس نباید بیشتر از 4 مگابایت باشد');
            }

            const imageName = shortId.generate() + path.extname(image.name);
            const imagePath = `${rootDir}/public/uploads/img/${imageName}`;

            // compressed and saved image to the folder
            await sharp(image.data).jpeg({
                quality: 50
            }).toFile(imagePath).catch((err) => {
                res.status(400).send('در فرایند ذخیره عکس مشکلی رخ داد');
            });

            // create url image for send on header 
            const url = `http://localhost:3000/uploads/img/${imageName}`;

            res.status(200).set('url', url).send('آپلود عکس با موفقیت انجام شد');
        } else {
            res.status(400).send('ابتدا عکسی انتخاب کنید');
        }
    } catch (err) {
        res.status(400).send('در فرایند آپلود مشکلی رخ داد');
    }
}

module.exports.getSavedPosts = async (req, res) => {
    try {
        const pageId = +req.query.pageId || 1; // aceess to the page id for paging
        const blogPerPage = 6; // limit blog

        const saveds = await Saved.find({ user: req.user.id });
        const blogsCount = await Blog.count({ 
            _id: {
                $in: saveds?.map((item) => item.blog),
            }
        });
        const blogs = await Blog.find({ 
            _id: {
                $in: saveds?.map((item) => item.blog),
            }
         }).skip((pageId - 1) * blogPerPage)
            .limit(blogPerPage).populate('user');

        const pagination = {
            currentPage: pageId,
            nextPage: pageId + 1,
            previousPage: pageId - 1,
            hasNextPage: (pageId * blogPerPage) < blogsCount,
            hasPreviousPage: pageId > 1,
            lastPage: Math.ceil(blogsCount / blogPerPage)
        };

        res.render('admin/blogsSaved', {
            pageTitle: 'لیست پست های سیو شده',
            path: '/dashboard/blogs-saved',
            layout: './layouts/adminlayout',
            fullName: req.user.fullName,
            blogs,
            pagination,
            truncateString,
            isAdmin: req.user.isAdmin,
            formatDateTime,
        });
    } catch (err) {
        console.log(err);
        get500(req, res);
    }

}

module.exports.getContactUs = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: 'desc' });

        res.render('admin/contactUs', {
            pageTitle: 'لیست تماس با ما',
            path: '/dashboard/contact-us',
            layout: './layouts/adminlayout',
            fullName: req.user.fullName,
            contacts,
            isAdmin: req.user.isAdmin,
            truncateString,
            formatDateTime,
        });
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}

module.exports.deleteContactUsHandle = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id); // find comment with param id


        if (contact) {
            await Contact.findByIdAndDelete(req.params.id);

            res.redirect(`/dashboard/contact-us/`);
        } else
            get404(req, res);

    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}