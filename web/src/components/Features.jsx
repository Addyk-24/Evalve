import { Search, DollarSign, Network, Shield, Clock, Star } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Search,
      title: "Discover Talent",
      description: "Find skilled developers, designers, and entrepreneurs with proven track records in building successful products.",
      benefits: ["AI-powered matching", "Verified portfolios", "Skills assessment"]
    },
    {
      icon: DollarSign,
      title: "Secure Funding",
      description: "Connect with angels, VCs, and institutional investors actively looking for the next breakthrough startup.",
      benefits: ["Accredited investors", "Smart contracts", "Milestone-based funding"]
    },
    {
      icon: Network,
      title: "Build Networks",
      description: "Join a thriving community of builders, creators, and innovators shaping the future of technology.",
      benefits: ["Peer collaboration", "Mentor matching", "Industry events"]
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "All profiles are verified, contracts are secure, and transactions are protected by blockchain technology.",
      benefits: ["KYC verification", "Escrow protection", "Smart contracts"]
    },
    {
      icon: Clock,
      title: "Fast Matching",
      description: "Our AI-driven platform matches you with the right partners in hours, not months.",
      benefits: ["Instant notifications", "Real-time chat", "Quick decisions"]
    },
    {
      icon: Star,
      title: "Proven Success",
      description: "Join a platform where startups have already raised millions and launched successful products.",
      benefits: ["Success stories", "Case studies", "Performance metrics"]
    }
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <section
        id="about"
        className="py-20 bg-gray-50 dark:bg-gray-900"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-black dark:text-white mb-6">
              Everything you need to{" "}
              <span className="relative inline-block">
                succeed
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-black dark:bg-white"></div>
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              INDEV.Ai provides all the tools, connections, and resources you need to turn your ideas into thriving businesses
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:scale-105"
                >
                  {/* Icon */}
                  <div className="w-14 h-14 bg-black dark:bg-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent size={24} className="text-white dark:text-black" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-black dark:text-white mb-4">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full mr-3"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 bg-black dark:bg-white rounded-full border-2 border-white dark:border-gray-800"></div>
                <div className="w-10 h-10 bg-gray-600 dark:bg-gray-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                <div className="w-10 h-10 bg-gray-400 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-black dark:text-white">
                  Join 10,000+ innovators
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Building the future together
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}