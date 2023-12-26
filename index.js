import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import "ejs";
import _ from "lodash";
import mongoose from "mongoose";
import favicon from "serve-favicon";
import path from "path";

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
const __dirname = path.resolve();
const PORT = 3000 || process.env.PORT;

const posts = [];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));


//Connect to Mongo database
mongoose.set("strictQuery", true);
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

    } catch (error) {
        console.log(error.message);
        process.exit(1);

    }
}

//Create a posts schema
const { Schema } = mongoose;

const postsSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: String },
},
    { timestamps: true }
);

//Create a messages Schema
const messagesSchema = new Schema({
    fName: {type:String, required:true},
    lName: {type:String, required:true},
    phoneNo: {type:String},
    email: {type:String, required: true},
    message: {type:String, required: true},
},
{timestamps:true}
);

//Create a model for the postsSchema
const Post = new mongoose.model("Post", postsSchema);

//Create a model for the messagesSchema
const Message = new mongoose.model("Message", messagesSchema);

app.get("/", async (req, res) => {
    try {
        res.render("home.ejs");
        //res.redirect("/");
    } catch (error) {
        console.log(error.message);
    }
});

app.get("/about", (req, res) => {
    try {
        res.render("about.ejs", { about: aboutContent });
    } catch (error) {
        console.log(error.message);
    }
});

app.get("/contact", (req, res) => {
    try {
        res.render("contact.ejs", { contactUs: contactContent });
    } catch (error) {
        console.log(error.message);
    }
});

app.get("/blogs", async (req, res) => {
    try {
        const existingPosts = await Post.find({});
        if (existingPosts) {
            res.render("blogs.ejs", {
                startingContent: homeStartingContent,
                posts: existingPosts
            });
        }
    } catch (error) {
        console.log(error.message);
    }
});

app.get("/services", (req, res) => {
    try {
        res.render("services.ejs");
    } catch (error) {
        console.log(error.message);
    }
});

app.get("/compose", (req, res) => {
    try {
        res.render("compose.ejs");
    } catch (error) {
        console.log(error.message);
    }
});

app.post("/compose", async (req, res) => {
    try {
        const today = new Date();

        const timeOptions = {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false,
        };

        const post = {
            title: req.body.postTitle,
            content: req.body.postBody,
            author: req.body.authorName,
            date: today.toLocaleDateString("en-US", timeOptions)
        };
        // Prevent additional documents from being inserted if one fails
        //const options = { ordered: true };

        //posts.push(post);
        Post.create(post);
        console.log(`Post with id ${req.params._id} posted successfully.`);
        res.redirect("/blogs");

    } catch (error) {
        console.log(error.message);
    }

});

app.post("/contact", async(req, res)=>{
    try{

        const message = {
            fName: req.body.firstName,
    lName: req.body.lastName,
    phoneNo: req.body.phoneNumber,
    email: req.body.emailAddress,
    message: req.body.messageBody
        };

        Message.create(message);
        console.log(`You have received a new message from ${req.params.fName}`);
        res.redirect("/contact");
    }
    catch(error){
        console.log(error.message);
    }
});

app.get("/posts/:id", async (req, res) => {
    try {
        //const requestedTitle = _.lowerCase(req.params.postName);
        const id = req.params._id;
        //console.log(req.params._id);

        const foundPost = await Post.find(id);
        posts.forEach(function (post) {
            //const storedTitle = _.lowerCase(post.title);

            if (foundPost) {
                res.render("post.ejs", {
                    title: post.title,
                    date: post.date,
                    content: post.content,
                    author: post.author,
                });
            }
        });

    } catch (error) {
        console.log(error.message);
    }

});


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening for requests on port ${PORT}`);
    });
});
//app.listen(3000, function() {
 // console.log("Server started on port 3000");
//});
