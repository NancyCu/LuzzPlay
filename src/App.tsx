import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, LogOut, Zap, Flame, Target, CheckCircle2, ChevronRight, Heart, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, signInWithGoogle, logOut } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

import AIAssistant from './components/AIAssistant';
import ImageMatcher from './components/ImageMatcher';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

// --- Types ---
type Paddle = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  color: string;
  icon: React.ElementType;
  imageUrl: string;
};

// --- Data ---
export const PADDLES: Paddle[] = [
  {
    id: 'pro-cannon',
    name: 'Pro-Cannon',
    price: 159.99,
    description: 'The ultimate weapon for precision and baseline power. Features a Carbon Fiber T700 face for massive pop and spin.',
    features: ['Carbon Fiber T700 Face', 'Explosive Core', 'Pastel Edge Guard'],
    color: 'from-pink-400 to-cyan-300',
    icon: Target,
    imageUrl: '/images/pro-cannon.jpg',
  },
  {
    id: 'pro-4-tornazo',
    name: 'Pro-4 Tornazo',
    price: 149.99,
    description: 'Unleash a whirlwind of spin and control. Built with PEBAZ + CORE technology for an unbeatable soft touch.',
    features: ['PEBAZ + CORE', 'Aero-curve Shape', 'Purple Accent Guard'],
    color: 'from-purple-500 to-indigo-400',
    icon: Zap,
    imageUrl: '/images/tornazo.jpg',
  },
  {
    id: 'pro-blade-2',
    name: 'Pro-Blade 2',
    price: 169.99,
    description: 'Tournament-ready performance. Luzz UPA approved with Carbon Fiber T700 for aggressive drives and blocks.',
    features: ['Carbon Fiber T700', 'Luzz UPA Approved', 'Neon Blue Edge Guard'],
    color: 'from-blue-600 to-cyan-500',
    icon: Flame,
    imageUrl: '/images/pro-blade-2.jpg',
  },
  {
    id: 'luzz-covers',
    name: 'Luzz Paddle Covers',
    price: 24.99,
    description: 'Protect your investment with these premium, form-fitting neoprene Luzz paddle covers. Includes a 2-pack.',
    features: ['Premium Neoprene', 'Zipper Closure', 'Fits All Luzz Paddles'],
    color: 'from-gray-800 to-gray-600',
    icon: Star,
    imageUrl: '/images/luzz-covers.jpg',
  },
  {
    id: 'pro-blade-2-action',
    name: 'Pro-Blade 2 (Bundle)',
    price: 189.99,
    description: 'The Pro-Blade 2 bundled with extra overgrips and a premium cover. Maximize your court presence.',
    features: ['Carbon Fiber T700', 'Bundle Accessories', 'Neon Blue Edge Guard'],
    color: 'from-cyan-500 to-blue-700',
    icon: Flame,
    imageUrl: '/images/pro-blade-2-action.jpg',
  },
  {
    id: 'pro-4-inferno',
    name: 'Pro-4 Inferno',
    price: 154.99,
    description: 'Turn up the heat on the court. The Pro-4 Inferno features an advanced PP-Poly core and an aggressive pink-to-blue gradient aesthetic.',
    features: ['PP-Poly Core', 'Vibrant Edge Guard', 'Aerodynamic Profile'],
    color: 'from-pink-500 to-blue-500',
    icon: Flame,
    imageUrl: '/images/pro-4-inferno.jpg',
  },
  {
    id: 'golden-dragon',
    name: 'Golden Dragon Edition',
    price: 199.99,
    description: 'A masterpiece of design and performance. The limited Golden Dragon edition commands respect with its custom illustration and raw carbon face.',
    features: ['Custom Dragon Artwork', 'Raw Carbon Face', 'Premium Leather Grip'],
    color: 'from-yellow-600 to-black',
    icon: Zap,
    imageUrl: '/images/golden-dragon.jpg',
  },
  {
    id: 'obsidian-marble',
    name: 'Obsidian Marble',
    price: 179.99,
    description: 'Where luxury meets tournament-level play. Features a stunning fluid art design and an edge-to-edge textured sweet spot for maximum spin.',
    features: ['Marble Fluid Artwork', 'Textured Friction Face', 'Massive Sweet Spot'],
    color: 'from-gray-900 to-yellow-500',
    icon: Star,
    imageUrl: '/images/obsidian-marble.jpg',
  },
  {
    id: 'neon-sunset',
    name: 'Neon Sunset',
    price: 139.99,
    description: 'Stand out from the baseline. The Neon Sunset paddle captures the vibe with its striking gradient edge guard and lightweight honeycomb core.',
    features: ['Honeycomb Core', 'Lightweight Design', 'Gradient Aesthetic'],
    color: 'from-pink-500 to-purple-500',
    icon: Heart,
    imageUrl: '/images/neon-sunset.jpg',
  },
  {
    id: 'luna-eclipse',
    name: 'Luna Eclipse',
    price: 159.99,
    description: 'Master the soft game. The Luna Eclipse features a minimalist circular gradient design and comes with free Luzz edge tape to keep your paddle pristine.',
    features: ['Minimalist Aesthetic', 'Soft Touch Face', 'Includes Free Edge Tape'],
    color: 'from-gray-300 to-gray-700',
    icon: Target,
    imageUrl: '/images/luna-eclipse.jpg',
  },
  {
    id: 'pro2-archer',
    name: 'Pro2 Archer',
    price: 169.99,
    description: 'Built for speed and sharp angles. The Pro2 Archer boasts an angular neon blue accent and a pro-certified friction surface for massive dips and drives.',
    features: ['Pro-Certified Friction', 'Angular Sweet Spot', 'Aerodynamic Profile'],
    color: 'from-blue-400 to-cyan-500',
    icon: Zap,
    imageUrl: '/images/pro2-archer.jpg',
  },
  {
    id: 'neon-sunset-premium',
    name: 'Neon Sunset Premium',
    price: 149.99,
    description: 'An upgraded version of our baseline classic. The Neon Sunset Premium features an advanced textured surface and the same striking gradient neon aesthetic.',
    features: ['Upgraded Texture', 'Honeycomb Core', 'Gradient Edge Guard'],
    color: 'from-purple-500 to-pink-500',
    icon: Star,
    imageUrl: '/images/neon-sunset-premium.jpg',
  },
  {
    id: 'dragon-warrior',
    name: 'Dragon Warrior Edition',
    price: 219.99,
    description: 'Channel your inner Dragon Warrior. This exclusive DreamWorks Kung Fu Panda collaboration features a Carbon Fiber T700 face and custom Po artwork.',
    features: ['Carbon Fiber T700', 'Kung Fu Panda Collab', 'Exclusive White Trim'],
    color: 'from-gray-900 to-gray-700',
    icon: Flame,
    imageUrl: '/images/dragon-warrior.jpg',
  },
  {
    id: 'luzz-classic-gold',
    name: 'Luzz Classic Gold',
    price: 189.99,
    description: 'Elegance on the court. The Luzz Classic Gold features a striking asymmetrical gold line design on a matte black finish, engineered for ultimate spin control.',
    features: ['Matte Friction Face', 'Asymmetrical Gold Inlay', 'Precision Core'],
    color: 'from-yellow-600 to-black',
    icon: Star,
    imageUrl: '/images/luzz-classic-gold.jpg',
  },
  {
    id: 'pro-2-power',
    name: 'Pro-2 Power Edition',
    price: 174.99,
    description: 'Delivers 30% more power output compared to the Pro 1. The Pro-2 Power Edition is re-engineered with an advanced honeycomb core to maximize your smashes.',
    features: ['30% More Power', 'Advanced Honeycomb Core', 'Bold Blue Edge Guard'],
    color: 'from-blue-600 to-cyan-400',
    icon: Zap,
    imageUrl: '/images/pro-2-power.jpg',
  },
  {
    id: 'pro-blade-2-twilight',
    name: 'Pro-Blade 2 Twilight',
    price: 169.99,
    description: 'The beloved Pro-Blade 2, reimagined with a twilight fluid aesthetic. Equipped with Carbon Fiber T700, this paddle offers the perfect blend of power and control.',
    features: ['Carbon Fiber T700', 'Twilight Fluid Guard', 'Elongated Sweet Spot'],
    color: 'from-blue-800 to-gray-900',
    icon: Target,
    imageUrl: '/images/pro-blade-2-twilight.jpg',
  },
  {
    id: 'pro2-saber',
    name: 'Pro2 Saber',
    price: 159.99,
    description: 'Slice through the competition. The Pro2 Saber features sharp pink vector lines and an aerodynamic profile for lightning-fast hand speed at the kitchen.',
    features: ['Aerodynamic Design', 'Vector Line Aesthetic', 'High Deflection Face'],
    color: 'from-pink-600 to-black',
    icon: Zap,
    imageUrl: '/images/pro2-saber.jpg',
  },
  {
    id: 'pro-blade-2-stealth',
    name: 'Pro-Blade 2 Stealth',
    price: 179.99,
    description: 'Fly under the radar until you strike. The Stealth edition of the Pro-Blade 2 offers a murdered-out black profile with subtle blue accents.',
    features: ['Stealth Colorway', 'Carbon Fiber T700', 'Tournament Certified'],
    color: 'from-gray-900 to-black',
    icon: Flame,
    imageUrl: '/images/pro-blade-2-stealth.jpg',
  },
  {
    id: 'luzz-sunrise',
    name: 'Luzz Sunrise',
    price: 164.99,
    description: 'Bring the dawn to the court. The Luzz Sunrise features a breathtaking painted landscape of a sunrise over the mountains, built on a responsive fiberglass face.',
    features: ['Painted Sunrise Artwork', 'Fiberglass Face', 'Comfort Grip'],
    color: 'from-orange-500 to-yellow-400',
    icon: Flame,
    imageUrl: '/images/luzz-sunrise.jpg',
  },
  {
    id: 'luzz-pro-net',
    name: 'Luzz Pro Tournament Net',
    price: 249.99,
    description: 'Set up court anywhere. The Luzz Pro Tournament Net is regulation size, features lockable caster wheels, and boasts a heavy-duty powder-coated steel frame.',
    features: ['Regulation Size', 'Lockable Caster Wheels', 'Powder-Coated Steel'],
    color: 'from-gray-800 to-black',
    icon: Target,
    imageUrl: '/images/luzz-pro-net.jpg',
  },
  {
    id: 'butterfly-dream',
    name: 'Butterfly Dream',
    price: 149.99,
    description: 'Float like a butterfly on the court. This model features a delicate pastel gradient with white butterfly motifs, offering a soft touch and exceptional control.',
    features: ['Pastel Butterfly Design', 'Soft Touch Control', 'Lightweight Build'],
    color: 'from-blue-200 to-pink-200',
    icon: Heart,
    imageUrl: '/images/butterfly-dream.jpg',
  },
  {
    id: 'pro-4-inferno-angled',
    name: 'Pro-4 Inferno (Angled Accent)',
    price: 154.99,
    description: 'A striking variation of the Inferno. Features the same advanced PP-Poly core but with an angled blue accent line for a sharper look.',
    features: ['PP-Poly Core', 'Angled Accent Guard', 'High Deflection'],
    color: 'from-blue-500 to-cyan-400',
    icon: Zap,
    imageUrl: '/images/pro-4-inferno-angled.jpg',
  },
  {
    id: 'golden-dragon-classic',
    name: 'Golden Dragon (Classic Grip)',
    price: 199.99,
    description: 'The legendary Golden Dragon artwork, now offered with our classic perforated Luzz grip for players who prefer traditional handling.',
    features: ['Classic Perforated Grip', 'Custom Dragon Artwork', 'Raw Carbon Face'],
    color: 'from-yellow-600 to-black',
    icon: Star,
    imageUrl: '/images/golden-dragon-classic.jpg',
  },
  {
    id: 'kung-fu-panda-pro-cannon',
    name: 'Pro-Cannon Kung Fu Panda Edition',
    price: 209.99,
    description: 'The explosive power of the Pro-Cannon meets the legendary Dragon Warrior. This limited edition paddle features subtle black-on-black Kung Fu Panda aesthetics.',
    features: ['Exclusive DreamWorks Collab', 'Carbon Fiber T700', 'Explosive Core'],
    color: 'from-gray-700 to-black',
    icon: Flame,
    imageUrl: '/images/kung-fu-panda-pro-cannon.jpg',
  },
  {
    id: 'luzz-pro-1',
    name: 'Luzz Pro 1',
    price: 129.99,
    description: 'The paddle that started it all. The Luzz Pro 1 offers a balanced blend of control and power with a classic, understated all-black design.',
    features: ['Balanced Core', 'Classic All-Black Design', 'Beginner Friendly'],
    color: 'from-gray-900 to-black',
    icon: Target,
    imageUrl: '/images/luzz-pro-1.jpg',
  },
  {
    id: 'obsidian-marble-classic',
    name: 'Obsidian Marble (Classic Grip)',
    price: 179.99,
    description: 'The stunning liquid gold and black Obsidian Marble design, now available with our classic perforated leather grip for uncompromised feel.',
    features: ['Classic Leather Grip', 'Marble Fluid Artwork', 'Textured Face'],
    color: 'from-yellow-500 to-gray-900',
    icon: Star,
    imageUrl: '/images/obsidian-marble-classic.jpg',
  },
  {
    id: 'obsidian-marble-flat',
    name: 'Obsidian Marble (Flat Guard)',
    price: 179.99,
    description: 'A sleeker take on the Obsidian Marble. This version features a seamlessly integrated flat edge guard to maximize the aerodynamic profile of the paddle.',
    features: ['Flat Edge Guard', 'Marble Fluid Artwork', 'Textured Face'],
    color: 'from-yellow-400 to-black',
    icon: Zap,
    imageUrl: '/images/obsidian-marble-flat.jpg',
  },
  {
    id: 'luzz-tote-bag',
    name: 'Luzz Pickleball Tote Bag',
    price: 54.99,
    description: 'Arrive at the courts in style. This premium cream tote bag features dedicated exterior pockets for your paddle and balls, with luxurious tan leather straps.',
    features: ['Dedicated Paddle Pocket', 'Tan Leather Straps', 'Spacious Interior'],
    color: 'from-orange-200 to-orange-100',
    icon: Heart,
    imageUrl: '/images/luzz-tote-bag.jpg',
  },
  {
    id: 'luna-eclipse-moonbeam',
    name: 'Luna Eclipse Moonbeam',
    price: 159.99,
    description: 'A luminous variation of our soft-touch Luna Eclipse. The Moonbeam edition features a metallic silver gradient that shines under the court lights.',
    features: ['Metallic Silver Finish', 'Soft Touch Face', 'Ergonomic Grip'],
    color: 'from-gray-300 to-slate-400',
    icon: Target,
    imageUrl: '/images/luna-eclipse-moonbeam.jpg',
  },
  {
    id: 'pro2-saber-anatomy',
    name: 'Pro2 Saber (Anatomy Blueprint)',
    price: 164.99,
    description: 'Look inside the beast. This special informative edition of the Pro2 Saber exposes the 3K Carbon Fiber Protection, specially-cut 8mm PP Honeycomb Core, and raw carbon fabric.',
    features: ['Exposed Diagram Design', '8mm Honeycomb Core', '3K Carbon Protection'],
    color: 'from-pink-500 to-gray-800',
    icon: Zap,
    imageUrl: '/images/pro2-saber-anatomy.jpg',
  },
  {
    id: 'luzz-z-line-gold',
    name: 'Luzz Z-Line Gold',
    price: 184.99,
    description: 'Precision engineering meets luxury design. The Z-Line Gold features sharp, asymmetrical gold vector lines on a high-friction matte black surface.',
    features: ['Asymmetrical Gold Z-Lines', 'High-Friction Matte Surface', 'Pro-Level Deflection'],
    color: 'from-yellow-500 to-black',
    icon: Star,
    imageUrl: '/images/luzz-z-line-gold.jpg',
  },
];

// --- Components ---

const Navbar = ({ cartCount, user, onLogin, onLogout, cartAnimating }: { cartCount: number, user: any, onLogin: () => void, onLogout: () => void, cartAnimating: boolean }) => (
  <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/luzz-play-logo.png" alt="Luzz Play" className="h-[60px] w-auto drop-shadow-sm" />
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <motion.div animate={cartAnimating ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
              <ShoppingCart className="w-6 h-6" />
            </motion.div>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="Avatar" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                <span className="text-sm font-medium text-gray-700">{user.displayName?.split(' ')[0]}</span>
              </div>
              <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Log out">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button onClick={onLogin} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </div>
  </nav>
);

const StoreFront = ({ addToCart }: { addToCart: (paddle: Paddle) => void }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
              Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Game.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Premium pickleball paddles designed in California. Engineered for power, precision, and the perfect pop.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PADDLES.map((paddle, index) => (
            <motion.div
              key={paddle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col h-full overflow-hidden"
            >
              <div className="relative h-56 overflow-hidden bg-gray-100">
                <img
                  src={paddle.imageUrl}
                  alt={paddle.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${paddle.color} flex items-center justify-center text-white shadow-lg`}>
                    <paddle.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-grow">
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">{paddle.name}</h3>
                <p className="text-gray-500 mb-6 flex-grow">{paddle.description}</p>

                <div className="space-y-3 mb-8">
                  {paddle.features.map((feature, i) => (
                    <div key={i} className="flex items-center text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                  <span className="text-2xl font-bold text-gray-900">${paddle.price}</span>
                  <button
                    onClick={() => addToCart(paddle)}
                    className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 active:scale-95"
                  >
                    Add <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Cart = ({ cart, removeFromCart, user }: { cart: Paddle[], removeFromCart: (index: number) => void, user: any }) => {
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-8">Your Cart</h2>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-8">Looks like you haven't added any paddles yet.</p>
            <Link to="/" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              <AnimatePresence>
                {cart.map((item, index) => (
                  <motion.li
                    key={`${item.id}-${index}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6 flex items-center"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mr-4 flex-shrink-0`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-display text-lg font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">Premium Paddle</p>
                    </div>
                    <div className="text-right mr-6">
                      <span className="text-lg font-bold text-gray-900">${item.price}</span>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    >
                      Remove
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <div className="bg-gray-50 p-6 sm:p-8 border-t border-gray-100">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Subtotal</p>
                <p>${total.toFixed(2)}</p>
              </div>
              <p className="text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>

              {user ? (
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                >
                  Proceed to Checkout <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    Please sign in to complete your purchase.
                  </p>
                  <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center px-6 py-4 border border-gray-300 rounded-full shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
                    Sign in with Google
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CheckoutForm = ({ total, onComplete }: { total: number, onComplete: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/checkout?success=true',
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onComplete();
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-sm text-base font-medium text-white ${isProcessing || !stripe ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} transition-colors`}
      >
        {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
};

const Checkout = ({ cart, clearCart }: { cart: Paddle[], clearCart: () => void }) => {
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    if (cart.length === 0 && !isSuccess) {
      navigate('/');
      return;
    }

    if (cart.length > 0 && !clientSecret && !backendError) {
      fetch("https://us-central1-nguyen-superbowl-squares.cloudfunctions.net/createPaymentIntent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error?.message || 'Failed to initialize payment');
          }
          return data;
        })
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          }
        })
        .catch((err) => {
          console.error(err);
          setBackendError(err.message);
        });
    }
  }, [cart, navigate, isSuccess, clientSecret, backendError]);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-display text-3xl font-extrabold text-gray-900 mb-4">Order Confirmed!</h2>
          <p className="text-gray-500 mb-8">
            Thank you for your purchase. Your Luzz paddles are getting ready to ship. We'll send you an email with tracking details soon.
          </p>
          <Link
            to="/"
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Back to Store
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-900 text-white">
            <h2 className="font-display text-2xl font-bold">Checkout</h2>
            <p className="text-gray-400 mt-1">Complete your order of ${total.toFixed(2)}</p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-display text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="mt-1">
                    <input type="text" id="address" required className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 border" placeholder="123 Pickleball Lane" />
                  </div>
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                  <div className="mt-1">
                    <input type="text" id="city" required className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 border" placeholder="San Diego" />
                  </div>
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-700">ZIP / Postal code</label>
                  <div className="mt-1">
                    <input type="text" id="zip" required className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 border" placeholder="92101" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="font-display text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
              {!stripePromise && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-4 text-amber-700 text-sm">
                  Stripe is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY to your environment variables.
                </div>
              )}
              {backendError && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-4 text-red-700 text-sm">
                  <p className="font-bold mb-1">Payment Initialization Failed</p>
                  <p>{backendError}</p>
                  <p className="mt-2 text-xs">If you are the developer, please ensure STRIPE_SECRET_KEY is set in the AI Studio Secrets panel.</p>
                </div>
              )}
              {clientSecret && stripePromise ? (
                <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
                  <CheckoutForm total={total} onComplete={() => {
                    setIsSuccess(true);
                    clearCart();
                  }} />
                </Elements>
              ) : stripePromise && !backendError ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [cart, setCart] = useState<Paddle[]>([]);
  const [user, setUser] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [cartAnimating, setCartAnimating] = useState(false);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
  }, []);

  const addToCart = (paddle: Paddle) => {
    setCart([...cart, paddle]);
    setToast(`Added ${paddle.name} to cart!`);
    setCartAnimating(true);
    setTimeout(() => setCartAnimating(false), 300);
    setTimeout(() => setToast(null), 3000);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const clearCart = () => setCart([]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans relative">
        <Navbar cartCount={cart.length} user={user} onLogin={handleLogin} onLogout={logOut} cartAnimating={cartAnimating} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<StoreFront addToCart={addToCart} />} />
            <Route path="/matcher" element={<ImageMatcher />} />
            <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} user={user} />} />
            <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Luzz Play Pickleball. All rights reserved.</p>
          <p className="mt-2">Designed in California.</p>
        </footer>

        <AIAssistant />

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 50, x: '-50%' }}
              className="fixed bottom-6 left-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 font-medium"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}
