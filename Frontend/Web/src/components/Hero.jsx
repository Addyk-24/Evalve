import { ArrowRight, Users, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleJoinEntrepreneur = () => {
    window.location.href = '/signup/entrepreneur';
  };

  const handleJoinInvestor = () => {
    window.location.href = '/signup/investor';
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <section
        id="home"
        className="relative pt-24 pb-20 bg-white dark:bg-black overflow-hidden"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black dark:text-white mb-6 tracking-tight leading-tight animate-fade-in">
              Where{" "}
              <span className="relative inline-block">
                developers
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-black dark:bg-white"></div>
              </span>
              ,{" "}
              <span className="relative inline-block">
                entrepreneurs
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-black dark:bg-white"></div>
              </span>
              , and{" "}
              <span className="relative inline-block">
                investors
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-black dark:bg-white"></div>
              </span>{" "}
              connect
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-delayed">
              INDEV.Ai is the bridge between{" "}
              <span className="font-semibold text-black dark:text-white">talent</span> +{" "}
              <span className="font-semibold text-black dark:text-white">capital</span> +{" "}
              <span className="font-semibold text-black dark:text-white">innovation</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-delayed">
              <button 
                onClick={handleJoinEntrepreneur}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                <Users size={20} />
                Join as Entrepreneur
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <button 
                onClick={handleJoinInvestor}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-black dark:border-white text-black dark:text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 transform hover:scale-105"
              >
                <TrendingUp size={20} />
                Join as Investor
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            {/* Value Proposition Cards with Stacking Animation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: Users,
                  title: "Find Talent",
                  description: "Connect with skilled developers and innovative entrepreneurs ready to build the future"
                },
                {
                  icon: TrendingUp,
                  title: "Raise Capital",
                  description: "Access a network of investors eager to fund the next breakthrough technology"
                },
                {
                  icon: Zap,
                  title: "Connect & Innovate",
                  description: "Join a community where ideas transform into successful startups and products"
                }
              ].map((card, index) => {
                const IconComponent = card.icon;
                const cardOffset = Math.max(0, scrollY * 0.1 - index * 20);
                
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 card-stack"
                    style={{
                      transform: `translateY(${-cardOffset}px)`,
                      transition: 'transform 0.1s ease-out'
                    }}
                  >
                    <div className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center mb-4">
                      <IconComponent size={28} className="text-white dark:text-black" />
                    </div>
                    <h3 className="text-xl font-semibold text-black dark:text-white mb-2">{card.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-center">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Background Pattern - Minimal */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 right-20 w-32 h-32 bg-gray-100 dark:bg-gray-900 rounded-full opacity-50"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-gray-100 dark:bg-gray-900 rounded-full opacity-50"></div>
        </div>

        {/* Custom Animations */}
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }
          
          .animate-fade-in-delayed {
            opacity: 0;
            animation: fadeIn 0.8s ease-out 0.3s forwards;
          }

          .card-stack {
            transition: transform 0.1s ease-out, background-color 0.3s ease;
          }
        `}</style>
      </section>
    </>
  );
}