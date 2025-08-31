import React from 'react';

const Testimonials = () => {
    const testimonials = [
        {
            name: "Archana K",
            feedback: "MyTrade has completely changed how I track my trades. It's so simple and efficient!",
        },
        {
            name: "Rahul P",
            feedback: "The performance analytics are a game-changer. Highly recommend for serious traders.",
        },
        {
            name: "Seanjingel",
            feedback: "Finally, a journal that’s built for Indian markets. Superb UI & smooth experience.",
        },
    ];

    return (
        <section id="testimonials"
                 className="relative min-h-screen flex flex-col items-center px-6 md:px-20 pt-24 bg-gradient-to-br from-[#122f47] via-[#1a5e71] to-[#0F293E] text-white overflow-hidden">
            <h2 className="text-3xl font-bold text-center mb-10">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                {testimonials.map((item, idx) => (
                    <div key={idx}
                         className="bg-white rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow duration-300 relative">
                        <figcaption className="mt-10">
                            <img
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                alt="" className="mx-auto size-10 rounded-full"/>
                            <div className="mt-4 flex items-center justify-center space-x-3 text-base">
                                <p className="font-semibold text-gray-800">{item.name}</p>
                                <svg viewBox="0 0 2 2" width="3" height="3" aria-hidden="true"
                                     className="fill-gray-900">
                                </svg>
                            </div>
                        </figcaption>


                        <p className="text-gray-700 italic mb-6">{item.feedback}</p>
                        <div className="flex justify-center mt-2">
                            {[...Array(4)].map((_, i) => (
                                <svg key={i} className="w-5 h-5 text-teal-600 fill-current mr-1"
                                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path
                                        d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.564-.955L10 0l2.948 5.955 6.564.955-4.756 4.635 1.122 6.545z"/>
                                </svg>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Testimonials;
