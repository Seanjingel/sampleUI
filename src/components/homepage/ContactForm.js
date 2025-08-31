import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ContactForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: "",
        contactMethod: "email",
    });

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const nextStep = () => setStep((s) => s + 1);
    const prevStep = () => setStep((s) => s - 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitted Data:", formData);
        alert("Form submitted successfully!");
    };

    return (
        <section className="py-20 bg-gradient-to-br from-blue-900 via-teal-800 to-slate-900 flex items-center justify-center min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-xl p-10 w-full max-w-3xl"
            >
                {/* Heading & Tagline */}
                <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
                    Contact Us Today
                </h2>
                <p className="text-gray-200 text-center mb-8">
                    Have questions or feedback? Fill out this quick form and our team will
                    get back to you within 24 hours.
                </p>

                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-8">
                    {["Personal Info", "Message", "Review"].map((label, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                            <div
                                className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold ${
                                    step >= i + 1
                                        ? "bg-indigo-500 text-white"
                                        : "bg-white/20 text-gray-300"
                                }`}
                            >
                                {i + 1}
                            </div>
                            <span className="text-xs mt-2 text-gray-300">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                type="text"
                                placeholder="First Name"
                                className="p-3 rounded-xl bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                type="text"
                                placeholder="Last Name"
                                className="p-3 rounded-xl bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                                placeholder="Email"
                                className="p-3 rounded-xl bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                            />
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                type="tel"
                                placeholder="Phone"
                                className="p-3 rounded-xl bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                type="text"
                                placeholder="Company (optional)"
                                className="p-3 rounded-xl bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <input
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                type="text"
                                placeholder="Subject"
                                className="p-3 w-full rounded-xl bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Message"
                                className="p-3 w-full h-32 rounded-xl bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            {/* Preferred Contact - Radio Buttons */}
                            <div>
                                <p className="text-gray-200 mb-3">Preferred Contact:</p>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="contactMethod"
                                            value="email"
                                            checked={formData.contactMethod === "email"}
                                            onChange={handleChange}
                                            className="w-4 h-4 accent-indigo-500"
                                        />
                                        <span className="text-white">Email</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="contactMethod"
                                            value="phone"
                                            checked={formData.contactMethod === "phone"}
                                            onChange={handleChange}
                                            className="w-4 h-4 accent-indigo-500"
                                        />
                                        <span className="text-white">Phone</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}


                    {step === 3 && (
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-gray-200">
                            <h3 className="text-xl font-semibold mb-4 text-white">
                                Review Your Details
                            </h3>
                            <ul className="space-y-2 text-sm">
                                {Object.entries(formData).map(([key, val]) => (
                                    <li key={key} className="flex justify-between">
                                        <span className="capitalize">{key}:</span>
                                        <span>{val || "-"}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-6 py-2 rounded-xl bg-gray-500/50 hover:bg-gray-600/70 text-white transition-colors"
                            >
                                Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="ml-auto px-6 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-colors"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="ml-auto px-6 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
                            >
                                Submit
                            </button>
                        )}
                    </div>
                </form>
            </motion.div>
        </section>
    );
};

export default ContactForm;
