const express = require("express");
const config = require("config");
const request = require("request");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require('express-validator');

const Profile= require("../../models/Profile");
const User= require("../../models/User");


 //@get  api/profile/me
router.get('/me',auth, async (req,res)=> {
    try {
        const profile = await Profile.findOne({user:req.user.id}).populate(
            "user", ["name", "avatar"]
        );
        if (!profile) {
            return res.status(400).json({msg: "No profile found for this user."});
        }
        res.send(profile);
        
    } catch (error) {
        console.error(error.message);
        console.status(500).json({msg:"server error"});
    }
});

//@post  api/profile {to create or update profile}

router.post('/', auth, 
    check("status", "Status is required").notEmpty(),
    check("skills"," Skills are required").notEmpty(), 
 async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
        company,
        website,
        location,
        bio,
        githubusername,
        skills,
        status,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
        } = req.body;

        //building profile
        const profileFields = {};
        profileFields.user = req.user.id;
        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(githubusername) profileFields.githubusername = githubusername;
        if(status) profileFields.status = status;
        if (skills) {profileFields.skills = skills.split(',').map(skill => skill.trim());}
 
       //build social media object
       profileFields.social = {};
       if (youtube) profileFields.social.youtube = youtube;
       if(twitter) profileFields.social.twitter = twitter;
       if (facebook) profileFields.social.facebook = facebook;
       if (linkedin) profileFields.social.linkedin = linkedin;
       if (instagram) profileFields.social.instagram = instagram;

       try {

        let profile = await Profile.findOne({user: req.user.id});

        if(profile){
            //update 
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileFields},
                {new: true}
                );
            
            res.json(profile);
        }
            
            //creating profile

            profile = new Profile(profileFields);

            await profile.save();
            return res.json(profile);
        
           
       }catch (error) {
           console.error(error.message);
           res.sendStatus(500).send("server error: " + error.message);
           
       }
});

//@GET  api/profile {to GET ALL PROFILES}

router.get("/", async (req, res) => {

    try {
        const profiles = await Profile.find().populate('user',['name','avatar']);
        res.json(profiles);
        
    } catch (error) {
        console.error(error.message);
        console.status(500).send("server error: " + error.message)
    }
});

//@GET  api/profile/user/:user_id {to GET profile by user_id}

router.get("/user/:user_id", async (req, res) => {

    try {
        const profile = await Profile.findOne({user:req.params.user_id}).populate(
            "user", ["name", "avatar"]
        );
        if (!profile) {
            return res.status(400).json({msg: 'Profile not found.'});
        }
        res.send(profile);
        
    } catch (error) {
        console.error(error.type, error.message);
        if(error.kind === 'ObjectId') {
            return res.status(400).json({msg: 'Profile not found.'});
        }

        res.status(500).send('server error');

    }
});

//@DELETE  api/profile {to delete profile,user and posts}

router.delete("/", auth, async (req, res) => {

    try {
        //@todo delete posts

        //delete profile
    await Profile.findOneAndRemove({user: req.user.id});
        //delete user
    await User.findOneAndRemove({_id: req.user.id});
    res.json({msg: 'Removed user'});
        
    } catch (error) {
        console.error(error.message);
        console.status(500).send("server error: " + error.message)
    }
});

//@put api/profile/experience {updates or create experience}

router.put("/experience",[auth,[
    check("title", "Title is required").notEmpty(),
    check("company"," company are required").notEmpty(),
    check("from"," From date is required").notEmpty(),  
]],async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    };

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        discription
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        discription
    };

    try {

        const profile = await Profile.findOne({user: req.user.id});

        profile.experience.unshift(newExp);

        await profile.save();
        res.json(profile);
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error: " + error.message);
        
    }

});

//@DELETE  api/profile/experience/:exp_id {to delete experience of profile}

router.delete("/experience/:exp_id", auth, async (req, res) => {

    try {
        const profile = await Profile.findOne({user:req.user.id});

        //delete experience of a profile
        //getting the index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
        
    } catch (error) {
        console.error(error.message);
        console.status(500).send("server error: " + error.message)
    }
});

//@put api/profile/education {update education}

router.put("/education",[auth,[
    check("school", "School is required").notEmpty(),
    check("degree"," Degree are required").notEmpty(),
    check("fieldofstudy"," Feild of Study is required").notEmpty(),  
    check("from"," From date  is required").notEmpty(),  
]],async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    };

    const {
       school,
       degree,
       fieldofstudy,
       from,
       to,
       current,
       discription
    } = req.body;

    const newExp = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        discription
    };

    try {

        const profile = await Profile.findOne({user: req.user.id});

        profile.education.unshift(newExp);

        await profile.save();
        res.json(profile);
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error: " + error.message);
        
    }

});

//@DELETE  api/profile/education/:edu_id {to delete Education of a profile}

router.delete("/education/:edu_id", auth, async (req, res) => {

    try {
        const profile = await Profile.findOne({user:req.user.id});

        //delete Education of a profile
        //getting the index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.exp_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
        
    } catch (error) {
        console.error(error.message);
        console.status(500).send("server error: " + error.message)
    }
});

//@Get  api/profile/github/:username {use to get the users github repos}

router.get("/github/:username", (req, res) => {
    try {
        
        const options = {
            uri: `https://api.github.com/users/${req.params.username}
            /repos?per_page=5&sort=created:asc&
            client_id=${config.get('githubClientId')}&client_secret=${config.get('githubClientSecret')}`,
            method: 'GET',
            headers:{'user-agent':'node.js'}
        };

        request(options, (error,response, body) => {
            if (error) console.error(error);

            if(response.statusCode!==200){
                res.status(404).json({msg:'No Github profile found'});
                return;
            }

            res.json(JSON.parse(body));
        });
        
    } catch (error) {
        console.error(error.message);
        console.status(500).send("server error: " + error.message)
    };
})

module.exports = router;