const Post = require("../models/postModel");
const User = require("../models/userModel");
const slugify = require("slugify");
const sanitizeHtml = require("sanitize-html");
// const cloudinary = require("cloudinary");
// const ImageKit = require("imagekit");
const ImageKit = require("../utils/imageKit");
const fs = require("fs");

// post stats
exports.getPostStats = async (req, res) => {
  console.log("⚡ getPostStats controller called");
  try {
    const now = new Date();
    // start of the current week (sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // start of the current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // start of the current year
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    // total posts

    const [weekly, monthly, yearly, all] = await Promise.all([
      Post.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Post.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Post.countDocuments({ createdAt: { $gte: startOfYear } }),
      Post.countDocuments(),
    ]);
    console.log("Post stats", { weekly, monthly, yearly, all });
    return res.status(200).json({ weekly, monthly, yearly, all });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch post stats" });
  }
};

// total posts per user
exports.totalPostsPerUser = async (req, res) => {
  try {
    const result = await Post.aggregate([
      // stage 1
      {
        $group: {
          _id: "$author", // Group all posts by author ID
          totalPosts: { $sum: 1 }, // Count how many posts per author
        },
      },
      // stage 2
      {
        $lookup: {
          from: "users", // Name of the collection to join with
          localField: "_id", // Field from this pipeline (author id)
          foreignField: "_id", // Field from 'users' collection to match with
          as: "authorInfo", // The joined user document will appear under this field
        },
      },
      // stage 3
      {
        $unwind: "$authorInfo", // flattens the authorInfo array into single object
      },
      // stage 4
      {
        $project: {
          _id: 0,
          authorName: "$authorInfo.name",
          authorEmail: "$authorInfo.email",
          totalPosts: 1,
        },
      },
      // stage 5
      {
        $sort: { toatalPosts: -1 }, // this sorts the authors by total posts in descending order, so the most activeauthors come first
      },
    ]);
    console.log("count:", result);
    res.status(200).json(result);
  } catch (error) {
    console.log("Aggregation error:", error);
    res.status(500).json({ message: "server error" });
  }
};

// create post
exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const file = req.file;
    console.log("file:", req.file);
    console.log({ title, category, file, content });

    if (!title || !content || !file) {
      return res
        .status(400)
        .json({ message: "All fields including image are required" });
    }
    const uploaded = await ImageKit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: "/blogs",
    });
    const imageURl = uploaded.url; //  use this directly

    const post = new Post({
      image: imageURl,
      title,
      content,
      category: category || "Uncategorized",
      slug: slugify(title, { lower: true }) + "-" + Date.now(),
      author: req.user._id,
      publishedAt: new Date(),
    });

    await post.save();

    return res.status(201).json({ message: "Post created", post });
  } catch (err) {
    console.error(" Error creating post:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
// getAll posts (public feed)
exports.getAllPosts = async (req, res) => {
  // console.log("POST GET BODY:", req.body);
  try {
    const posts = await Post.find()
      .populate("author", "name")
      .sort({ createdAt: -1 });
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch posts" });
  }
};

// get one post by ID
exports.getOnePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name");
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: "Post not found" });
  }
};

//  Get posts of the logged-in user
exports.getOwnPosts = async (req, res) => {
  try {
    console.log("[GET OWN POSTS] req.user:", req.user);
    const posts = await Post.find({ author: req.user.id }).sort({
      createdAt: -1,
    });
    console.log(
      `[GET OWN POSTS] Found ${posts.length} posts for user ${req.user.id}`
    );
    return res.status(200).json({ posts });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user's posts" });
  }
};

// update user posts
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //  Check if current user is the owner
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { title, content } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;

    await post.save();

    return res.status(200).json({ message: "Post updated", post });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update post", error: error.message });
  }
};

// delete own post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }
    // && means: block only if not author AND not admin → this is correct.
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await post.deleteOne();
    return res.status(200).json({ message: "post deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete post" });
  }
};

// Admin : view all posts
exports.getAdminAllposts = async (req, res) => {
  try {
    const posts = Post.find()
      .populate("author", "name email")
      .sort({ publishedAt: -1 });
    return res.status(200).json({ message: "Admin view", posts });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch posts for admin" });
  }
};
