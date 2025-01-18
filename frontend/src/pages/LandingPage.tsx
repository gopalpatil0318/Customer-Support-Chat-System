import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow relative overflow-hidden">
        <header className="absolute w-full z-10">
          <div className="bg-transparent pt-6">
            <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6" aria-label="Global">
              <div className="flex items-center flex-1">
                <div className="flex items-center justify-between w-full">
                  <a href="/" className="flex items-center">
                    <img
                      className="h-8 w-auto sm:h-10"
                      src="/Header.jpg"
                      alt="Company logo"
                    />

                  </a>
                </div>
              </div>
              <div className="hidden md:flex md:items-center md:space-x-6">
                <Link to="/customer/login" className="text-base font-medium text-white hover:text-gray-300">
                  Log in
                </Link>
                <Link
                  to="/customer/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Start free
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <main className="flex-grow flex items-center">
          <div className="relative bg-gray-900 w-full h-full">
            <div className="absolute inset-0">
              <img
                className="w-full h-full object-cover"
                src="/Header.jpg"
                alt="Background"
              />
              <div className="absolute inset-0 bg-gray-900 opacity-75" aria-hidden="true"></div>
            </div>
            <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:px-0 lg:text-left lg:flex lg:items-center">
                  <div className="lg:py-24">
                    <h2 className="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:text-6xl lg:mt-6">
                      Customer support
                      <span className="text-green-400"> WebTech Devlopers</span>
                    </h2>
                    <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                      Connect with our agents in real-time and get exceptional support related to our products.
                    </p>
                    <div className="mt-10 sm:mt-12">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Link
                          to="/customer/login"
                          className="block text-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-500 hover:bg-green-600 sm:px-8"
                        >
                          Customer
                        </Link>
                        <Link
                          to="/agent/login"
                          className="block text-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 sm:px-8"
                        >
                          Agent
                        </Link>
                        <Link
                          to="/admin/login"
                          className="block text-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-500 hover:bg-purple-600 sm:px-8"
                        >
                          Admin
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>


                <div className=" mt-12 -mb-16 sm:-mb-48 lg:m-0 lg:relative">
                  <div className=" mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:max-w-none lg:px-0">
                    <div className="lg:ml-48 lg:mt-14 w-full lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-auto lg:max-w-none">
                      <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">

                        <div className="bg-green-600 px-4 py-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">SC</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-white">
                                Support Chat
                              </p>
                              <p className="text-xs text-green-100">
                                Online
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="bg-gray-50 px-4 py-3 h-80">
                          <div className="space-y-4">
                            <div className="flex">
                              <div className="flex-shrink-0 mr-3">
                                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                                  <span className="text-white text-sm">A</span>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-3 shadow">
                                <p className="text-sm text-gray-900">
                                  Hello! How can I help you today?
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <div className="bg-green-500 rounded-lg p-3 shadow max-w-sm">
                                <p className="text-sm text-white">
                                  I have a question about your service.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Chat Input */}
                        <div className="bg-white px-4 py-3 border-t">
                          <div className="flex items-center">
                            <input
                              type="text"
                              placeholder="Type your message..."
                              className="flex-1 rounded-full border-gray-300 focus:ring-green-500 focus:border-green-500"
                            />
                            <button className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700">
                              Send
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;

