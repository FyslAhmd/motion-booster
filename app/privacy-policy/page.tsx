import React from 'react';
import { Shield, Lock, ShieldCheck, Ban, UserCheck, FileText, Mail, Phone, Globe, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Motion Booster',
  description: 'Read the Motion Booster privacy policy. We do not collect, sell, or share your personal data. No cookies, no tracking, no third-party services.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 md:w-16 md:h-16" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl text-center text-red-50 max-w-3xl mx-auto">
            We are committed to protecting your privacy. Motion Booster does not collect, sell, or share
            your personal data with anyone.
          </p>
          <p className="text-sm text-center text-red-100 mt-4">
            Effective Date: March 1, 2026 &nbsp;|&nbsp; Last Updated: March 1, 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">

        {/* Quick Summary Banner */}
        <section className="mb-10 md:mb-12">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Privacy at a Glance
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'We do NOT collect personal data',
                'We do NOT sell or share your information',
                'We do NOT use cookies or tracking technologies',
                'We do NOT integrate third-party analytics or advertising services',
                'We do NOT store browsing behavior or usage patterns',
                'All communication is encrypted with SSL/TLS',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-green-800">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 1 — Introduction */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              Welcome to <strong>Motion Booster</strong> (referred to as &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
              Motion Booster is a marketing agency that provides digital marketing, graphic design, web development, and related
              professional services. This Privacy Policy explains our practices regarding data and privacy when you visit our
              website at <strong>motionbooster.com</strong> or use our services.
            </p>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg mt-4">
              We have designed our platform with a privacy-first approach. We believe your personal information belongs to you
              and you alone. Our business model does not rely on collecting, analyzing, or monetizing user data in any way.
            </p>
          </div>
        </section>

        {/* 2 — No Data Collection */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Ban className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                2. Information We Do NOT Collect
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Motion Booster does <strong>not</strong> collect any personal data from visitors or users. Specifically, we do not collect:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 text-gray-600">
              <li>Names, email addresses, phone numbers, or mailing addresses</li>
              <li>Payment or financial information (credit card numbers, bank details)</li>
              <li>IP addresses, browser fingerprints, or device identifiers</li>
              <li>Location or geolocation data</li>
              <li>Browsing history, search queries, or clickstream data</li>
              <li>Social media profiles or account credentials</li>
              <li>Demographic information such as age, gender, or occupation</li>
              <li>Any form of biometric or health-related information</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              If you contact us voluntarily via email or phone, we only use that information to respond to your inquiry.
              We do not store it in any database, and we do not use it for marketing purposes.
            </p>
          </div>
        </section>

        {/* 3 — No Data Selling or Sharing */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                3. No Data Selling or Sharing
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              We want to be absolutely clear:
            </p>
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              {[
                'We do NOT sell your personal information to anyone, for any reason, at any time.',
                'We do NOT share your information with advertisers, data brokers, or marketing companies.',
                'We do NOT trade, rent, or lease user data to third parties.',
                'We do NOT provide data to any government entity unless strictly required by a valid court order.',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                  <p className="text-gray-700 text-sm">{text}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-600 leading-relaxed mt-4">
              Since we do not collect data, there is no data to sell or share. Your visit to our website is completely private.
            </p>
          </div>
        </section>

        {/* 4 — No Cookies or Tracking */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Ban className="w-6 h-6 text-orange-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                4. No Cookies or Tracking Technologies
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our website does <strong>not</strong> use any cookies, web beacons, pixels, local storage tokens, or any other tracking technologies. This means:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 text-gray-600">
              <li>No first-party cookies are set when you visit our website</li>
              <li>No third-party cookies from advertisers or analytics providers are loaded</li>
              <li>No tracking pixels or invisible images are embedded on our pages</li>
              <li>No browser fingerprinting techniques are used</li>
              <li>No session identifiers are stored on your device</li>
              <li>No local storage or IndexedDB data is written by our website</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              You can browse our entire website without any tracking whatsoever. We respect your right to privacy
              and believe that visiting a website should not compromise your anonymity.
            </p>
          </div>
        </section>

        {/* 5 — No Third-Party Services */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6 text-purple-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                5. No Third-Party Services
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              We do <strong>not</strong> integrate any third-party services that could access your data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 text-gray-600">
              <li>No Google Analytics, Facebook Pixel, or any analytics platform</li>
              <li>No third-party advertising networks or retargeting services</li>
              <li>No social media tracking scripts or embedded widgets that monitor activity</li>
              <li>No external comment systems, live chat plugins, or customer tracking tools</li>
              <li>No content delivery networks (CDNs) that log visitor data</li>
              <li>No third-party A/B testing or heatmap tools</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              All of our website assets (fonts, images, scripts, and stylesheets) are served directly from our own
              servers. No external requests are made to third-party domains when you visit our website.
            </p>
          </div>
        </section>

        {/* 6 — Data Security */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                6. Security Measures
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Even though we do not collect personal data, we take the security and integrity of our website
              very seriously. Our security measures include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 text-gray-600">
              <li><strong>SSL/TLS Encryption:</strong> All connections to our website are encrypted using HTTPS with modern TLS protocols, ensuring data transmitted between your browser and our servers cannot be intercepted</li>
              <li><strong>Secure Infrastructure:</strong> Our servers are hosted on enterprise-grade infrastructure with firewall protection, DDoS mitigation, and intrusion detection systems</li>
              <li><strong>Regular Security Audits:</strong> We perform routine security assessments and vulnerability scans to identify and address potential threats</li>
              <li><strong>Access Controls:</strong> Strict access management ensures that only authorized personnel can manage website content and server configurations</li>
              <li><strong>Secure Development Practices:</strong> Our code follows industry best practices, including input validation, output encoding, and protection against common web vulnerabilities (XSS, CSRF, SQL injection)</li>
              <li><strong>Regular Updates:</strong> All software, frameworks, and dependencies are kept up to date with the latest security patches</li>
            </ul>
          </div>
        </section>

        {/* 7 — User Rights */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-indigo-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                7. Your Privacy Rights
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Since we do not collect any personal data, there is no information about you stored in our systems.
              However, we respect all applicable data protection regulations and acknowledge your rights under
              laws such as the GDPR (General Data Protection Regulation), CCPA (California Consumer Privacy Act),
              and other regional privacy laws:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 text-gray-600">
              <li><strong>Right to Know:</strong> You may ask what data we have about you — in our case, the answer is none</li>
              <li><strong>Right to Deletion:</strong> You may request deletion of data — since we store none, there is nothing to delete</li>
              <li><strong>Right to Opt-Out:</strong> You may opt out of data sales — we do not sell any data</li>
              <li><strong>Right to Non-Discrimination:</strong> We will never treat you differently based on exercising your privacy rights</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              If you have any questions about your rights or wish to make a privacy-related request, please contact
              us using the information in the Contact section below.
            </p>
          </div>
        </section>

        {/* 8 — Children's Privacy */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              8. Children&apos;s Privacy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Our services are intended for a general audience and are not directed to children under the age of 13
              (or the applicable age in your jurisdiction). We do not knowingly collect any personal information from
              children. Since we do not collect data from any user, children who visit our website are equally protected.
              If a parent or guardian believes that their child has somehow provided personal information to us, they
              may contact us and we will promptly investigate and take appropriate action.
            </p>
          </div>
        </section>

        {/* 9 — External Links */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              9. External Links
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Our website may contain links to external websites that are not operated by us. If you click on a
              third-party link, you will be directed to that third party&apos;s site. We strongly advise you to review
              the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the
              content, privacy policies, or practices of any third-party sites or services.
            </p>
          </div>
        </section>

        {/* 10 — Data Retention */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              10. Data Retention
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We do not retain any personal data because we do not collect any. Server access logs, if generated by
              our hosting provider for operational and security purposes, are automatically purged on a regular basis
              and are never used for tracking, profiling, or marketing.
            </p>
          </div>
        </section>

        {/* 11 — Changes */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal,
              operational, or regulatory reasons. Any changes will be posted on this page with an updated
              &ldquo;Last Updated&rdquo; date. We encourage you to review this page periodically. Your continued use
              of our website after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </div>
        </section>

        {/* 12 — Governing Law */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              12. Governing Law
            </h2>
            <p className="text-gray-600 leading-relaxed">
              This Privacy Policy is governed by and construed in accordance with the laws of Bangladesh. Any disputes
              relating to this policy shall be subject to the exclusive jurisdiction of the courts in Dhaka, Bangladesh.
            </p>
          </div>
        </section>

        {/* Contact Us */}
        <section className="mb-10 md:mb-12">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              13. Contact Us
            </h2>
            <p className="mb-6 text-red-50">
              If you have any questions, concerns, or requests regarding this Privacy Policy, please do not hesitate
              to contact us:
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Motion Booster</p>
                  <p className="text-sm text-red-50">Marketing Agency &amp; Digital Solutions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <a href="mailto:info@motionbooster.com" className="text-red-50 hover:underline">
                    info@motionbooster.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Phone</p>
                  <a href="tel:+8801790939394" className="text-red-50 hover:underline">
                    +880 1790-939394
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Website</p>
                  <a href="https://motionbooster.com" className="text-red-50 hover:underline">
                    motionbooster.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
