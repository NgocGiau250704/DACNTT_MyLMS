// import jwt from "jsonwebtoken";

// export const generateToken = (res, user, message) => {
//   const token = jwt.sign(
//     { id: user._id, role: user.role },
//     process.env.SECRET_KEY,
//     { expiresIn: "1h" }
//   );
//   return res
//     .status(200)
//     .cookie("token", token, {
//       httpOnly: true,
//       sameSite: "strict",
//       maxAge: 24 * 40 * 60 * 1000,
//     }).json({
//         success: true,
//         message,
//         user
//     });
// };
import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.SECRET_KEY,
    { expiresIn: "7h" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "none",  // quan trọng
    secure: true,      // bắt buộc nếu dùng sameSite: none mới sửa lại thành false ngày 9-12
    maxAge: 24 * 60 * 60 * 1000, // 1 ngày
  });

  return res.status(200).json({
    success: true,
    message,
    token,
    user,
  });
};
