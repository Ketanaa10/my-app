import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Search,
  User,
  Heart,
  Menu,
  Star,
  Calendar,
} from "lucide-react";

// Tailwind + Framer Motion based single-file React app
// Default export: App
// Usage: place this file as src/App.jsx in a Create React App / Vite project that has Tailwind configured.

const sampleListings = [
  {
    id: 1,
    title: "Sea-view Homestay with Terrace",
    location: "Kovalam, Kerala",
    price: 28,
    rating: 4.7,
    nights: 2,
    tags: ["Ocean", "Breakfast"],
    img: "https://images.unsplash.com/photo-1501117716987-c8e6d1f6d28e?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 2,
    title: "Cozy Mountain Cottage",
    location: "Munnar, Kerala",
    price: 35,
    rating: 4.9,
    nights: 3,
    tags: ["Mountain", "Hiking"],
    img: "https://images.unsplash.com/photo-1505692952040-7f6e3d8f6d3c?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 3,
    title: "Urban Studio Near Market",
    location: "Pondicherry",
    price: 18,
    rating: 4.3,
    nights: 1,
    tags: ["City", "Market"],
    img: "https://images.unsplash.com/photo-1542317854-0f6f7b0a4a52?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 4,
    title: "Heritage Home Stay",
    location: "Hampi",
    price: 22,
    rating: 4.6,
    nights: 2,
    tags: ["Heritage", "Guide"],
    img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=60",
  },
];

function Navbar({ onOpenAuth }) {
  return (
    <nav className="w-full bg-white/70 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-extrabold text-sky-600">TourEase</div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a className="hover:text-sky-600 transition">Explore</a>
            <a className="hover:text-sky-600 transition">Homestays</a>
            <a className="hover:text-sky-600 transition">Guides</a>
            <a className="hover:text-sky-600 transition">About</a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden md:flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg shadow" onClick={onOpenAuth}>
            <User size={16} /> Sign in
          </button>
          <button className="md:hidden p-2 rounded-lg bg-white shadow">
            <Menu size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero({ onSearch }) {
  const [q, setQ] = useState("");
  return (
    <header className="relative bg-gradient-to-br from-sky-500 to-emerald-400 text-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Find cozy homestays & local experiences</h1>
            <p className="mt-4 text-lg text-white/90">Search curated homestays, connect with local guides, and explore nearby attractions — personalized recommendations just for you.</p>

            <div className="mt-6">
              <div className="rounded-lg bg-white p-3 shadow-md flex items-center gap-2">
                <Search size={18} className="text-slate-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search destination or homestay" className="flex-1 outline-none text-slate-700" />
                <button onClick={() => onSearch(q)} className="bg-sky-600 text-white px-4 py-2 rounded-md">Search</button>
              </div>
              <div className="mt-2 text-sm text-white/90">Try: "Munnar", "Sea view", "Heritage"</div>
            </div>
          </motion.div>

          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/20">
              <img src="https://images.unsplash.com/photo-1505678261036-a3fcc5e884ee?auto=format&fit=crop&w=1200&q=60" alt="hero" className="w-full h-64 object-cover" />
            </div>
            <div className="absolute -bottom-6 left-4 bg-white rounded-xl p-4 shadow flex gap-4 items-center">
              <MapPin size={18} className="text-slate-600" />
              <div>
                <div className="text-sm text-slate-600">Featured:</div>
                <div className="font-semibold">Sunset Terrace — Kovalam</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}

function Tag({ children }) {
  return <span className="text-xs px-2 py-1 bg-white/30 text-white rounded-full">{children}</span>;
}

function ListingCard({ l }) {
  return (
    <motion.div whileHover={{ y: -6 }} className="bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden">
      <div className="relative h-44 md:h-48">
        <img src={l.img} alt={l.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3 bg-white/80 p-2 rounded-full">
          <Heart size={16} className="text-red-500" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">{l.title}</h3>
            <div className="text-sm text-slate-500">{l.location}</div>
          </div>
          <div className="text-right">
            <div className="font-bold">${l.price}/night</div>
            <div className="text-xs text-slate-500">Avg</div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-sky-600 text-white text-sm px-2 py-1 rounded">{l.rating} <Star size={12} /></div>
            <div className="text-sm text-slate-500">{l.nights} nights</div>
          </div>
          <div className="flex gap-2">
            {l.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button className="flex-1 bg-sky-600 text-white px-3 py-2 rounded-lg">Book</button>
          <button className="flex-1 border border-slate-200 px-3 py-2 rounded-lg">View</button>
        </div>
      </div>
    </motion.div>
  );
}

function Listings({ listings }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recommended homestays</h2>
          <p className="text-sm text-slate-500">Handpicked homestays with local charm & great reviews</p>
        </div>
        <div className="text-sm text-slate-500">Showing {listings.length} options</div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((l) => (
          <ListingCard l={l} key={l.id} />
        ))}
      </div>
    </section>
  );
}

function AttractionsPanel() {
  const attractions = [
    { name: "Lighthouse Beach", dist: "2.3 km" },
    { name: "Local Spice Market", dist: "1.1 km" },
    { name: "Old Fort", dist: "3.5 km" },
  ];
  return (
    <aside className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
        <div className="flex-1">
          <h3 className="font-semibold">Nearby Attractions</h3>
          <p className="text-sm text-slate-500">Quick local spots recommended by our guides</p>

          <ul className="mt-3 space-y-2">
            {attractions.map((a) => (
              <li key={a.name} className="flex items-center justify-between">
                <div className="text-sm">{a.name}</div>
                <div className="text-xs text-slate-400">{a.dist}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-40 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center">Map</div>
      </div>
    </aside>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-8 mt-12">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="text-xl font-bold">TourEase</div>
          <div className="text-sm text-slate-300 mt-2">Connect with local hosts and guides. Discover places that feel like home.</div>
        </div>
        <div className="text-sm text-slate-300">
          <div className="font-semibold">Explore</div>
          <ul className="mt-2 space-y-2">
            <li>Homestays</li>
            <li>Guides</li>
            <li>Experiences</li>
          </ul>
        </div>
        <div className="text-sm text-slate-300">
          <div className="font-semibold">Contact</div>
          <div className="mt-2">support@tourease.example</div>
        </div>
      </div>
    </footer>
  );
}

function AuthModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Sign in to TourEase</h3>
          <button className="text-slate-500" onClick={onClose}>✕</button>
        </div>
        <div className="mt-4">
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3" placeholder="Email" />
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3" placeholder="Password" type="password" />
          <button className="w-full bg-sky-600 text-white py-2 rounded-lg">Sign in</button>
          <div className="mt-3 text-sm text-slate-500">Or continue with</div>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 border rounded-lg py-2">Google</button>
            <button className="flex-1 border rounded-lg py-2">Phone</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [listings] = useState(sampleListings);
  const [authOpen, setAuthOpen] = useState(false);

  const onSearch = (q) => {
    // Very small demo — in a real app you'd hook this up to router/filters
    alert(`Searching for: ${q || "(all)"}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar onOpenAuth={() => setAuthOpen(true)} />
      <Hero onSearch={onSearch} />

      <main>
        <Listings listings={listings} />
        <AttractionsPanel />
      </main>

      <Footer />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
