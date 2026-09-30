import { Link } from 'react-router-dom';

// --- SUB-COMPONENTS ---

// const Navbar = () => (
//   <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       <div className="flex justify-between h-16 items-center">
//         <div className="flex items-center gap-2 group cursor-pointer">
//           <span className="bg-green-600 text-white p-1.5 rounded-lg shadow-sm group-hover:bg-green-500 transition-colors duration-300">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//             </svg>
//           </span>
//           <span className="text-xl font-extrabold text-green-700 tracking-tight">GullyCart</span>
//         </div>
//         <div className="flex items-center gap-6">
//           <Link to="/login" className="text-gray-600 font-semibold hover:text-green-600 transition-colors duration-200">
//             Login
//           </Link>
//           <Link to="/signup" className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-green-500/30 hover:-translate-y-0.5">
//             Sign Up
//           </Link>
//         </div>
//       </div>
//     </div>
//   </nav>
// );

const Hero = () => (
  <div className="relative bg-white overflow-hidden">
    {/* Background Decorative Blob */}
    <div className="absolute top-0 -left-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
    <div className="absolute top-0 -right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center relative z-10">
      <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
        Digitizing India's <br className="hidden md:block"/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
          Street Economy
        </span>
      </h1>
      <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
        GullyCart connects households directly with local street vendors. Get farm-fresh produce delivered by your neighborhood hawker, backed by real-time tracking and zero infrastructure costs.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-5">
        <Link to="/signup" className="group relative inline-flex items-center justify-center bg-green-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-green-600/40 hover:-translate-y-1 hover:scale-105">
          Join as a Shopper
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
        <Link to="/signup" className="group relative inline-flex items-center justify-center bg-white text-blue-700 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 shadow-sm hover:shadow-md hover:-translate-y-1 hover:scale-105">
          Register a Cart
        </Link>
      </div>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, description, colorClass }) => (
  <div className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-green-100 cursor-default">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${colorClass}`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

// --- MAIN PAGE COMPONENT ---

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      {/* <Navbar /> */}

      <main className="grow">
        <Hero />

        {/* Features Section */}
        <div className="bg-gray-50 py-24 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Tech for a Better Tomorrow</h2>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
                We are transforming a $100 billion unorganized market into a predictable, data-driven livelihood for millions of micro-entrepreneurs[cite: 2].
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                colorClass="bg-green-100 text-green-600"
                icon={(
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                title="Dynamic Geo-Fencing"
                description='Live GPS alerts notify you the moment your preferred vendor enters your neighborhood, eliminating the guesswork of when fresh produce arrives[cite: 2].'
              />
              <FeatureCard 
                colorClass="bg-blue-100 text-blue-600"
                icon={(
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                title="The Freshness Index"
                description="Complete transparency. See the exact timestamp of when the vendor procured their items from the mandi, guaranteeing farm-to-street quality[cite: 2]."
              />
              <FeatureCard 
                colorClass="bg-purple-100 text-purple-600"
                icon={(
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
                title="Smart Voice Onboarding"
                description="Built for low literacy access[cite: 2]. Vendors simply speak their inventory into the app, and our AI instantly parses it into a digital storefront."
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-10 text-center text-sm">
        <p className="mb-2">&copy; 2026 GullyCart. Built for HACKDAY 1.0.</p>
        <p>Tech for a Better Tomorrow.</p>
      </footer>
    </div>
  );
};

export default LandingPage;