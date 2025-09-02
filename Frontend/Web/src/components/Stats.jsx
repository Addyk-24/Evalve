import { useState, useEffect } from "react";

export default function Stats() {
  const [counters, setCounters] = useState({
    developers: 0,
    startups: 0,
    funding: 0,
    investors: 0
  });

  const finalStats = {
    developers: 15000,
    startups: 2500,
    funding: 125,
    investors: 850
  };

  // Animated counter effect
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepTime = duration / steps;

    const incrementCounters = () => {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setCounters({
          developers: Math.floor(finalStats.developers * progress),
          startups: Math.floor(finalStats.startups * progress),
          funding: Math.floor(finalStats.funding * progress),
          investors: Math.floor(finalStats.investors * progress)
        });

        if (step >= steps) {
          clearInterval(interval);
          setCounters(finalStats);
        }
      }, stepTime);
    };

    // Start counter animation after component mounts
    const timer = setTimeout(incrementCounters, 500);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      value: counters.developers.toLocaleString() + "+",
      label: "Developers & Entrepreneurs",
      description: "Building the future"
    },
    {
      value: counters.startups.toLocaleString() + "+",
      label: "Active Startups",
      description: "Seeking talent & funding"
    },
    {
      value: "$" + counters.funding.toLocaleString() + "M+",
      label: "Funding Facilitated",
      description: "Capital deployed"
    },
    {
      value: counters.investors.toLocaleString() + "+",
      label: "Active Investors",
      description: "Ready to fund"
    }
  ];

  const achievements = [
    {
      title: "Y Combinator Alumni",
      description: "50+ startups from our platform"
    },
    {
      title: "Techstars Network",
      description: "25+ accelerated companies"
    },
    {
      title: "Series A Success",
      description: "75+ companies reached Series A"
    },
    {
      title: "IPO Exits",
      description: "3 companies went public"
    },
    {
      title: "Unicorn Status",
      description: "5 companies valued at $1B+"
    },
    {
      title: "Global Reach",
      description: "Active in 50+ countries"
    }
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <section
        id="startups"
        className="py-20 bg-white dark:bg-black"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-black dark:text-white mb-6">
              Trusted by the{" "}
              <span className="relative inline-block">
                best
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-black dark:bg-white"></div>
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of successful developers, entrepreneurs, and investors who have built amazing things together
            </p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-3xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:scale-105"
              >
                {/* Animated Number */}
                <div className="text-4xl md:text-5xl font-black text-black dark:text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-lg font-semibold text-black dark:text-white mb-1">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>

          {/* Achievement Badges */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-800">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-4">
                Success Stories
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our platform has been the launchpad for countless success stories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105"
                >
                  {/* Badge Icon */}
                  <div className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-white dark:bg-black rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-black dark:bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <div className="font-semibold text-black dark:text-white text-sm mb-1">
                      {achievement.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {achievement.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-16">
            <div className="inline-block p-8 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-4">
                Ready to be part of the next success story?
              </h3>
              <button className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transform hover:scale-105 transition-all duration-300">
                Join INDEV.Ai Today
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}