import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.router.js";
import mediaRoute from "./routes/media.route.js";
import reviewRoute from "./routes/review.router.js";
import vnpayRoutes from "./routes/vnpay.routes.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import dashboardRoutes from "./routes/instructor.route.js";
import assignMentRoute from "./routes/assignment.route.js";
import submissionRoute from "./routes/submission.route.js";
import instructorRoute from "./routes/instructor.route.js";
import chatRoute from "./routes/chat.route.js";



import { createServer } from "http";
import { Server } from "socket.io";
import conversationRoute from "./routes/conversation.route.js";
import messageRoute from "./routes/message.route.js";


dotenv.config({});
// import verifyRoute from "./routes/user.route.js";

// call database connection here
connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 8080;

//define middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "https://dacntt-my-lms.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"], 
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use("/api/payment", vnpayRoutes);
//api

app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/v1/progress", courseProgressRoute);
// app.use("/api/v1/review", reviewRoute);

// "http://localhost:8080/api/v1/user/register"
// app.get("/api/v1/user/register", (_, res) => {
//     res.status(200).json({
//         success: true,
//         message: "Welcome to LMS API"
//     })
// });

// app.use("/", verifyRoute);
app.use("/api/v1/conversations", conversationRoute);
app.use("/api/v1/messages", messageRoute);

app.use("/api/v1/assignment", assignMentRoute);
app.use("/api/v1/submission", submissionRoute);

app.use("/api/v1/instructor", instructorRoute);


app.use("/api/v1/chat", chatRoute);

//app.listen(PORT, () => {
//    console.log(`Server listen at port ${PORT}`);
//})

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running perfectly!"
    });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "https://dacntt-my-lms.vercel.app",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("send_message", async (data) => {
    try {
      const { conversationId, senderId, content } = data;
      if (!content || !content.trim()) return;

      const { default: Message } = await import("./models/message.model.js");
      const { default: Conversation } = await import("./models/Conversation.model.js");

      const msg = await Message.create({
        conversationId,
        senderId,
        content,
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: content,
        lastMessageAt: new Date(),
      });

      io.to(conversationId).emit("receive_message", msg);
    } catch (e) {
      console.error("send_message error:", e);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listen at port ${PORT}`);
});


