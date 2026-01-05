import React, { useState } from "react";
import {
  QrCode,
  CreditCard,
  Lock,
  ChevronLeft,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useGetCourseByIdQuery } from "../../features/api/purchaseApi";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [qrUrl, setQrUrl] = useState(""); 
  const {
    data: courseData,
    isLoading,
    error,
  } = useGetCourseByIdQuery(courseId);

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!courseData) {
    return (
      <div className="mt-20 text-center text-gray-500">
        Loading course information...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-20 text-center text-gray-500">
        Loading course information...
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="mt-20 text-center text-red-500">
        Failed to load course data.
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

const handlePaymentVNPay = async () => {
  const user = JSON.parse(localStorage.getItem("user"));


localStorage.setItem("currentCourseId", courseId);
console.log("Saved courseId:", courseId);


  const res = await fetch("http://localhost:8080/api/payment/vnpay/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: courseData.course.coursePrice,
      orderId: Date.now().toString(),
      orderInfo: `Thanh toan khoa hoc ${courseData.course.courseTitle}`,
      courseId,
      userId: user?._id,
    }),
  });

  const data = await res.json();
  if (data.success) window.location.href = data.paymentUrl;
};

const createVnpayUrl = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  localStorage.setItem("currentCourseId", courseId);

  const res = await fetch("http://localhost:8080/api/payment/vnpay/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: courseData.course.coursePrice,
      orderId: Date.now().toString(),
      orderInfo: `Thanh toan khoa hoc ${courseData.course.courseTitle}`,
      courseId,
      userId: user?._id,
    }),
  });

  const data = await res.json();
  if (data.success) return data.paymentUrl;
  throw new Error(data.message || "Cannot create payment url");
};

const handlePay = async () => {
  setIsProcessing(true);
  try {
    const paymentUrl = await createVnpayUrl();

    if (paymentMethod === "qr") {
      setQrUrl(paymentUrl);        
      return;                     
    }

    // card/other -> redirect như cũ
    window.location.href = paymentUrl;
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <div className="mt-20 space-y-10">
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white hover:text-blue-400 mb-8 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Course Details
          </button>

          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            <div className="lg:col-span-7">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Checkout
              </h2>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Billing Info
                </h3>
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                      placeholder="Ngọc Giàu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Payment Method
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center justify-center p-4 border rounded-lg transition-all ${
                      paymentMethod === "card"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    <span className="font-medium">Credit Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("qr")}
                    className={`flex items-center justify-center p-4 border rounded-lg transition-all ${
                      paymentMethod === "qr"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    <span className="font-medium">VNPay / Momo</span>
                  </button>
                </div>

                {paymentMethod === "card" ? (
                  <form
                  //  onSubmit={handlePayment}
                    className="space-y-4 animate-fadeIn"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Card Number
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3 pl-4"
                          placeholder="0000 0000 0000 0000"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Expiration Date
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          CVC
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-6 animate-fadeIn">
    {!qrUrl ? (
      <p className="text-sm text-gray-500">
       Click Pay to generate a QR code
      </p>
    ) : (
      <>
        <div className="inline-block p-3 bg-white rounded-lg border">
          <QRCodeCanvas value={qrUrl} size={220} />
        </div>

        <div className="mt-3 text-xs text-gray-500 break-all">
          {qrUrl}
        </div>

        <button
          className="mt-3 text-sm underline"
          onClick={() => window.open(qrUrl, "_blank")}
        >
          Open Payment Link
        </button>
      </>
    )}
  </div>
)}

  <button
  onClick={handlePay}
  disabled={isProcessing}
  className="w-full mt-6 bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:bg-blue-300 flex justify-center items-center"
>
  {isProcessing ? (
    <span className="flex items-center">
      <svg
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      Processing...
    </span>
  ) : (
    `Pay ${formatCurrency(courseData.course.coursePrice)}`
  )}
</button>



                <p className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center">
                  <Lock className="w-3 h-3 mr-1" />
                  Payments are secure and encrypted.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0 lg:col-span-5">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden sticky top-6">
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">
                    Order Summary
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex gap-4 mb-6">
                    <div className="w-24 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=150&q=80"
                        alt="Course"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-2">
                        {courseData.course.courseTitle}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        By {courseData.course.creator.name}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Original Price</span>
                      <span className="line-through text-gray-400">
                        {formatCurrency(courseData.course.coursePrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Discount</span>
                      <span className="text-green-600 font-medium">-33%</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                      <span>Total</span>
                      <span className="text-blue-600">
                        {formatCurrency(courseData.course.coursePrice)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 bg-blue-50 p-4 rounded-md">
                    <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">
                      What's included:
                    </h5>
                    <ul className="space-y-2">
                      <li className="flex items-start text-xs text-blue-700">
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        Lifetime access to all content
                      </li>
                      <li className="flex items-start text-xs text-blue-700">
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        Certificate of completion
                      </li>
                      <li className="flex items-start text-xs text-blue-700">
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        Access to source code
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
