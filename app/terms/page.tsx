import React from 'react';
import Link from 'next/link';
import { FileText, CheckCircle, Shield, AlertTriangle, Scale, Mail } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | Motion Booster',
  description:
    'Read the Motion Booster Terms & Conditions for account registration and use of services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="bg-linear-to-r from-red-500 to-red-600 text-white pt-20 pb-12 md:pt-24 md:pb-16 lg:pt-32 lg:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/70 bg-white/10 flex items-center justify-center">
              <FileText className="w-9 h-9 md:w-11 md:h-11" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-lg md:text-xl text-center text-red-50 max-w-3xl mx-auto">
            Please read these terms carefully before creating an account or using Motion Booster services.
          </p>
          <p className="text-sm text-center text-red-100 mt-4">
            Effective Date: March 16, 2026 &nbsp;|&nbsp; Last Updated: March 16, 2026
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 space-y-6">
        <section className="bg-green-50 border border-green-200 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-green-900 mb-4 flex items-start gap-2">
            <CheckCircle className="w-6 h-6 shrink-0 mt-1 text-green-600" />
            Quick Summary
          </h2>
          <ul className="space-y-2 text-sm text-green-800">
            <li>You must provide accurate account information during registration.</li>
            <li>You are responsible for your account credentials and activity.</li>
            <li>Any abusive, illegal, or harmful use is strictly prohibited.</li>
            <li>Service scope, pricing, and delivery timelines are agreed per project.</li>
            <li>By registering, you accept these terms and our privacy policy.</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-start gap-2">
            <FileText className="w-6 h-6 shrink-0 mt-1 text-red-500" />
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing this website, creating an account, or using any Motion Booster services, you agree to be
            legally bound by these Terms &amp; Conditions. If you do not agree, please do not use the platform.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-start gap-2">
            <Shield className="w-6 h-6 shrink-0 mt-1 text-blue-500" />
            2. Account Registration
          </h2>
          <ul className="space-y-2 text-gray-600 leading-relaxed">
            <li>You must provide true, complete, and updated information.</li>
            <li>You must keep your password confidential and secure.</li>
            <li>You are responsible for all actions performed through your account.</li>
            <li>We may suspend accounts that contain false information or violate these terms.</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-start gap-2">
            <Scale className="w-6 h-6 shrink-0 mt-1 text-indigo-500" />
            3. Services and Project Terms
          </h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Motion Booster offers digital marketing, design, animation, web development, app development, and related
            support services. Each project may include a separate scope, timeline, and commercial terms.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Delivery timelines depend on client feedback, approval cycles, and scope changes. Delays caused by missing
            client inputs are not considered a service breach.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-start gap-2">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-1 text-orange-500" />
            4. Prohibited Use
          </h2>
          <ul className="space-y-2 text-gray-600 leading-relaxed">
            <li>Using the platform for unlawful, fraudulent, or abusive purposes.</li>
            <li>Attempting unauthorized access to systems, data, or user accounts.</li>
            <li>Uploading harmful, malicious, or misleading content.</li>
            <li>Violating intellectual property rights of Motion Booster or third parties.</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-start gap-2">
            <FileText className="w-6 h-6 shrink-0 mt-1 text-red-500" />
            5. Payments, Refunds, and Cancellations
          </h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Project fees, billing cycles, and payment terms are communicated during project confirmation. Unless stated
            otherwise in a written agreement, payments are non-refundable once work has started.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Cancellation requests are reviewed case by case based on work completed at the time of request.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-start gap-2">
            <Shield className="w-6 h-6 shrink-0 mt-1 text-blue-500" />
            6. Intellectual Property
          </h2>
          <p className="text-gray-600 leading-relaxed">
            All website content, branding, design elements, and proprietary assets remain the property of Motion
            Booster unless explicitly transferred in writing. Client-provided assets remain the client&apos;s property.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-start gap-2">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-1 text-orange-500" />
            7. Limitation of Liability
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Motion Booster is not liable for any indirect, incidental, or consequential damages arising from use of
            the platform or services. Our maximum liability is limited to the amount paid by you for the relevant
            service under dispute.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-start gap-2">
            <CheckCircle className="w-6 h-6 shrink-0 mt-1 text-green-500" />
            8. Updates to Terms
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We may update these Terms &amp; Conditions from time to time. Updated terms become effective once published
            on this page. Continued use of the platform means you accept the latest version.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-start gap-2">
            <Mail className="w-6 h-6 shrink-0 mt-1 text-red-500" />
            9. Contact
          </h2>
          <p className="text-gray-600 leading-relaxed mb-2">
            If you have any questions about these terms, contact us at:
          </p>
          <p className="text-gray-700 font-medium">hello@motionbooster.com</p>
        </section>

        <section className="text-center pt-2">
          <p className="text-sm text-gray-500">
            Also review our{' '}
            <Link href="/privacy-policy" className="text-red-500 hover:text-red-600 font-medium">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
