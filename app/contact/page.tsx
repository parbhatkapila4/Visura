"use client";
import Link from "next/link";
import { ArrowLeft, Mail, ArrowRight, Twitter, Linkedin, Github } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    subject: "",
    email: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid =
      formData.email.trim() &&
      formData.subject.trim() &&
      formData.company.trim() &&
      formData.message.trim();

    if (!isValid) {
      toast.error("Please fill in email, subject, company, and message before submitting.");
      return;
    }

    toast.success("Your message has been successfully delivered.");
  };

  const isFormValid =
    formData.email.trim() &&
    formData.subject.trim() &&
    formData.company.trim() &&
    formData.message.trim();

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <div className="bg-black text-white py-16">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Get in touch with our team for support, questions, or collaboration opportunities.
          </p>
        </div>
      </div>

      <div className="py-16 lg:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 shadow-xl border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)] gap-10 lg:gap-14 xl:gap-20">
              <div className="space-y-8 lg:space-y-10">
                <div>
                  <h2 className="text-4xl font-bold text-black mb-6">Let's collaborate</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <a
                        href="mailto:parbhat@parbhat.dev"
                        className="text-lg text-gray-600 hover:text-black transition-colors"
                      >
                        parbhat@parbhat.dev
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <div>
                    <h3 className="text-sm font-semibold text-black tracking-[0.16em] uppercase mb-3">
                      Find us
                    </h3>
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                      <a
                        href="https://x.com/Parbhat03"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                        <span className="text-sm">Twitter</span>
                      </a>
                      <a
                        href="https://www.linkedin.com/in/parbhat-kapila/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                      <a
                        href="https://github.com/parbhatkapila4/Visura"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
                      >
                        <Github className="w-5 h-5" />
                        <span className="text-sm">GitHub</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-6 lg:mb-8">
                  <p className="text-xs font-semibold text-gray-500 tracking-[0.18em] uppercase mb-2">
                    Contact form
                  </p>
                  <h3 className="text-2xl lg:text-3xl font-bold text-black">Say hello</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-6 lg:space-y-7">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          NAME
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your name"
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:outline-none text-lg text-black placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          COMPANY
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="Your company"
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:outline-none text-lg text-black placeholder-gray-400"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          MESSAGE
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Start typing here"
                          rows={4}
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:outline-none text-lg text-black placeholder-gray-400 resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          SUBJECT
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:outline-none text-lg text-black placeholder-gray-400"
                        >
                          <option value="">Choose subject</option>
                          <option value="general">General Inquiry</option>
                          <option value="support">Technical Support</option>
                          <option value="partnership">Partnership</option>
                          <option value="feedback">Feedback</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          EMAIL
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Email address"
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-black focus:outline-none text-lg text-black placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={!isFormValid}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors group ${
                        isFormValid
                          ? "bg-black text-white hover:bg-gray-800"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Submit
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
