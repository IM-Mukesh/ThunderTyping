// app/contact/ContactClient.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: number;
}

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactClient() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [showSubmissions, setShowSubmissions] = useState(false);

  // Load submissions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("contact.submissions");
    if (stored) {
      try {
        setSubmissions(JSON.parse(stored));
      } catch (error) {
        console.error("Error parsing stored submissions:", error);
      }
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newSubmission: ContactSubmission = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim(),
      timestamp: Date.now(),
    };

    const updatedSubmissions = [newSubmission, ...submissions];
    setSubmissions(updatedSubmissions);

    // Save to localStorage
    localStorage.setItem(
      "contact.submissions",
      JSON.stringify(updatedSubmissions)
    );

    // Reset form
    setFormData({ name: "", email: "", message: "" });
    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left Column - Content */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Have questions, feedback, or suggestions? We'd love to hear from
              you. Our team responds to all messages within 48 hours.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-neutral-800/30 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="text-cyan-400" size={20} />
                <h3 className="text-white font-semibold">Email Support</h3>
              </div>
              <p className="text-neutral-400 text-sm">
                Get detailed help via email. We respond within 48 hours.
              </p>
            </div>

            <div className="bg-neutral-800/30 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-indigo-400" size={20} />
                <h3 className="text-white font-semibold">Quick Response</h3>
              </div>
              <p className="text-neutral-400 text-sm">
                Fast turnaround times for all your typing test questions.
              </p>
            </div>
          </div>

          {/* Recent Submissions */}
          {submissions.length > 0 && (
            <div className="bg-neutral-800/20 backdrop-blur-sm border border-neutral-700/30 rounded-2xl p-6">
              <button
                onClick={() => setShowSubmissions(!showSubmissions)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-white font-semibold">
                  Your Recent Messages
                </h3>
                {showSubmissions ? (
                  <ChevronUp className="text-neutral-400" size={20} />
                ) : (
                  <ChevronDown className="text-neutral-400" size={20} />
                )}
              </button>

              {showSubmissions && (
                <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                  {submissions.slice(0, 3).map((submission) => (
                    <div
                      key={submission.id}
                      className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-cyan-400 font-medium">
                          {submission.name}
                        </span>
                        <span className="text-neutral-500 text-xs">
                          {new Date(submission.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-neutral-300 text-sm line-clamp-2">
                        {submission.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Form */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="bg-neutral-800/30 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-white font-medium mb-2"
                >
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-4 py-3 bg-neutral-900/50 border rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500/50"
                      : "border-neutral-600 focus:ring-cyan-500/50"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-white font-medium mb-2"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-4 py-3 bg-neutral-900/50 border rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500/50"
                      : "border-neutral-600 focus:ring-cyan-500/50"
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-white font-medium mb-2"
                >
                  Your Message *
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className={`w-full px-4 py-3 bg-neutral-900/50 border rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 resize-none transition-all ${
                    errors.message
                      ? "border-red-500 focus:ring-red-500/50"
                      : "border-neutral-600 focus:ring-cyan-500/50"
                  }`}
                  placeholder="Tell us what's on your mind..."
                />
                {errors.message && (
                  <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
