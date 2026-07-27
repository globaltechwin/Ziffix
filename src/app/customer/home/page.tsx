"use client";

import { FeaturedServices } from "@/components/customer/home/FeaturedServices";
import { ServiceCategories } from "@/components/customer/home/ServiceCategories";
import { QuickServices } from "@/components/customer/home/QuickServices";
import { Subscriptions } from "@/components/customer/home/Subscriptions";
import { Testimonials } from "@/components/customer/home/Testimonials";
import { Footer } from "@/components/customer/home/Footer";

export default function CustomerHomePage() {
  return (
    <div className="pb-0">
      {/* Centered content sections */}
      <div className="mx-auto max-w-5xl space-y-8 px-4 pt-6 sm:px-6">
        <FeaturedServices />
        <ServiceCategories />
      </div>

      {/* Full-width Quick Services */}
      <div className="mt-8">
        <QuickServices />
      </div>

      {/* Full-width Subscriptions */}
      <div className="mt-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Subscriptions />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}
