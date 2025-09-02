import { CheckCircle, ArrowLeft, Users, TrendingUp, Mail } from "lucide-react";
export default function Dashboard() {
  const handleRegisterIPO = () => {
    window.location.href = 'http://localhost:8080/';
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-8 mt-2">
            <CheckCircle size={40} className="text-white dark:text-black" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-6">
            Application Submitted!
          </h1>

          {/* <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Thank you for joining INDEV.Ai! We've received your application and our team will review it carefully. 
            You'll hear back from us within 48 hours.
          </p> */}

          {/* Next Steps */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 mb-8 text-left border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-black dark:text-white mb-4">What happens next?</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white dark:text-black font-semibold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-black dark:text-white">Application Review</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Our team will carefully review your profile and application details
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white dark:text-black font-semibold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-black dark:text-white">Account Setup</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Once approved, we'll send you login credentials and onboarding materials
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white dark:text-black font-semibold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-black dark:text-white">Start Connecting</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Begin networking with entrepreneurs, developers, and investors in our community
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Mail size={20} className="text-gray-600 dark:text-gray-400" />
              <span className="font-semibold text-black dark:text-white">Questions?</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Reach out to us at{" "}
              <a href="mailto:hello@indev.ai" className="text-black dark:text-white font-medium hover:underline">
                hello@indev.ai
              </a>
              {" "}or call us at{" "}
              <a href="tel:+15551234567" className="text-black dark:text-white font-medium hover:underline">
                +1 (555) 123-4567
              </a>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              Back to Homepage
            </a>
            
            <button className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200"
            onClick={handleRegisterIPO}
            >
              Want To Registor you IPO ?
            </button>
          </div>

          {/* Stats Preview */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Join the community</p>
            <div className="flex justify-center items-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-black dark:text-white">15K+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black dark:text-white">$125M+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Funded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black dark:text-white">2.5K+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Startups</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}