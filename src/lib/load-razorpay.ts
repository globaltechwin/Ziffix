export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) {
      let attempts = 0;
      const check = setInterval(() => {
        if (window.Razorpay || ++attempts > 20) {
          clearInterval(check);
          resolve(!!window.Razorpay);
        }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      let attempts = 0;
      const check = setInterval(() => {
        if (window.Razorpay || ++attempts > 20) {
          clearInterval(check);
          resolve(!!window.Razorpay);
        }
      }, 100);
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
