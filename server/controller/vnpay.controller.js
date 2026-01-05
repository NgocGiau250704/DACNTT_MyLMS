// server/controller/vnpay.controller.js
import { createPaymentUrl } from "../services/vnpay.service.js";
// import Order from "../models/Order.js"; // nếu cậu có model Order thì bật dòng này
import { sendEmail } from "../utils/email.js";
import { User } from "../models/user.model.js";

import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";


export const createVnpayPayment = async (req, res) => {
  try {
    const { amount, orderId, orderInfo, courseId, userId } = req.body;

    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip;

    // TODO: nếu muốn, tạo order "pending" ở đây
    // await Order.create({
    //   code: orderId,
    //   user: userId,
    //   course: courseId,
    //   amount,
    //   status: "pending",
    // });

    const paymentUrl = createPaymentUrl({
      amount,
      orderId,
      orderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
      ipAddr,
    });

    return res.json({
      success: true,
      paymentUrl,
      orderId,
    });
  } catch (err) {
    console.error("VNPay create error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error when creating VNPay payment",
    });
  }
};


export const confirmVnpayPayment = async (req, res) => {
  try {
    console.log("🔥 FE gọi confirm:", req.body);

    const { orderId, status, vnpData, userId, courseId } = req.body;
    // status = "success" | "fail"

    // TODO: cập nhật order trong DB
    // if (status === "success") {
    //   await Order.findOneAndUpdate(
    //     { code: orderId },
    //     {
    //       status: "paid",
    //       paidAt: new Date(),
    //       paymentGateway: "vnpay",
    //       vnpData,
    //     }
    //   );
    // } else {
    //   await Order.findOneAndUpdate(
    //     { code: orderId },
    //     { status: "failed" }
    //   );
    // }

   
if (status === "success") {
  const user = await User.findById(userId);
  const course = await Course.findById(courseId);

  if (!user || !course) {
    return res.status(404).json({
      success: false,
      message: "User or Course not found",
    });
  }

  
  if (!user.enrolledCourses.includes(courseId)) {
    user.enrolledCourses.push(courseId);
    await user.save();
  }

  
  if (!course.enrolledStudents.includes(userId)) {
    course.enrolledStudents.push(userId);
    await course.save();
  }


  await sendEmail(
    user.email,
   "Payment Confirmation",
`
  <h2>Hello ${user.name},</h2>

  <p>Your payment for the following course has been completed successfully:</p>
  <h3>${course.courseTitle}</h3>

  <p>The course has now been activated on your account.</p>
  <p>Please log in and visit the <strong>My Courses</strong> section to start learning.</p>

  <br/>
  <p>Thank you for choosing MyLMS ❤️</p>
  <hr/>
  <p style="font-size:12px;color:#666">
    This email was automatically sent from the MyLMS system.
  </p>
`
  );
  await CoursePurchase.create({
  courseId,
  userId,
  amount: Number(vnpData.vnp_Amount) / 100,
  status: "completed",
  paymentId: orderId,
});

  console.log(" Enroll course + update course + send email DONE");
}

   


    return res.json({
      success: true,
      message: "Payment status updated",
    });

  } catch (err) {
    console.error("VNPay confirm error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error when confirming VNPay payment",
    });
  }
};

