import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useRef } from "react";
export default function PaymentStatus() {
  const [params] = useSearchParams();
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const responseCode = params.get("vnp_ResponseCode");
  const orderId = params.get("vnp_TxnRef");
  const amountRaw = params.get("vnp_Amount");
  const bankCode = params.get("vnp_BankCode");
  const payDate = params.get("vnp_PayDate");

  const user = JSON.parse(localStorage.getItem("user"));
  const courseId = localStorage.getItem("currentCourseId");

  console.log("Loaded courseId:", courseId);

  const isSuccess = responseCode === "00";



const hasConfirmed = useRef(false);


useEffect(() => {
  const confirmPayment = async () => {
    if (!isSuccess || !orderId) return;
if (hasConfirmed.current) return;     
if (!courseId) return;

hasConfirmed.current = true;          


    try {
      setConfirming(true);

      const vnpData = {
        vnp_ResponseCode: responseCode,
        vnp_TxnRef: orderId,
        vnp_Amount: amountRaw,
        vnp_BankCode: bankCode,
        vnp_PayDate: payDate,
      };

      await fetch("http://localhost:8080/api/payment/vnpay/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "success",
          vnpData,
          userId: user?._id,
          courseId: courseId,
        }),
      });

      setConfirmed(true);
      localStorage.removeItem("currentCourseId");
      // Sau khi xác nhận thanh toán, gọi API để lấy thông tin user mới
try {
  const token = user?.token;

  if (token) {
    const resUser = await fetch("http://localhost:8080/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const updatedUser = await resUser.json();

    // Lưu user mới vào localStorage
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Thông báo để FE cập nhật lại Redux / giao diện
    window.dispatchEvent(new Event("storage"));
  }
} catch (err) {
  console.error("Không thể cập nhật user mới:", err);
}


    } catch (err) {
      console.error("Confirm payment error:", err);
    } finally {
      setConfirming(false);
    }
  };

  confirmPayment();
}, [isSuccess, orderId, courseId]);
 // CHỈ GIỮ 2 THAM SỐ NÀY

  const formatAmount = (raw) => {
    if (!raw) return "";
    const value = Number(raw) / 100;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

 return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="bg-white shadow-xl rounded-2xl max-w-md w-full p-8 text-center">
      {isSuccess ? (
        <>
          {/* ICON */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-green-600 mb-2">
            Payment successful
          </h1>

          <p className="text-gray-600 mb-6">
            Your transaction has been processed successfully.
          </p>

          {/* INFO */}
          <div className="space-y-2 text-sm text-gray-700 text-left">
            <div className="flex justify-between">
              <span className="font-medium">Transaction ID</span>
              <span>{orderId}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Amount</span>
              <span>{formatAmount(amountRaw)}</span>
            </div>
          </div>

          {/* STATUS */}
          <div className="mt-6">
            {confirming && (
              <p className="text-blue-600 animate-pulse">
                Updating order...
              </p>
            )}
            {confirmed && (
              <p className="text-green-600 font-medium">
                Successfully confirmed and sent email
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          {/* ICON */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Payment failed
          </h1>

          <p className="text-gray-600 mb-6">
            The transaction failed or was cancelled.
          </p>

          <div className="space-y-2 text-sm text-gray-700 text-left">
            <div className="flex justify-between">
              <span className="font-medium">Transaction ID</span>
              <span>{orderId}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Error Code</span>
              <span>{responseCode}</span>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
);

}
