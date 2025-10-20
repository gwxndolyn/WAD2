import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useListings } from '../contexts/ListingsContext';
import { useRentals } from '../contexts/RentalsContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LiquidGlassNav from './LiquidGlassNav';
import Footer from './Footer';
import { Search, Plus, Heart, ShoppingBag, Star, TrendingUp, Users, Award, ChevronLeft, ChevronRight, Hammer, Leaf, Smartphone, ChefHat, Dumbbell, Camera, Music, Baby, Gamepad2, Palette, Briefcase, Wrench, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, Inbox } from 'lucide-react';

import toolLibrary from '../assets/tool_library.jpg';
import rentImage from '../assets/rent.jpg';
import toolsImage from '../assets/tools.jpg';
import communityImage from '../assets/community.jpeg';

export default function HomePage() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { listings, userListings } = useListings();
  const { getUserRentals, userRentalRequests, receivedRentalRequests } = useRentals();
  const navigate = useNavigate();

  // Get user stats
  const userRentals = currentUser ? getUserRentals() : [];
  const activeRentals = userRentalRequests.filter(r => r.status === 'approved');
  const completedRentals = userRentalRequests.filter(r => r.status === 'completed');
  const pendingRequests = userRentalRequests.filter(r => r.status === 'pending');

  // Owner stats
  const incomingRequests = receivedRentalRequests.filter(r => r.status === 'pending');

  // Only count earnings for rentals marked as completed
  const completedBookings = receivedRentalRequests.filter(r => r.status === 'completed');

  const totalEarnings = completedBookings.reduce((sum, r) => sum + r.totalCost, 0);
  const totalSpent = completedRentals.reduce((sum, r) => sum + r.totalCost, 0);

  // Calculate earnings by category - get category from listing
  const earningsByCategory = completedBookings.reduce((acc: { [key: string]: number }, booking) => {
    // Find the listing to get its category
    const listing = userListings.find(l => l.id === booking.toolId);
    const category = listing?.category || 'Other';
    acc[category] = (acc[category] || 0) + booking.totalCost;
    return acc;
  }, {});

  // Get all categories sorted by earnings
  const sortedCategories = Object.entries(earningsByCategory)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  // Get top 3 categories
  const topCategories = sortedCategories.slice(0, 3);

  // Calculate "Other" as sum of remaining categories (4th onwards)
  const otherEarnings = sortedCategories.length > 3
    ? sortedCategories.slice(3).reduce((sum, [, amount]) => sum + (amount as number), 0)
    : 0;

  // Carousel state and data
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [
    {
      id: 1,
      title: `Welcome to ShareLah, ${currentUser?.displayName?.split(' ')[0] || 'User'}!`,
      subtitle: "Find tools or share what you have",
      image: toolLibrary,
      color: "from-indigo-500 to-purple-600",
      action: () => navigate('/browse')
    },
    {
      id: 2,
      title: "Share Your Tools",
      subtitle: "Earn money from unused tools",
      image: toolsImage,
      color: "from-blue-500 to-purple-600",
      action: () => navigate('/list-item')
    },
    {
      id: 3,
      title: "Find What You Need",
      subtitle: "Rent tools instead of buying",
      image: rentImage,
      color: "from-green-500 to-blue-500",
      action: () => navigate('/browse')
    },
    {
      id: 4,
      title: "Join the Community",
      subtitle: "Over 1000+ tools available",
      image: communityImage,
      color: "from-purple-500 to-pink-500",
      action: () => navigate('/browse')
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
      {/* Fluid Glass Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -inset-10 opacity-30 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10'
            : 'bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20'
        } blur-3xl animate-pulse`}></div>
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${
          theme === 'dark' ? 'bg-blue-500/5' : 'bg-blue-400/10'
        } rounded-sm blur-3xl animate-pulse delay-1000`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${
          theme === 'dark' ? 'bg-blue-500/5' : 'bg-blue-400/10'
        } rounded-sm blur-3xl animate-pulse delay-2000`}></div>
      </div>

      {/* Keep your original LiquidGlassNav */}
      <LiquidGlassNav />

      {/* Main Content - Added padding-top to prevent navbar overlap */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">
        {/* Enhanced Carousel Banner */}
        <div className="mb-8 relative overflow-hidden rounded-2xl shadow-2xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`w-full flex-shrink-0 ${typeof banner.image === 'string' && banner.image.startsWith('/') ? 'relative' : `bg-gradient-to-r ${banner.color}`} p-12 md:p-20 cursor-pointer min-h-[400px] md:min-h-[450px]`}
                onClick={banner.action}
                style={typeof banner.image === 'string' && banner.image.startsWith('/') ? {
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${banner.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                } : {}}
              >
                <div className="flex items-center justify-between h-full">
                  <div className="text-white z-10 relative">
                    {typeof banner.image === 'string' && banner.image.startsWith('/') ? (
                      // For image backgrounds, don't show the small icon
                      <div className="mb-6"></div>
                    ) : (
                      <div className="text-8xl md:text-9xl mb-6">{banner.image}</div>
                    )}
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight drop-shadow-lg">{banner.title}</h1>
                    <p className="text-xl md:text-2xl opacity-90 mb-6 drop-shadow-md">{banner.subtitle}</p>
                    <div className="flex space-x-4">
                      <div className="px-6 py-2 bg-white/30 backdrop-blur-sm rounded-full text-sm font-medium shadow-lg">
                        Click to explore
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    {typeof banner.image === 'string' && banner.image.startsWith('/') ? (
                      // For image backgrounds, no decorative element
                      null
                    ) : (
                      <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <div className="text-8xl">{banner.image}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Category Icons Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 px-2">Popular Categories</h2>
          <div className="relative">
            <div className="flex overflow-x-auto scrollbar-hide gap-8 pb-6">
              {[
                { name: 'Power Tools', icon: Hammer, count: '120+', category: 'Power Tools' },
                { name: 'Garden', icon: Leaf, count: '85+', category: 'Garden Tools' },
                { name: 'Electronics', icon: Smartphone, count: '60+', category: 'Electronics' },
                { name: 'Kitchen', icon: ChefHat, count: '45+', category: 'Kitchen Appliances' },
                { name: 'Sports', icon: Dumbbell, count: '70+', category: 'Sports Equipment' },
                { name: 'Photography', icon: Camera, count: '35+', category: 'Photography' },
                { name: 'Music', icon: Music, count: '28+', category: 'Musical Instruments' },
                { name: 'Fitness', icon: Dumbbell, count: '42+', category: 'Health & Fitness' },
                { name: 'Baby & Kids', icon: Baby, count: '55+', category: 'Baby & Kids' },
                { name: 'Gaming', icon: Gamepad2, count: '38+', category: 'Gaming' },
                { name: 'Art & Craft', icon: Palette, count: '25+', category: 'Art & Craft' },
                { name: 'Office', icon: Briefcase, count: '32+', category: 'Office Equipment' }
              ].map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <div
                    key={index}
                    onClick={() => navigate(`/browse?category=${encodeURIComponent(category.category)}`)}
                    className="flex-none cursor-pointer group mt-1 ml-1 mr-1"
                  >
                    <div className={`w-24 h-24 rounded-full border border-gray-200/40 flex items-center justify-center mb-3 transition-all group-hover:border-gray-300/60 group-hover:shadow-lg group-hover:scale-105 ${
                      theme === 'dark' ? 'bg-gray-800/15' : 'bg-gray-100/25'
                    }`}>
                      <IconComponent className={`w-10 h-10 ${theme === 'dark' ? 'text-gray-400/80' : 'text-gray-500/80'}`} strokeWidth={1.5} />
                    </div>
                    <div className="text-center max-w-[96px]">
                      <h3 className="font-medium text-xs mb-1 leading-tight">{category.name}</h3>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{category.count}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Stats Dashboard with Glowing Purple Shadow */}
        {userRentals.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-16 px-2">Your ShareLah Dashboard</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Left Column - Stats */}
              <div className={`lg:col-span-2 rounded-xl p-4 shadow-2xl ${
                theme === 'dark'
                  ? 'bg-gray-900/90 backdrop-blur-sm border border-purple-500/20'
                  : 'bg-white/90 backdrop-blur-sm border border-purple-300/30'
              }`}
              style={{
                boxShadow: `
                  0 0 30px rgba(147, 51, 234, 0.3),
                  0 0 60px rgba(147, 51, 234, 0.2),
                  0 0 90px rgba(147, 51, 234, 0.1),
                  0 20px 25px -5px rgba(0, 0, 0, 0.1),
                  0 10px 10px -5px rgba(0, 0, 0, 0.04)
                `
              }}>
                <h3 className="text-xs font-bold mb-2 flex items-center text-purple-600">
                  <Users className="w-3 h-3 mr-1" />
                  Rental Activity
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <Clock className="w-6 h-6 mb-1 text-blue-500" />
                    <p className="text-xl font-bold">{activeRentals.length}</p>
                    <p className={`text-[9px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Active</p>
                  </div>

                  <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                    <CheckCircle className="w-6 h-6 mb-1 text-green-500" />
                    <p className="text-xl font-bold">{completedRentals.length}</p>
                    <p className={`text-[9px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                  </div>

                  <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
                    <AlertCircle className="w-6 h-6 mb-1 text-yellow-500" />
                    <p className="text-xl font-bold">{pendingRequests.length}</p>
                    <p className={`text-[9px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                  </div>

                  <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <DollarSign className="w-6 h-6 mb-1 text-purple-500" />
                    <p className="text-xl font-bold">${totalSpent.toFixed(0)}</p>
                    <p className={`text-[9px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Spent</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-bold mb-2 flex items-center text-purple-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Listing Performance
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gradient-to-br from-indigo-500/10 to-blue-500/10">
                      <TrendingUp className="w-6 h-6 mb-1 text-indigo-500" />
                      <p className="text-xl font-bold">{userListings.length}</p>
                      <p className={`text-[9px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Listings</p>
                    </div>

                    <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10">
                      <Inbox className="w-6 h-6 mb-1 text-orange-500" />
                      <p className="text-xl font-bold">{incomingRequests.length}</p>
                      <p className={`text-[9px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Requests</p>
                    </div>

                    <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-teal-500/10">
                      <CheckCircle className="w-6 h-6 mb-1 text-green-500" />
                      <p className="text-xl font-bold">{completedBookings.length}</p>
                      <p className={`text-[9px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Done</p>
                    </div>

                    <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gradient-to-br from-yellow-500/10 to-amber-500/10">
                      <Award className="w-6 h-6 mb-1 text-yellow-500" />
                      <p className="text-xl font-bold">${totalEarnings.toFixed(0)}</p>
                      <p className={`text-[9px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Earned</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Earnings by Category */}
              <div className={`rounded-xl p-4 shadow-2xl ${
                theme === 'dark'
                  ? 'bg-gray-900/90 backdrop-blur-sm border border-purple-500/20'
                  : 'bg-white/90 backdrop-blur-sm border border-purple-300/30'
              }`}
              style={{
                boxShadow: `
                  0 0 30px rgba(147, 51, 234, 0.3),
                  0 0 60px rgba(147, 51, 234, 0.2),
                  0 0 90px rgba(147, 51, 234, 0.1),
                  0 20px 25px -5px rgba(0, 0, 0, 0.1),
                  0 10px 10px -5px rgba(0, 0, 0, 0.04)
                `
              }}>
                <h3 className="text-xs font-bold mb-2 text-center text-purple-600">Earnings by Category</h3>

                {totalEarnings > 0 ? (
                  <>
                    {/* SVG Pie Chart */}
                    <div className="flex items-center justify-center mb-2">
                      <svg width="120" height="120" viewBox="0 0 200 200" className="transform -rotate-90">
                        {/* Background circle */}
                        <circle cx="100" cy="100" r="80" fill="none" stroke={theme === 'dark' ? '#1f2937' : '#f3f4f6'} strokeWidth="40" />

                        {/* Category segments */}
                        {(() => {
                          const colors = ['#3b82f6', '#10b981', '#eab308', '#8b5cf6'];
                          let currentOffset = 0;

                          return [...topCategories, ['Other', otherEarnings] as [string, number]]
                            .filter(([, amount]) => (amount as number) > 0)
                            .map(([category, amount], index) => {
                              const numAmount = amount as number;
                              const percentage = (numAmount / totalEarnings) * 100;
                              const dashArray = (percentage / 100) * 502.65;
                              const segment = (
                                <circle
                                  key={category as string}
                                  cx="100"
                                  cy="100"
                                  r="80"
                                  fill="none"
                                  stroke={colors[index % colors.length]}
                                  strokeWidth="40"
                                  strokeDasharray={`${dashArray} 502.65`}
                                  strokeDashoffset={`-${currentOffset}`}
                                />
                              );
                              currentOffset += dashArray;
                              return segment;
                            });
                        })()}
                      </svg>
                    </div>

                    {/* Legend */}
                    <div className="space-y-1.5">
                      {(() => {
                        const colors = [
                          { bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
                          { bg: 'bg-green-500/10', dot: 'bg-green-500' },
                          { bg: 'bg-yellow-500/10', dot: 'bg-yellow-500' },
                          { bg: 'bg-purple-500/10', dot: 'bg-purple-500' }
                        ];

                        return [...topCategories, ['Other', otherEarnings] as [string, number]]
                          .filter(([, amount]) => (amount as number) > 0)
                          .map(([category, amount], index) => (
                            <div key={category as string} className={`flex items-center justify-between p-1.5 rounded-lg ${colors[index % colors.length].bg}`}>
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors[index % colors.length].dot}`}></div>
                                <span className="text-[10px] font-medium break-words">{category}</span>
                              </div>
                              <p className="text-xs font-bold ml-2 flex-shrink-0">${(amount as number).toFixed(0)}</p>
                            </div>
                          ));
                      })()}
                    </div>

                    {/* Total */}
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-center">
                      <p className={`text-[9px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Earnings</p>
                      <p className="text-xl font-bold mt-0.5 text-green-500">${totalEarnings.toFixed(2)}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Award className={`w-12 h-12 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>No earnings yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div
            onClick={() => navigate('/browse')}
            className={`rounded-xl p-4 transition-all cursor-pointer border-0 shadow-sm hover:shadow-md ${
            theme === 'dark'
              ? 'bg-gray-800/60 hover:bg-gray-800/80'
              : 'bg-white/80 hover:bg-white/90 backdrop-blur-sm'
          }`}>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Browse</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Find tools</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/list-item')}
            className={`rounded-xl p-4 transition-all cursor-pointer border-0 shadow-sm hover:shadow-md ${
            theme === 'dark'
              ? 'bg-gray-800/60 hover:bg-gray-800/80'
              : 'bg-white/80 hover:bg-white/90 backdrop-blur-sm'
          }`}>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">List Item</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Earn money</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/my-rentals')}
            className={`rounded-xl p-4 transition-all cursor-pointer border-0 shadow-sm hover:shadow-md ${
            theme === 'dark'
              ? 'bg-gray-800/60 hover:bg-gray-800/80'
              : 'bg-white/80 hover:bg-white/90 backdrop-blur-sm'
          }`}>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">My Rentals</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Track items</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/favorites')}
            className={`rounded-xl p-4 transition-all cursor-pointer border-0 shadow-sm hover:shadow-md ${
            theme === 'dark'
              ? 'bg-gray-800/60 hover:bg-gray-800/80'
              : 'bg-white/80 hover:bg-white/90 backdrop-blur-sm'
          }`}>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Favorites</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Saved items</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 px-2">Recent Activity</h2>
          <div>
            {(() => {
              // Helper function to get full condition description
              const getConditionLabel = (condition: string) => {
                const conditionMap: { [key: string]: string } = {
                  'excellent': 'Excellent - Like new',
                  'good': 'Good - Minor wear',
                  'fair': 'Fair - Some wear but functional',
                  'poor': 'Poor - Heavy wear but working'
                };
                return conditionMap[condition] || condition;
              };

              // Combine all activities and sort by most recent
              interface Activity {
                id: string;
                type: string;
                title: string;
                subtitle: string;
                icon: any;
                iconColor: string;
                bgColor: string;
                badge: string;
                badgeColor: string;
                date: Date;
              }
              const allActivities: Activity[] = [];

              // Add user listings
              userListings.forEach((listing) => {
                const dateStr = listing.createdAt instanceof Date
                  ? listing.createdAt.toLocaleDateString()
                  : new Date((listing.createdAt as any).toDate()).toLocaleDateString();

                allActivities.push({
                  id: `listing-${listing.id}`,
                  type: 'listing_created',
                  title: `You listed "${listing.name}"`,
                  subtitle: `${dateStr} • ${getConditionLabel(listing.condition)}`,
                  icon: Plus,
                  iconColor: 'from-green-500 to-emerald-600',
                  bgColor: theme === 'dark'
                    ? 'from-green-900/20 to-emerald-900/20 border border-green-500/20'
                    : 'from-green-50 to-emerald-50 border border-green-200/50',
                  badge: `$${listing.price}/${listing.period}`,
                  badgeColor: 'from-green-500 to-emerald-500',
                  date: listing.createdAt instanceof Date ? listing.createdAt : new Date((listing.createdAt as any).toDate())
                });
              });

              // Add user rental requests (requests made BY user)
              userRentalRequests.forEach((rental) => {
                const statusIcon = rental.status === 'pending' ? Clock :
                                   rental.status === 'approved' ? CheckCircle :
                                   rental.status === 'declined' ? XCircle :
                                   rental.status === 'completed' ? DollarSign :
                                   ShoppingBag;

                allActivities.push({
                  id: `rental-${rental.id}`,
                  type: 'rental_request',
                  title: `You requested "${rental.toolName}"`,
                  subtitle: `${rental.startDate} - ${rental.endDate}`,
                  icon: statusIcon,
                  iconColor: rental.status === 'pending' ? 'from-yellow-500 to-orange-600' :
                             rental.status === 'approved' ? 'from-green-500 to-emerald-600' :
                             rental.status === 'declined' ? 'from-red-500 to-red-600' :
                             rental.status === 'completed' ? 'from-purple-500 to-indigo-600' :
                             'from-blue-500 to-indigo-600',
                  bgColor: theme === 'dark'
                    ? 'from-purple-900/20 to-indigo-900/20 border border-purple-500/20'
                    : 'from-purple-50 to-indigo-50 border border-purple-200/50',
                  badge: rental.status.toUpperCase(),
                  badgeColor: rental.status === 'pending' ? 'from-yellow-400 to-orange-500' :
                              rental.status === 'approved' ? 'from-green-500 to-emerald-500' :
                              rental.status === 'declined' ? 'from-red-500 to-red-600' :
                              rental.status === 'completed' ? 'from-purple-500 to-indigo-600' :
                              'from-blue-500 to-indigo-500',
                  date: rental.requestDate instanceof Date ? rental.requestDate : new Date((rental.requestDate as any).toDate())
                });
              });

              // Add incoming rental requests (requests received by user for their items)
              receivedRentalRequests.forEach((request) => {
                const statusIcon = request.status === 'pending' ? AlertCircle :
                                   request.status === 'approved' ? CheckCircle :
                                   request.status === 'declined' ? XCircle :
                                   request.status === 'completed' ? DollarSign :
                                   Users;

                allActivities.push({
                  id: `received-${request.id}`,
                  type: 'received_request',
                  title: `${request.renterName} wants to rent "${request.toolName}"`,
                  subtitle: `${request.startDate} - ${request.endDate} • $${request.totalCost}`,
                  icon: statusIcon,
                  iconColor: request.status === 'pending' ? 'from-blue-500 to-cyan-600' :
                             request.status === 'approved' ? 'from-green-500 to-emerald-600' :
                             request.status === 'declined' ? 'from-red-500 to-red-600' :
                             request.status === 'completed' ? 'from-purple-500 to-indigo-600' :
                             'from-orange-500 to-amber-600',
                  bgColor: theme === 'dark'
                    ? 'from-blue-900/20 to-cyan-900/20 border border-blue-500/20'
                    : 'from-blue-50 to-cyan-50 border border-blue-200/50',
                  badge: request.status.toUpperCase(),
                  badgeColor: request.status === 'pending' ? 'from-blue-500 to-cyan-500' :
                              request.status === 'approved' ? 'from-green-500 to-emerald-500' :
                              request.status === 'declined' ? 'from-red-500 to-red-600' :
                              request.status === 'completed' ? 'from-purple-500 to-indigo-600' :
                              'from-orange-500 to-amber-500',
                  date: request.requestDate instanceof Date ? request.requestDate : new Date((request.requestDate as any).toDate())
                });
              });

              // Sort by date (most recent first)
              allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

              return allActivities.length > 0 ? (
                <div className="space-y-6">
                  {allActivities.slice(0, 3).map((activity) => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={activity.id} className={`group relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r ${activity.bgColor}`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center space-x-5">
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 bg-gradient-to-br ${activity.iconColor} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                              <IconComponent className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-lg truncate">{activity.title}</p>
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              📅 {activity.subtitle}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <div className={`px-4 py-2 bg-gradient-to-r ${activity.badgeColor} text-white font-bold rounded-xl shadow-md text-sm`}>
                              {activity.badge}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {allActivities.length > 3 && (
                    <div className="text-center pt-4">
                      <span
                        onClick={() => navigate('/my-rentals')}
                        className={`cursor-pointer text-grey-500 hover:text-grey-600 transition-colors duration-200 ${theme === 'dark' ? 'hover:text-purple-400' : ''}`}
                      >
                        View all activity 
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                    <div className="text-4xl">📈</div>
                  </div>
                  <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    No recent activity yet
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Start browsing or listing items to see your activity here!
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => navigate('/browse')}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                    >
                      Browse Items
                    </button>
                    <button
                      onClick={() => navigate('/list-item')}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                    >
                      List an Item
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Quick Tips */}
        <div>
          <h2 className="text-3xl font-bold mb-8 px-2">Quick Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex items-start space-x-8 p-6">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-purple-600" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-6 text-purple-600">
                  Build Your Reputation
                </h3>
                <p className={`text-base leading-relaxed mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Complete rentals and maintain your tools well to earn higher ratings and more bookings. Great reviews lead to more trust!
                </p>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Aim for 5-star reviews
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-8 p-6">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-purple-600" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-6 text-purple-600">
                  Maximize Earnings
                </h3>
                <p className={`text-base leading-relaxed mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Set competitive prices and keep your availability updated to attract more renters. Regular updates keep you visible!
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Stay active
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-green-500">💰</div>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Earn more
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}