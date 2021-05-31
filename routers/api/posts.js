const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require('express-validator');

//models 
const Profile= require("../../models/Profile");
const User= require("../../models/User");
const Post= require("../../models/Post");

//@post api/posts {TO  post posts} private
router.post("/", auth,
    check("text", "Text is required").notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        };

        try {
            const user = await User.findById(req.user.id).select('-password');

            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,
            });

            const post = await newPost.save();

            res.json(post);

        } catch (error) {
            console.error(error.message);
            res.status(500).send("server error: " + error.message);
        }; 
});

//@Get  api/posts {Get all the posts} private

router.get('/',auth, async (req, res)=>{
    try {
        const posts = await Post.find().sort({date:-1});
        res.json(posts);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error: " + error.message);
    }

});

//@Get api/posts/:id {Get  the post by id} private

router.get('/:id',auth, async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);

        if(!post) {
            return res.status(404).json({msg: "Post not found"});
        }
        res.json(post);

    } catch (error) {
        console.error(error.message);
        if(error.kind==='ObjectId') {
            return res.status(404).json({msg: "Post not found"});
        }
        res.json(post);
        res.status(500).send("server error: " + error.message);
    }
});

//@Delete api/posts/:id {Delete the post by id}
router.delete('/:id',auth, async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);

        //checking post
        if(!post) {
            return res.status(404).json({msg: "Post not found"});
        }

        //checking user
        if(post.user.toString() !== req.user.id){
            res.status(401).json({msg: "Not Authorized"});
        }
        await post.remove();
        res.json({msg: "Post Removed"})

    } catch (error) {
        console.error(error.message);
        if(error.kind==='ObjectId') {
            return res.status(404).json({msg: "Post not found"});
        }
        res.json(post);
        res.status(500).send("server error: " + error.message);
    }
});

//@Put api/posts/like/:id {Add a like to the post} private
router.put('/like/:id',auth, async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);

        //check post wheather the already liked 
        if(post.likes.filter(like => like.user.toString() === req.user.id).length>0){
           return res.status(400).json({msg:'Post already liked'});
        };

        post.likes.unshift({ user: req.user.id});

        await post.save();

        res.json(post.likes);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error: " + error.message);
    }

});

//@Put api/posts/unlike/:id {Add a like to the post} private
router.put('/unlike/:id',auth, async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);

        //check post wheather the already liked 
        if(post.likes.filter(like => like.user.toString() === req.user.id).length===0){
           return res.status(400).json({msg:'Post has not yet been liked'});
        };

        //get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex,1);

        await post.save();

        res.json(post.likes);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error: " + error.message);
    }

});

//@post api/posts/comment/:id {TO  post posts} private
router.post("/comment/:id", auth,
    check("text", "Text is required").notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        };

        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,
            };
            post.comments.unshift(newComment);

            await post.save();

            res.json(post.comments);

        } catch (error) {
            console.error(error.message);
            res.status(500).send("server error: " + error.message);
        }; 
});

//@delete api/posts/comment/:id/comment_id {Delete a comment of a the post} private
router.delete('/comment/:id/:comment_id',auth, async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);

        //pull out the comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        if(!comment){
            return res.status(404).json({msg:'No comment exits'});
        }

        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({msg:'Not Authorized'});
        }

        //get remove index
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removeIndex,1);

        await post.save();

        res.json(post.comments);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error: " + error.message);
    }

});



module.exports = router;


