// app/support/SupportClient.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  HelpCircle,
  Send,
  Ticket,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high";
  timestamp: number;
  status: "open" | "in-progress" | "resolved";
}

interface TicketFormData {
  subject: string;
  description: string;
  priority: "low" | "medium" | "high";
}

interface TicketFormErrors {
  subject?: string;
  description?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: "general" | "technical" | "account" | "billing";
}

const FAQ_DATA: FAQ[] = [
  {
    id: "1",
    question: "How accurate is the ThunderTyping WPM calculation?",
    answer:
      "ThunderTyping uses the industry-standard WPM calculation: (characters typed / 5) / (time in minutes). We account for errors to give you the most precise speed measurements possible.",
    category: "technical",
  },
  {
    id: "2",
    question: "Can I track my typing progress over time?",
    answer:
      "Yes! Your results are automatically saved in your browser's local storage. We're currently working on user accounts that will allow cross-device progress tracking.",
    category: "account",
  },
  {
    id: "3",
    question: "What makes ThunderTyping different from other typing tests?",
    answer:
      "ThunderTyping features a distraction-free futuristic design, real-time accuracy feedback, smooth animations, and precise WPM calculations for the best typing experience.",
    category: "general",
  },
  {
    id: "4",
    question: "Why is my typing test not starting?",
    answer:
      "Make sure your browser has JavaScript enabled and try refreshing the page. If you're using an ad blocker, try disabling it for ThunderTyping.",
    category: "technical",
  },
  {
    id: "5",
    question: "How do I improve my typing speed?",
    answer:
      "Practice regularly, focus on accuracy over speed initially, use proper finger positioning, and gradually increase your pace. Consistency is key to improvement.",
    category: "general",
  },
  {
    id: "6",
    question: "Does ThunderTyping work on mobile devices?",
    answer:
      "ThunderTyping is optimized for desktop keyboards. While it works on mobile, we recommend using a physical keyboard for the best typing test experience.",
    category: "technical",
  },
];

export default function SupportClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [ticketForm, setTicketForm] = useState<TicketFormData>({
    subject: "",
    description: "",
    priority: "medium",
  });
  const [ticketErrors, setTicketErrors] = useState<TicketFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showTickets, setShowTickets] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // Load tickets from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("support.tickets");
    if (stored) {
      try {
        setTickets(JSON.parse(stored));
      } catch (error) {
        console.error("Error parsing stored tickets:", error);
      }
    }
  }, []);

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const validateTicketForm = (): boolean => {
    const newErrors: TicketFormErrors = {};

    if (!ticketForm.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (ticketForm.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!ticketForm.description.trim()) {
      newErrors.description = "Description is required";
    } else if (ticketForm.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    setTicketErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateTicketForm()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newTicket: SupportTicket = {
      id: Date.now().toString(),
      subject: ticketForm.subject.trim(),
      description: ticketForm.description.trim(),
      priority: ticketForm.priority,
      timestamp: Date.now(),
      status: "open",
    };

    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    localStorage.setItem("support.tickets", JSON.stringify(updatedTickets));

    // Reset form
    setTicketForm({ subject: "", description: "", priority: "medium" });
    setIsSubmitting(false);
  };

  const handleTicketInputChange = (
    field: keyof TicketFormData,
    value: string
  ) => {
    setTicketForm((prev) => ({ ...prev, [field]: value }));
    if (ticketErrors[field as keyof TicketFormErrors]) {
      setTicketErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-400/10";
      case "medium":
        return "text-yellow-400 bg-yellow-400/10";
      case "low":
        return "text-green-400 bg-green-400/10";
      default:
        return "text-neutral-400 bg-neutral-400/10";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "text-green-400 bg-green-400/10";
      case "in-progress":
        return "text-yellow-400 bg-yellow-400/10";
      case "open":
        return "text-blue-400 bg-blue-400/10";
      default:
        return "text-neutral-400 bg-neutral-400/10";
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          Support Center
        </h1>
        <p className="text-lg text-neutral-300 leading-relaxed max-w-2xl mx-auto">
          Find answers to common questions or submit a support ticket. We're
          here to help you get the most out of ThunderTyping.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left Column - FAQ */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h2>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="account">Account</option>
                <option value="billing">Billing</option>
              </select>
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-neutral-800/30 backdrop-blur-sm border border-neutral-700/50 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
                    }
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-neutral-700/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle
                        className="text-cyan-400 flex-shrink-0"
                        size={18}
                      />
                      <span className="text-white font-medium">
                        {faq.question}
                      </span>
                    </div>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp
                        className="text-neutral-400 flex-shrink-0"
                        size={20}
                      />
                    ) : (
                      <ChevronDown
                        className="text-neutral-400 flex-shrink-0"
                        size={20}
                      />
                    )}
                  </button>

                  {expandedFAQ === faq.id && (
                    <div className="px-6 pb-4">
                      <p className="text-neutral-300 leading-relaxed pl-7">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle
                  className="mx-auto text-neutral-600 mb-4"
                  size={48}
                />
                <p className="text-neutral-400">
                  No FAQs found matching your search.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Support Ticket Form */}
        <div className="lg:sticky lg:top-24 lg:h-fit space-y-6">
          <div className="bg-neutral-800/30 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Ticket className="text-indigo-400" size={20} />
              Submit Support Ticket
            </h3>

            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="subject"
                  className="block text-white font-medium mb-2"
                >
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  value={ticketForm.subject}
                  onChange={(e) =>
                    handleTicketInputChange("subject", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-neutral-900/50 border rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 transition-all ${
                    ticketErrors.subject
                      ? "border-red-500 focus:ring-red-500/50"
                      : "border-neutral-600 focus:ring-cyan-500/50"
                  }`}
                  placeholder="Brief description of your issue"
                />
                {ticketErrors.subject && (
                  <p className="text-red-400 text-sm mt-1">
                    {ticketErrors.subject}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="block text-white font-medium mb-2"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  value={ticketForm.priority}
                  onChange={(e) =>
                    handleTicketInputChange("priority", e.target.value as any)
                  }
                  className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-white font-medium mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={ticketForm.description}
                  onChange={(e) =>
                    handleTicketInputChange("description", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-neutral-900/50 border rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 resize-none transition-all ${
                    ticketErrors.description
                      ? "border-red-500 focus:ring-red-500/50"
                      : "border-neutral-600 focus:ring-cyan-500/50"
                  }`}
                  placeholder="Describe your issue in detail..."
                />
                {ticketErrors.description && (
                  <p className="text-red-400 text-sm mt-1">
                    {ticketErrors.description}
                  </p>
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
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Ticket
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-xs text-neutral-500 flex items-center gap-2">
              <Clock size={14} />
              We respond within 48 hours
            </div>
          </div>

          {/* Recent Tickets */}
          {tickets.length > 0 && (
            <div className="bg-neutral-800/20 backdrop-blur-sm border border-neutral-700/30 rounded-2xl p-6">
              <button
                onClick={() => setShowTickets(!showTickets)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-white font-semibold">
                  Your Recent Tickets
                </h3>
                {showTickets ? (
                  <ChevronUp className="text-neutral-400" size={20} />
                ) : (
                  <ChevronDown className="text-neutral-400" size={20} />
                )}
              </button>

              {showTickets && (
                <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                  {tickets.slice(0, 5).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">
                          {ticket.subject}
                        </span>
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {ticket.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-neutral-400 text-xs line-clamp-2 mb-2">
                        {ticket.description}
                      </p>
                      <span className="text-neutral-500 text-xs">
                        {new Date(ticket.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
