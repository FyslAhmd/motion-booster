import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';

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
            Your privacy is important to us. Learn how we collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-center text-red-100 mt-4">
            Last Updated: February 28, 2026
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        
        {/* Introduction */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              Welcome to Motion Booster. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our website 
              or use our services and tell you about your privacy rights and how the law protects you.
            </p>
          </div>
        </section>

        {/* Information We Collect */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Information We Collect
              </h2>
            </div>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Name, email address, and phone number</li>
                  <li>Username and password</li>
                  <li>Profile information and preferences</li>
                  <li>Payment and billing information</li>
                  <li>Course enrollment and progress data</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">Technical Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>IP address and browser type</li>
                  <li>Device information and operating system</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Usage data and analytics</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                How We Use Your Information
              </h2>
            </div>
            <div className="space-y-3 text-gray-600 leading-relaxed">
              <p>We use the information we collect for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>To provide and maintain our services</li>
                <li>To process your course enrollments and payments</li>
                <li>To send you important updates and notifications</li>
                <li>To improve and personalize your learning experience</li>
                <li>To respond to your queries and provide customer support</li>
                <li>To analyze usage patterns and improve our platform</li>
                <li>To send promotional materials (with your consent)</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Data Security
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              We have implemented appropriate security measures to prevent your personal data from being accidentally lost, 
              used, or accessed in an unauthorized way. Our security measures include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 text-gray-600">
              <li>Encrypted data transmission using SSL/TLS protocols</li>
              <li>Secure password storage with industry-standard hashing</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Limited access to personal data by authorized personnel only</li>
              <li>Regular backups to prevent data loss</li>
            </ul>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-purple-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Your Privacy Rights
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Under data protection laws, you have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 text-gray-600">
              <li><strong>Right to Access:</strong> Request copies of your personal data</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Restrict Processing:</strong> Request limitation on data use</li>
              <li><strong>Right to Data Portability:</strong> Request transfer of your data</li>
              <li><strong>Right to Object:</strong> Object to processing of your data</li>
            </ul>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-orange-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Cookies and Tracking
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to track activity on our website and store certain information. 
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Types of Cookies We Use:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2 text-gray-600 text-sm">
                <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Track your online activity to deliver relevant ads</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Third-Party Services */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Third-Party Services
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may share your information with trusted third-party service providers who assist us in operating our website, 
              conducting our business, or serving our users. These parties include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 text-gray-600">
              <li>Payment processors for handling transactions</li>
              <li>Cloud storage providers for data hosting</li>
              <li>Email service providers for communications</li>
              <li>Analytics services for usage insights</li>
              <li>Customer support platforms</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              All third parties are required to maintain the confidentiality and security of your personal information.
            </p>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Data Retention
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this 
              privacy policy, unless a longer retention period is required or permitted by law. When we no longer need your 
              information, we will securely delete or anonymize it.
            </p>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Children's Privacy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Our services are not directed to individuals under the age of 13. We do not knowingly collect personal 
              information from children under 13. If you are a parent or guardian and believe your child has provided 
              us with personal information, please contact us immediately.
            </p>
          </div>
        </section>

        {/* Changes to Policy */}
        <section className="mb-10 md:mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Changes to This Privacy Policy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy 
              Policy periodically for any changes.
            </p>
          </div>
        </section>

        {/* Contact Us */}
        <section className="mb-10 md:mb-12">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Contact Us
            </h2>
            <p className="mb-6 text-red-50">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Motion Booster</p>
                  <p className="text-sm text-red-50">Leading IT Training Institute</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Email:</p>
                  <a href="mailto:info@motionbooster.com" className="text-red-50 hover:underline">
                    info@motionbooster.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Phone:</p>
                  <a href="tel:+8801790939394" className="text-red-50 hover:underline">
                    +880 1790-939394
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
