const Blog = require('../models/blogModel');
const Saved = require('../models/savedModel');
const Like = require('../models/likeModel');
const User = require('../models/userModel');
const Follower = require('../models/followerModel');
const Suggested = require('../models/suggestedModel');
const Comment = require('../models/commentModel');
const Particiption = require('../models/participtionModel');

const { formatDate, formatDateTime } = require('../utils/jalali');
const { get500, get404 } = require('./errorController');
const { truncateString } = require("./../utils/helpers");

module.exports.getAllBlogs = async (req, res) => {
    try {
        const pageId = +req.query.pageId || 1;
        const blogPerPage = 10;
       
        let blogsCount;
        let blogs;

        const search = req.body.search;
        if (search) {
            blogsCount = await Blog.count({ status: 'عمومی', $text: { $search: search, $caseSensitive: false } });
            // get all blogs(desc)
            blogs = await Blog.find({ status: 'عمومی', $text: { $search: search, $caseSensitive: false } }).sort({ createdAt: 'desc' })
                .skip((pageId - 1) * blogPerPage)
                .limit(blogPerPage).populate('user');
        } else {
            blogsCount = await Blog.count({ status: 'عمومی' });
            // get all blogs(desc)
            blogs = await Blog.find({ status: 'عمومی' }).sort({ createdAt: 'desc' })
                .skip((pageId - 1) * blogPerPage)
                .limit(blogPerPage).populate('user');
        }


        const pagination = {
            currentPage: pageId,
            nextPage: pageId + 1,
            previousPage: pageId - 1,
            hasNextPage: (pageId * blogPerPage) < blogsCount,
            hasPreviousPage: pageId > 1,
            lastPage: Math.ceil(blogsCount / blogPerPage)
        };

        res.render('blogs/blogs', {
            pageTitle: 'پست ها',
            path: '/blogs',
            blogs,
            pagination,
            formatDate,
            formatDateTime,
            truncateString,
            isAuthenticated: req.isAuthenticated()
        });
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}

module.exports.getBlog = async (req, res) => {
    try {
        const blogID = req.params.id; // access with blog ID

        const blog = await Blog.findById(blogID).populate('user'); // find blog with blog ID

        
        if (blog && blog.status === 'عمومی') {
            let saved = null;
            if(req.isAuthenticated()) {
                saved = await Saved.findOne({ user: req.user.id, blog: blogID });
            }
            let liked = null;
            if(req.isAuthenticated()) {
                liked = await Like.findOne({ user: req.user.id, blog: blogID });
            }
            let followed = null;
            if(req.isAuthenticated()) {
                followed = await Follower.findOne({ user: blog.user.id, follower: req.user.id });
            }
            let followSelf = false;
            if(req.isAuthenticated()) {
                followSelf = blog.user.id == req.user.id;
            }
            let particiption = null;
            if(req.isAuthenticated()) {
                particiption = await Particiption.findOne({ user: req.user.id, blog: blogID });
            }

            const suggesteds = await Suggested.find({ blog: blog.id }).populate('suggested');
            const likeCount = await Like.count({ blog: blog.id });
            const comments = await Comment.find({ blog: blog.id }).populate('user');

            res.render('blogs/blog', {
                pageTitle: blog.title,
                path: '/blog',
                blog,
                saved,
                liked,
                followed,
                followSelf,
                suggesteds,
                likeCount,
                comments,
                particiption,
                formatDate,
                formatDateTime,
                isAuthenticated: req.isAuthenticated()
            });
        } else
            get404(req, res);
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}

module.exports.savedHandle = async (req, res) => {
    try {
        if(!req.isAuthenticated()) {
            return res.status(401).send({ message: 'ابتدا لاگین کنید' });
        }
        const blogID = req.params.id;

        const blog = await Blog.findById(blogID);

        if (blog) {
           const saved = await Saved.findOne({ user: req.user.id, blog: blogID });
           if(saved) {
                await saved.delete();
                return res.status(201).send({ message: 'پست از لیست سیو ها حذف شد.', status: 201 });
           } else {
            await Saved.create({
                user: req.user.id,
                blog: blogID,
            });
            return res.status(200).send({ message: 'پست به لیست سیو ها اضافه شد.', status: 200 });
           }
        } else
            res.status(404);
    } catch (err) {
        return res.status(500);
    }
}

module.exports.likedHandle = async (req, res) => {
    try {
        if(!req.isAuthenticated()) {
            return res.status(401).send({ message: 'ابتدا لاگین کنید' });
        }
        const blogID = req.params.id;

        const blog = await Blog.findById(blogID);

        if (blog) {
           const like = await Like.findOne({ user: req.user.id, blog: blogID });
           if(like) {
                await like.delete();
                const likeCount = await Like.count({ blog: blog.id });
                return res.status(201).send({ message: 'پست از لیست لایک ها حذف شد.', status: 201, likeCount });
           } else {
            await Like.create({
                user: req.user.id,
                blog: blogID,
            });
            const likeCount = await Like.count({ blog: blog.id });
            return res.status(200).send({ message: 'پست به لیست لایک ها اضافه شد.', status: 200, likeCount });
           }
        } else
            res.status(404);
    } catch (err) {
        return res.status(500);
    }
}

module.exports.followerHandle = async (req, res) => {
    try {
        if(!req.isAuthenticated()) {
            return res.status(401).send({ message: 'ابتدا لاگین کنید' });
        }
        const userId = req.params.id;

        const user = await User.findById(userId);

        if (user) {
           const follow = await Follower.findOne({ user: userId, follower: req.user.id });
           if(follow) {
                await follow.delete();
                user.follower = user.follower - 1;
                await user.save();
                return res.status(201).send({ message: 'کاربر از لیست دنبال کننده ها حذف شد.', status: 201, follower: user.follower });
           } else {
            await Follower.create({
                user: userId,
                follower: req.user.id,
            });
            user.follower = user.follower + 1;
            await user.save();
            return res.status(200).send({ message: 'کاربر به لیست دنبال کننده ها اضافه شد.', status: 200, follower: user.follower });
           }
        } else
            res.status(404);
    } catch (err) {
        return res.status(500);
    }
}

module.exports.submitComment = async (req, res) => {
    try {
        if(!req.isAuthenticated()) {
            return res.status(401).send({ message: 'ابتدا لاگین کنید' });
        }

        const { blogId, message, recaptcha } = req.body;

        if (!reChaptcha(recaptcha, req.ip) || !recaptcha) {
           return res.status(422).send({ message: 'CAPTCHA را تایید کنید' })
        }
        const blog = await Blog.findById(blogId);
        if(!blog) {
            return res.status(404).send({ message: 'پست مورد نظر یافت نشد' });
        }

        if(!message) {
            return res.status(402).send({ message: 'متن نظر را وارد نمایید', status: 402 });
        }
        const newComment = await Comment.create({
            blog: blog.id,
            message,
            user: req.user.id,
        });
        
        return res.status(200).send({ message: 'نظر شما با موفقیت ثبت شد', status: 200, comment: {
            createdAt: formatDateTime(newComment.createdAt),
            message: newComment.message,
            user: {
                avatar: req.user.avatar,
                fullName: req.user.fullName
            }
        }});

    } catch (err) {
        return res.status(500);
    }
}

async function reChaptcha(resRecaptcha, remoteIp) {
    const verify = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${resRecaptcha}&remoteip=${remoteIp}`;

    const response = await fetch(verify, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
    });
    const resJson = await response.json();
    return resJson.success;
}

module.exports.submitParticiption = async (req, res) => {
    try {
        if(!req.isAuthenticated()) {
            return res.status(401).send({ message: 'ابتدا لاگین کنید' });
        }

        const blogId = req.params.id;

        const blog = await Blog.findById(blogId);
        if(!blog) {
            return res.status(404).send({ message: 'پست مورد نظر یافت نشد' });
        }

        const particiption = await Particiption.findOne({ user: req.user.id, blog: blogId });
        if(particiption) {
            return res.status(201).send({ message: 'درخواست شما قبلا ثبت شده است' });
        }

        await Particiption.create({
            user: req.user.id,
            blog: blogId,
            status: false,
        });

        return res.status(200).send({ message: 'درخواست شما با موفقیت ثبت شد منتظر پاسخ از سمت نویسنده بمانید', status: 200 });

    } catch (err) {
        return res.status(500);
    }
}

module.exports.getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const pageId = +req.query.pageId || 1;
        const blogPerPage = 6; // limit blog

        const user = await User.findById(userId);

        if(!user) {
            return get404(req, res);
        }
       
        const blogsCount = await Blog.count({ user: userId });
        const blogs = await Blog.find({ user: userId }).populate('user')
            .skip((pageId - 1) * blogPerPage)
            .limit(blogPerPage);


        const pagination = {
            currentPage: pageId,
            nextPage: pageId + 1,
            previousPage: pageId - 1,
            hasNextPage: (pageId * blogPerPage) < blogsCount,
            hasPreviousPage: pageId > 1,
            lastPage: Math.ceil(blogsCount / blogPerPage)
        };

        res.render('blogs/user', {
            pageTitle: 'پروفایل نویسنده',
            path: '/user',
            blogs,
            user,
            pagination,
            formatDate,
            formatDateTime,
            truncateString,
            isAuthenticated: req.isAuthenticated()
        });
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}