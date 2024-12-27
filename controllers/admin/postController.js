const path = require('path');
const fs = require('fs');

const Blog = require('../../models/blogModel');
const Comment = require('../../models/commentModel');
const Particiption = require('../../models/participtionModel');
const Like = require('../../models/likeModel');
const Saved = require('../../models/savedModel');

const Suggested = require('../../models/suggestedModel');
const { get500, get404 } = require('../errorController');
const rootDir = require('../../utils/rootDir');

const shortId = require('shortid');
const sharp = require('sharp');
const { formatDateTime } = require('./../../utils/jalali');

// Add Post -- GET
module.exports.getAddPost = async (req, res) => {
    res.render('admin/posts/addPost', {
        pageTitle: 'افزودن پست جدید',
        path: '/dashboard/add-post',
        layout: './layouts/adminLayout',
        fullName: req.user.fullName,
        isAdmin: req.user.isAdmin,
        errors: []
    });
}

// Add Post Handler -- POST
module.exports.handleAddPost = async (req, res) => {
    try {
        const image = req.files ? req.files.image : {};

        req.body.image = image; // added image to the body
        // req.body = { ...req.body, image };

        // check model validation
        await Blog.postValidation(req.body);

        const imageName = shortId.generate() + path.extname(image.name);
        const imagePath = `${rootDir}/public/uploads/blogs/${imageName}`;

        // compress image and saved
        await sharp(image.data).jpeg({
            quality: 50
        }).toFile(imagePath).catch((err) => {
            if (err) {
                console.log(err);
                get500(req, res);
            }
        });

        // create post
        await Blog.create({
            ...req.body,
            image: imageName,
            user: req.user.id
        });
        
        res.redirect('/dashboard');

    } catch (err) {
        const errors = [];

        // push all errors in postValidation
        err.inner.forEach(error => {
            errors.push({
                name: error.path,
                message: error.message
            });
        });

        res.render('admin/posts/addPost', {
            pageTitle: 'افزودن پست جدید',
            path: '/dashboard/add-post',
            layout: './layouts/adminLayout',
            fullName: req.user.fullName,
            isAdmin: req.user.isAdmin,
            errors
        });
    }
}

// Edit Post -- GET
module.exports.getEditPost = async (req, res) => {
    try {
        const blogId = req.params.id; // get blog id from url

        const blog = await Blog.findById(blogId);
        if (blog) {
            const posts = (await Blog.find({ user: req.user.id })).filter((item) => item.id != blog.id);
            const particiption = await Particiption.findOne({ user: req.user.id, blog: blog.id, status: true });
            const suggesteds = particiption ? [] : await Suggested.find({ blog: blog.id });

            res.render('admin/posts/editPost', {
                pageTitle: 'ویرایش پست',
                path: '/dashboard/edit-post',
                layout: './layouts/adminLayout',
                fullName: req.user.fullName,
                blog,
                suggesteds,
                particiption,
                posts,
                isAdmin: req.user.isAdmin,
                errors: []
            });
        } else {
            get404(req, res);
        }
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}

// Edit Post Handler -- POSt
module.exports.handleEditPost = async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (!blog)
        get404(req, res);
    try {
        const image = req.files ? req.files.image : {};
        if ("name" in image) {
            req.body.image = image;
        } else {
            // create fake image
            req.body.image = {
                name: 'fakeImage',
                size: 66,
                mimetype: 'image/jpeg'
            };
        }

        await Blog.postValidation(req.body); // validation with statics method mongoose
        const { title, status, body, shortDescription } = req.body; // access to the enterd edit blog

        // set a new value to the blog
        blog.title = title;
        blog.status = status;
        blog.body = body;
        blog.shortDescription = shortDescription;

        // replace new image
        if (req.body.image.name !== 'fakeImage') {
            const imageName = shortId.generate() + path.extname(image.name);
            const imagePath = `${rootDir}/public/uploads/blogs/${imageName}`;

            // deleted old image
            fs.unlink(`${rootDir}/public/uploads/blogs/${blog.image}`, async (err) => {
                if (err) {
                    console.log(err);
                    get500(req, res);
                } else {
                    // compress image and saved new image
                    await sharp(image.data).jpeg({
                        quality: 50
                    }).toFile(imagePath).catch((err) => {
                        if (err) {
                            console.log(err);
                            get500(req, res);
                        }
                    });
                }
            })

            blog.image = imageName;
        }

        // save new blog to the db
        await blog.save();

        const particiption = await Particiption.findOne({ user: req.user.id, blog: blog.id ,status: true });

        // suggested
        if(!particiption) {
            await Suggested.deleteMany({ blog: blog.id });

            const suggesteds = [];
            Object.keys(req.body)?.forEach((item) => {
                if(item.includes('suggest-')) {
                    const id = item.split('-')[1];
                    suggesteds.push({ blog: blog.id, suggested: id });
                }
            });
            await Suggested.insertMany(suggesteds);
        }

        res.redirect('/dashboard');
    } catch (err) {
        const errors = [];

        err.inner.forEach(error => {
            errors.push({
                name: error.path,
                message: error.message
            });
        });

        const posts = (await Blog.find({ user: req.user.id })).filter((item) => item.id != blog.id);

        res.render('admin/posts/editPost', {
            pageTitle: 'ویرایش پست',
            path: '/dashboard/edit-post',
            layout: './layouts/adminLayout',
            fullName: req.user.fullName,
            blog,
            posts,
            errors,
            isAdmin: req.user.isAdmin,
        });
    }
}

// Delete Post -- GET
module.exports.getDeletePost = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id); // find blog with param id

        if (blog.user != req.user.id)
            return res.redirect('/dashboard');

        if (blog) {
            // deleted from db
            await Blog.findByIdAndDelete(req.params.id);

            const pathImage = `${rootDir}/public/uploads/blogs/${blog.image}`;
            
            // check exist image on folder
            fs.access(pathImage, fs.constants.F_OK, (err) => {
                if (!err) {
                    // deleted image file from folder
                    fs.unlink(pathImage, (err) => {
                        if (err) {
                            console.log(err);
                            get500(req, res);
                        }
                    });
                } else {
                    console.log(err);
                    get500(req, res);
                }
            });

            await Suggested.deleteMany({ blog: blog.id });

            res.redirect('/dashboard');
        } else
            get404(req, res);

    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}

module.exports.getCommentsPost = async (req, res) => {
    try {
        const blogId = req.params.id; // get blog id from url

        const blog = await Blog.findById(blogId);
        if (blog) {
            const comments = await Comment.find({ blog: blog.id }).populate('user');

            res.render('admin/posts/commentsPost', {
                pageTitle: 'نظرات پست',
                path: '/dashboard/comments-post',
                layout: './layouts/adminLayout',
                fullName: req.user.fullName,
                blog,
                comments,
                formatDateTime,
                errors: [],
                isAdmin: req.user.isAdmin,
            });
        } else {
            get404(req, res);
        }
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}

module.exports.getDeleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id); // find comment with param id

        if (comment.user != req.user.id)
            return res.redirect('/dashboard');

        if (comment) {
            // deleted from db
            await Comment.findByIdAndDelete(req.params.id);

            res.redirect(`/dashboard/comments-post/${comment.blog}`);
        } else
            get404(req, res);

    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}

module.exports.getParticiptionsPost = async (req, res) => {
    try {
        const blogId = req.params.id; // get blog id from url

        const blog = await Blog.findById(blogId);
        if (blog) {
            const participtions = await Particiption.find({ blog: blog.id }).populate('user');

            return res.render('admin/posts/participtionsPost', {
                pageTitle: 'مشارکت های پست',
                path: '/dashboard/participtions-post',
                layout: './layouts/adminLayout',
                fullName: req.user.fullName,
                blog,
                participtions,
                formatDateTime,
                errors: [],
                isAdmin: req.user.isAdmin,
            });
        } else {
            get404(req, res);
        }
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}

module.exports.changeParticiptionStatusPost = async (req, res) => {
    try {
        const participtionId = req.params.id; // get particiption id from url

        const particiption = await Particiption.findById(participtionId);

        if (particiption) {
            particiption.status = !particiption.status;
            await particiption.save();

            res.redirect(`/dashboard/participtions-post/${particiption.blog}`);
        } else
            get404(req, res);
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}

module.exports.getAnalysisPost = async (req, res) => {
    try {
        const blogId = req.params.id; // get blog id from url

        const blog = await Blog.findById(blogId);
        if (blog) {
            const likesCount = await Like.count({ blog: blog.id });
            const savedsCount = await Saved.count({ blog: blog.id });
            const commentsCount = await Comment.count({ blog: blog.id });

            res.render('admin/posts/analysisPost', {
                pageTitle: 'آنالیز پست',
                path: '/dashboard/analysis-post',
                layout: './layouts/adminLayout',
                fullName: req.user.fullName,
                blog,
                savedsCount,
                likesCount,
                commentsCount,
                errors: [],
                isAdmin: req.user.isAdmin,
            });
        } else {
            get404(req, res);
        }
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}

module.exports.getAnalysisAllPost = async (req, res) => {
    try {
        const participtions = await Particiption.find({ user: req.user.id, status: true });
        let blogs = await Blog.find({
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
        }, ['title', 'id']);

        const likes = await Like.find({
            blog: {
                $in: blogs?.map((item) => item.id),
            }
        });
        const saveds = await Saved.find({
            blog: {
                $in: blogs?.map((item) => item.id),
            }
        });
        const comments = await Comment.find({
            blog: {
                $in: blogs?.map((item) => item.id),
            }
        });

        blogs = blogs.map((itemBlog) => ({
            likesCount: likes?.filter((item) => item?.blog == itemBlog?.id).length,
            savedsCount: saveds?.filter((item) => item?.blog == itemBlog?.id).length,
            commentsCount: comments?.filter((item) => item?.blog == itemBlog?.id).length,
            title: itemBlog?.title
        }));

        res.render('admin/posts/analysisAllPost', {
            pageTitle: 'آنالیز تمام پست ها',
            path: '/dashboard/analysis-all-post',
            layout: './layouts/adminLayout',
            fullName: req.user.fullName,
            blogs,
            errors: [],
            isAdmin: req.user.isAdmin,
        });
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}