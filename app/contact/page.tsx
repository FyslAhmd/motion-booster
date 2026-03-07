'use client';

import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    mobile: '',
    queryDetails: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <main className="min-h-screen bg-white pb-16 lg:pb-0">

      {/* Hero */}
      <section className="py-20 lg:py-32 bg-linear-to-br from-red-50 via-white to-rose-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-sm font-semibold mb-4">Contact Us</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get in Touch with Us
          </h1>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Have questions or need support? Reach out to us and we&apos;ll be happy to assist you!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-7 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-red-100 transition-all">
              <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-5">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                <span className="text-red-500 font-semibold">+880 1790-939394</span><br />
                Mon–Fri, 9 AM to 6 PM
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-red-100 transition-all">
              <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-5">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                <span className="text-red-500 font-semibold">info@motionbooster.com</span><br />
                We reply within 24 hours
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-red-100 transition-all">
              <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Chat with our team<br />
                Mon–Fri, 9 AM to 6 PM
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Map + Form */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Map Block */}
          <div className="space-y-5">
            <div>
              <p className="text-red-500 uppercase tracking-wider text-sm font-semibold mb-2">Our Location</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Find Us on the Map</h2>
              <p className="text-gray-500 text-sm">Visit our office at New Market, Dhaka. We&apos;re open Monday–Friday, 9 AM to 6 PM.</p>
            </div>

            {/* Stylized Map Card */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-md bg-gray-50" style={{ height: '340px' }}>
              {/* Embedded Google Map */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.2783970255024!2d90.38493427601946!3d23.733889778702644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8eef3c90e8b%3A0x7b5d9e8b1f204c49!2sNew%20Market%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1708700000000!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Motion Booster Location"
              />

              {/* Floating info card on map */}
              <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 max-w-xs">
                <div className="w-9 h-9 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm">Motion Booster</p>
                  <p className="text-gray-500 text-xs">New Market, Dhaka, Bangladesh</p>
                </div>
              </div>
            </div>

            {/* Info rows */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-red-50 rounded-xl p-4">
                <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Address</p>
                  <p className="text-sm font-semibold text-gray-800">New Market, Dhaka</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-red-50 rounded-xl p-4">
                <Clock className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Office Hours</p>
                  <p className="text-sm font-semibold text-gray-800">Mon–Fri, 9–6 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Send a Message</h3>
            <p className="text-gray-500 text-sm mb-6">Fill out the form and we&apos;ll get back to you within 24 hours.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1.5">Full Name*</label>
                  <input
                    type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1.5">Email*</label>
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange} required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1.5">Company Name</label>
                  <input
                    type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                    placeholder="Your Company"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1.5">Mobile*</label>
                  <input
                    type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required
                    placeholder="+880 1xxx-xxxxxx"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium text-sm mb-1.5">Message*</label>
                <textarea
                  name="queryDetails" value={formData.queryDetails} onChange={handleChange} required rows={5}
                  placeholder="Tell us how we can help you..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all resize-none text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all shadow hover:shadow-lg"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

