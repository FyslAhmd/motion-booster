'use client';

import React, { useState } from 'react';
import { Phone, Mail, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    mobile: '',
    queryDetails: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  return (
    <main className="min-h-screen bg-white pt-20">
      {/* Get in Touch Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get in Touch with Us
          </h1>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Have questions or need support? Reach out to us,
            <br />
            and we&apos;ll be happy to assist you!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Call Us Card */}
            <div className="bg-linear-to-br from-purple-50 to-white p-8 rounded-2xl border border-gray-200">
              <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Call Us</h3>
              <p className="text-gray-600 leading-relaxed">
                Call us at <span className="text-green-500 font-semibold">(+088-234-567-90)</span>, available
                <br />
                Monday to Friday, 9 AM to 5 PM.
              </p>
            </div>

            {/* Email Us Card */}
            <div className="bg-linear-to-br from-purple-50 to-white p-8 rounded-2xl border border-gray-200">
              <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Email Us</h3>
              <p className="text-gray-600 leading-relaxed">
                Send us an email at <span className="text-green-500 font-semibold">info@gmail.com</span>, and
                <br />
                we&apos;ll get back to you within 24 hours.
              </p>
            </div>

            {/* Chat with us Card */}
            <div className="bg-linear-to-br from-purple-50 to-white p-8 rounded-2xl border border-gray-200">
              <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Chat with us</h3>
              <p className="text-gray-600 leading-relaxed">
                We&apos;re here to assist you Monday through
                <br />
                Friday, from 9 AM to 5 PM EST., and we&apos;ll
                <br />
                get back to you within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text */}
            <div>
              <p className="text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-3">
                <span>ANY QUERY</span>
                <span className="h-px bg-gray-300 w-16"></span>
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Feel free to fill out this
                <br />
                form & contact us.
              </h2>
            </div>

            {/* Right Side - Form */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Full Name*
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Email*
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Company Name*
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Mobile*
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>
                </div>

                {/* Query Details */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Write Query Details*
                  </label>
                  <textarea
                    name="queryDetails"
                    value={formData.queryDetails}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all resize-none"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="bg-linear-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
