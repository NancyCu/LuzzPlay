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
    imageUrl: '/images/golden-dragon-edition.jpg',
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
    imageUrl: '/images/tornazo-angle.jpg',
  },
  {
    id: 'pro2-archer',
    name: 'Pro2 Archer',
    price: 169.99,
    description: 'Built for speed and sharp angles. The Pro2 Archer boasts an angular neon blue accent and a pro-certified friction surface for massive dips and drives.',
    features: ['Pro-Certified Friction', 'Angular Sweet Spot', 'Aerodynamic Profile'],
    color: 'from-blue-400 to-cyan-500',
    icon: Zap,
    imageUrl: '/images/pro2-saber-tech.jpg',
  },
  {
    id: 'neon-sunset-premium',
    name: 'Neon Sunset Premium',
    price: 149.99,
    description: 'An upgraded version of our baseline classic. The Neon Sunset Premium features an advanced textured surface and the same striking gradient neon aesthetic.',
    features: ['Upgraded Texture', 'Honeycomb Core', 'Gradient Edge Guard'],
    color: 'from-purple-500 to-pink-500',
    icon: Star,
    imageUrl: '/images/luzz-sunrise-angle.jpg',
  },
  {
    id: 'dragon-warrior',
    name: 'Dragon Warrior Edition',
    price: 219.99,
    description: 'Channel your inner Dragon Warrior. This exclusive DreamWorks Kung Fu Panda collaboration features a Carbon Fiber T700 face and custom Po artwork.',
    features: ['Carbon Fiber T700', 'Kung Fu Panda Collab', 'Exclusive White Trim'],
    color: 'from-gray-900 to-gray-700',
    icon: Flame,
    imageUrl: '/images/kung-fu-panda-collab.jpg',
  },
  {
    id: 'luzz-classic-gold',
    name: 'Luzz Classic Gold',
    price: 189.99,
    description: 'Elegance on the court. The Luzz Classic Gold features a striking asymmetrical gold line design on a matte black finish, engineered for ultimate spin control.',
    features: ['Matte Friction Face', 'Asymmetrical Gold Inlay', 'Precision Core'],
    color: 'from-yellow-600 to-black',
    icon: Star,
    imageUrl: '/images/golden-dragon-edition-angle.jpg',
  },
  {
    id: 'pro-2-power',
    name: 'Pro-2 Power Edition',
    price: 174.99,
    description: 'Delivers 30% more power output compared to the Pro 1. The Pro-2 Power Edition is re-engineered with an advanced honeycomb core to maximize your smashes.',
    features: ['30% More Power', 'Advanced Honeycomb Core', 'Bold Blue Edge Guard'],
    color: 'from-blue-600 to-cyan-400',
    icon: Zap,
    imageUrl: '/images/pro-cannon-tech.jpg',
  },
  {
    id: 'pro-blade-2-twilight',
    name: 'Pro-Blade 2 Twilight',
    price: 169.99,
    description: 'The beloved Pro-Blade 2, reimagined with a twilight fluid aesthetic. Equipped with Carbon Fiber T700, this paddle offers the perfect blend of power and control.',
    features: ['Carbon Fiber T700', 'Twilight Fluid Guard', 'Elongated Sweet Spot'],
    color: 'from-blue-800 to-gray-900',
    icon: Target,
    imageUrl: '/images/pro-blade-2-fog.jpg',
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
    imageUrl: '/images/pro-blade-2-angle.jpg',
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
    imageUrl: '/images/champion-net.jpg',
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
    imageUrl: '/images/pro-4-inferno-blue-angle.jpg',
  },
  {
    id: 'golden-dragon-classic',
    name: 'Golden Dragon (Classic Grip)',
    price: 199.99,
    description: 'The legendary Golden Dragon artwork, now offered with our classic perforated Luzz grip for players who prefer traditional handling.',
    features: ['Classic Perforated Grip', 'Custom Dragon Artwork', 'Raw Carbon Face'],
    color: 'from-yellow-600 to-black',
    icon: Star,
    imageUrl: '/images/-6bbb-4b5d-81c9-383b00ba5d49.jpg',
  },
  {
    id: 'kung-fu-panda-pro-cannon',
    name: 'Pro-Cannon Kung Fu Panda Edition',
    price: 209.99,
    description: 'The explosive power of the Pro-Cannon meets the legendary Dragon Warrior. This limited edition paddle features subtle black-on-black Kung Fu Panda aesthetics.',
    features: ['Exclusive DreamWorks Collab', 'Carbon Fiber T700', 'Explosive Core'],
    color: 'from-gray-700 to-black',
    icon: Flame,
    imageUrl: '/images/kung-fu-panda-collab-angle.jpg',
  },
  {
    id: 'luzz-pro-1',
    name: 'Luzz Pro 1',
    price: 129.99,
    description: 'The paddle that started it all. The Luzz Pro 1 offers a balanced blend of control and power with a classic, understated all-black design.',
    features: ['Balanced Core', 'Classic All-Black Design', 'Beginner Friendly'],
    color: 'from-gray-900 to-black',
    icon: Target,
    imageUrl: '/images/pro-cannon-face.jpg',
  },
  {
    id: 'obsidian-marble-classic',
    name: 'Obsidian Marble (Classic Grip)',
    price: 179.99,
    description: 'The stunning liquid gold and black Obsidian Marble design, now available with our classic perforated leather grip for uncompromised feel.',
    features: ['Classic Leather Grip', 'Marble Fluid Artwork', 'Textured Face'],
    color: 'from-yellow-500 to-gray-900',
    icon: Star,
    imageUrl: '/images/pro-cannon-angle.jpg',
  },
  {
    id: 'obsidian-marble-flat',
    name: 'Obsidian Marble (Flat Guard)',
    price: 179.99,
    description: 'A sleeker take on the Obsidian Marble. This version features a seamlessly integrated flat edge guard to maximize the aerodynamic profile of the paddle.',
    features: ['Flat Edge Guard', 'Marble Fluid Artwork', 'Textured Face'],
    color: 'from-yellow-400 to-black',
    icon: Zap,
    imageUrl: '/images/kung-fu-panda-collab-tech.jpg',
  },
  {
    id: 'luzz-tote-bag',
    name: 'Luzz Pickleball Tote Bag',
    price: 54.99,
    description: 'Arrive at the courts in style. This premium cream tote bag features dedicated exterior pockets for your paddle and balls, with luxurious tan leather straps.',
    features: ['Dedicated Paddle Pocket', 'Tan Leather Straps', 'Spacious Interior'],
    color: 'from-orange-200 to-orange-100',
    icon: Heart,
    imageUrl: '/images/luzz-covers-close.jpg',
  },
  {
    id: 'luna-eclipse-moonbeam',
    name: 'Luna Eclipse Moonbeam',
    price: 159.99,
    description: 'A luminous variation of our soft-touch Luna Eclipse. The Moonbeam edition features a metallic silver gradient that shines under the court lights.',
    features: ['Metallic Silver Finish', 'Soft Touch Face', 'Ergonomic Grip'],
    color: 'from-gray-300 to-slate-400',
    icon: Target,
    imageUrl: '/images/luzz-net-post.jpg',
  },
  {
    id: 'pro2-saber-anatomy',
    name: 'Pro2 Saber (Anatomy Blueprint)',
    price: 164.99,
    description: 'Look inside the beast. This special informative edition of the Pro2 Saber exposes the 3K Carbon Fiber Protection, specially-cut 8mm PP Honeycomb Core, and raw carbon fabric.',
    features: ['Exposed Diagram Design', '8mm Honeycomb Core', '3K Carbon Protection'],
    color: 'from-pink-500 to-gray-800',
    icon: Zap,
    imageUrl: '/images/pro2-saber-grip.jpg',
  },
  {
    id: 'luzz-z-line-gold',
    name: 'Luzz Z-Line Gold',
    price: 184.99,
    description: 'Precision engineering meets luxury design. The Z-Line Gold features sharp, asymmetrical gold vector lines on a high-friction matte black surface.',
    features: ['Asymmetrical Gold Z-Lines', 'High-Friction Matte Surface', 'Pro-Level Deflection'],
    color: 'from-yellow-500 to-black',
    icon: Star,
    imageUrl: '/images/pickleball-net.jpg',
  },
  {
    id: 'addie-love',
    name: 'Addie Love',
    price: 2.50,
    description: 'Made with a lot of love.',
    features: ['Soft Plush', 'Adorable Heart', 'Maximum Cuteness'],
    color: 'from-pink-400 to-red-500',
    icon: Heart,
    imageUrl: '/images/addie_love.jpg',
  },
];

// --- Components ---

const Navbar = ({ cartCount, user, onLogin, onLogout, cartAnimating }: { cartCount: number, user: any, onLogin: () => void, onLogout: () => void, cartAnimating: boolean }) => (
  <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-28 items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/luzz-play-logo.png" alt="Luzz Play" className="h-[100px] w-auto drop-shadow-sm brightness-200" />
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <motion.div animate={cartAnimating ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
              <ShoppingCart className="w-6 h-6" />
            </motion.div>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-lime-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-700" referrerPolicy="no-referrer" />
                <span className="text-sm font-medium text-gray-300">{user.displayName?.split(' ')[0]}</span>
              </div>
              <button onClick={onLogout} className="p-2 text-gray-400 hover:text-lime-500 transition-colors" title="Log out">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button onClick={onLogin} className="flex items-center gap-2 bg-lime-500 text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-lime-400 transition-colors shadow-lg shadow-lime-500/20">
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
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-black border-b border-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black opacity-80" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
              Elevate Your <span className="text-lime-500 text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">Game.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Premium pickleball paddles designed in California. Engineered for power, precision, and the perfect pop.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {PADDLES.map((paddle, index) => (
            <motion.div
              key={paddle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-900 rounded-3xl shadow-2xl shadow-black/80 hover:shadow-lime-500/10 transition-all duration-300 border border-gray-800 hover:border-gray-700 group flex flex-col h-full overflow-hidden"
            >
              <div className="relative h-64 overflow-hidden bg-black">
                <img
                  src={paddle.imageUrl}
                  alt={paddle.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${paddle.color} flex items-center justify-center text-white shadow-lg shadow-black/50 border border-white/10`}>
                    <paddle.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-grow relative">
                <h3 className="font-display text-2xl font-bold text-white mb-3">{paddle.name}</h3>
                <p className="text-gray-400 mb-6 flex-grow leading-relaxed">{paddle.description}</p>

                <div className="space-y-3 mb-8 bg-black/40 p-5 rounded-2xl border border-gray-800/50">
                  {paddle.features.map((feature, i) => (
                    <div key={i} className="flex items-center text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-lime-500 mr-3 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-800">
                  <span className="text-3xl font-bold text-white">${paddle.price}</span>
                  <button
                    onClick={() => addToCart(paddle)}
                    className="bg-lime-500 text-black px-6 py-3 rounded-full font-bold hover:bg-lime-400 transition-colors flex items-center gap-2 active:scale-95 shadow-lg shadow-lime-500/20"
                  >
                    Add <ShoppingCart className="w-4 h-4 font-bold" />
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
    <div className="min-h-screen bg-black py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl font-extrabold text-white mb-10 tracking-tight">Your Cart</h2>

        {cart.length === 0 ? (
          <div className="bg-gray-900 rounded-3xl p-16 text-center shadow-2xl shadow-black/50 border border-gray-800">
            <ShoppingCart className="w-20 h-20 text-gray-700 mx-auto mb-6" />
            <h3 className="text-2xl font-display font-bold text-white mb-3">Your cart is empty</h3>
            <p className="text-gray-400 mb-10 text-lg">Looks like you haven't added any premium gear yet.</p>
            <Link to="/" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-full text-black bg-lime-500 hover:bg-lime-400 transition-colors shadow-lg shadow-lime-500/20">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-3xl shadow-2xl shadow-black/80 border border-gray-800 overflow-hidden">
            <ul className="divide-y divide-gray-800/50">
              <AnimatePresence>
                {cart.map((item, index) => (
                  <motion.li
                    key={`${item.id}-${index}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6 sm:p-8 flex items-center"
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mr-6 flex-shrink-0 shadow-inner border border-white/10`}>
                      <item.icon className="w-8 h-8" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-display text-xl font-bold text-white mb-1">{item.name}</h4>
                      <p className="text-sm text-lime-500 font-medium">Premium Edition</p>
                    </div>
                    <div className="text-right mr-8">
                      <span className="text-2xl font-bold text-white">${item.price}</span>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-gray-500 hover:text-red-500 transition-colors p-3 hover:bg-red-500/10 rounded-full"
                    >
                      Remove
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <div className="bg-black/50 p-8 sm:p-10 border-t border-gray-800">
              <div className="flex justify-between text-xl font-bold text-white mb-4">
                <p>Subtotal</p>
                <p>${total.toFixed(2)}</p>
              </div>
              <p className="text-sm text-gray-400 mb-10">Shipping and taxes calculated at checkout.</p>

              {user ? (
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full flex items-center justify-center px-8 py-5 border border-transparent rounded-full shadow-lg shadow-lime-500/20 text-lg font-bold text-black bg-lime-500 hover:bg-lime-400 transition-colors"
                >
                  Proceed to Checkout <ChevronRight className="w-6 h-6 ml-2" />
                </button>
              ) : (
                <div className="text-center space-y-5 border-t border-gray-800 pt-8 mt-8">
                  <p className="text-sm font-medium text-lime-400 bg-lime-900/20 p-4 rounded-xl border border-lime-500/20">
                    Sign in to secure your gear and check out.
                  </p>
                  <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center px-8 py-5 border border-gray-700 rounded-full shadow-lg text-lg font-bold text-white bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3" />
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
      <PaymentElement options={{ theme: 'night' }} />
      {errorMessage && <div className="text-red-400 text-sm font-medium">{errorMessage}</div>}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full flex justify-center py-5 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold text-black ${isProcessing || !stripe ? 'bg-gray-700 text-gray-400 cursor-not-allowed shadow-none' : 'bg-lime-500 hover:bg-lime-400 shadow-lime-500/20'} transition-all duration-200`}
      >
        {isProcessing ? 'Processing SECURE Payment...' : `Pay $${total.toFixed(2)}`}
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
      <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-gray-900 rounded-3xl shadow-2xl shadow-black p-10 text-center border border-gray-800"
        >
          <div className="w-24 h-24 bg-lime-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-lime-500/30">
            <CheckCircle2 className="w-12 h-12 text-lime-400" />
          </div>
          <h2 className="font-display text-4xl font-extrabold text-white mb-4">Order Confirmed!</h2>
          <p className="text-gray-400 mb-10 text-lg leading-relaxed">
            Thank you for stepping onto the Neon Court. Your premium paddles are being prepped. We'll send tracking details soon.
          </p>
          <Link
            to="/"
            className="w-full flex items-center justify-center px-8 py-4 border border-transparent rounded-full shadow-lg shadow-lime-500/20 text-lg font-bold text-black bg-lime-500 hover:bg-lime-400 transition-colors"
          >
            Back to Store
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-3xl shadow-2xl shadow-black/80 border border-gray-800 overflow-hidden">
          <div className="p-8 sm:p-10 border-b border-gray-800 bg-black/50">
            <h2 className="font-display text-3xl font-extrabold text-white">Secure Checkout</h2>
            <p className="text-gray-400 mt-2 text-lg">Complete your order of <span className="text-white font-bold">${total.toFixed(2)}</span></p>
          </div>

          <div className="p-8 sm:p-10 space-y-8">
            <div>
              <h3 className="font-display text-xl font-bold text-white mb-6">Shipping Information</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-400 mb-2">Address</label>
                  <div className="mt-1">
                    <input type="text" id="address" required className="bg-black text-white focus:ring-lime-500 focus:border-lime-500 block w-full sm:text-base border-gray-700 rounded-xl p-4 border transition-colors outline-none" placeholder="123 Neon Court Lane" />
                  </div>
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-400 mb-2">City</label>
                  <div className="mt-1">
                    <input type="text" id="city" required className="bg-black text-white focus:ring-lime-500 focus:border-lime-500 block w-full sm:text-base border-gray-700 rounded-xl p-4 border transition-colors outline-none" placeholder="Los Angeles" />
                  </div>
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-400 mb-2">ZIP / Postal code</label>
                  <div className="mt-1">
                    <input type="text" id="zip" required className="bg-black text-white focus:ring-lime-500 focus:border-lime-500 block w-full sm:text-base border-gray-700 rounded-xl p-4 border transition-colors outline-none" placeholder="90210" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-800">
              <h3 className="font-display text-xl font-bold text-white mb-6">Payment Details</h3>
              {!stripePromise && (
                <div className="bg-amber-900/20 p-5 rounded-xl border border-amber-500/30 mb-6 text-amber-200 text-sm">
                  Stripe is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY to your environment variables.
                </div>
              )}
              {backendError && (
                <div className="bg-red-900/20 p-5 rounded-xl border border-red-500/30 mb-6 text-red-300 text-sm">
                  <p className="font-bold mb-2">Payment Initialization Failed</p>
                  <p>{backendError}</p>
                </div>
              )}
              {clientSecret && stripePromise ? (
                <Elements options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#84cc16', colorBackground: '#000000', colorText: '#ffffff', colorDanger: '#ef4444', fontFamily: 'inherit' } } }} stripe={stripePromise}>
                  <CheckoutForm total={total} onComplete={() => {
                    setIsSuccess(true);
                    clearCart();
                  }} />
                </Elements>
              ) : stripePromise && !backendError ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lime-500"></div>
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
  // Safe localStorage initialization
  const [cart, setCart] = useState<Paddle[]>(() => {
    try {
      const saved = window.localStorage.getItem('neon_court_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
      return [];
    }
  });

  const [user, setUser] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [cartAnimating, setCartAnimating] = useState(false);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    window.localStorage.setItem('neon_court_cart', JSON.stringify(cart));
  }, [cart]);

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
      <div className="min-h-screen bg-black flex flex-col font-sans relative">
        <Navbar cartCount={cart.length} user={user} onLogin={handleLogin} onLogout={logOut} cartAnimating={cartAnimating} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<StoreFront addToCart={addToCart} />} />
            <Route path="/matcher" element={<ImageMatcher />} />
            <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} user={user} />} />
            <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
          </Routes>
        </main>
        <footer className="bg-black border-t border-gray-900 py-12 text-center text-gray-500 text-sm">
          <div className="inline-block px-4 py-1 border border-lime-500/20 rounded-full text-lime-500 text-xs font-bold mb-4 bg-lime-500/10">
            NEON COURT EXCLUSIVE
          </div>
          <p>&copy; {new Date().getFullYear()} Neon Court Pickleball. Premium Gear Only.</p>
          <p className="mt-2 text-gray-600">Designed in California.</p>
        </footer>

        <AIAssistant />

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 50, x: '-50%' }}
              className="fixed bottom-8 left-1/2 bg-gray-800 text-white px-8 py-4 rounded-full shadow-2xl z-50 flex items-center gap-3 font-bold border border-gray-700"
            >
              <CheckCircle2 className="w-5 h-5 text-lime-400" />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}
