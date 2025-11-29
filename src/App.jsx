// src/App.jsx
import React, { useEffect, useState, useRef } from "react";

/* ------------------ Helpers ------------------ */
const uid = (p = "") => `${p}${Date.now()}${Math.floor(Math.random() * 10000)}`;

const LS = {
  get(k, fallback) {
    try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
  },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};

/* default demo accounts (you can remove later) */
const DEFAULT_DATA = {
  hosts: [{ username: "host1", password: "1234", id: uid("h-") }],
  users: [{ username: "user1", password: "1111", id: uid("u-") }],
  listings: [
    {
      id: uid("lst-"),
      title: "Cozy Riverside Home",
      city: "Alleppey",
      price: 18,
      description: "Lovely backwater stay",
      images: [], // empty, host can add images
      hostId: null
    }
  ],
  bookings: []
};

/* ------------------ App ------------------ */
export default function App() {
  // app mode: landing | host-signup | host-login | host-portal | user-signup | user-login | user-portal
  const [mode, setMode] = useState(LS.get("app_mode", "landing"));

  // accounts & data
  const [hosts, setHosts] = useState(LS.get("hosts", DEFAULT_DATA.hosts));
  const [users, setUsers] = useState(LS.get("users", DEFAULT_DATA.users));
  const [listings, setListings] = useState(LS.get("listings", DEFAULT_DATA.listings));
  const [bookings, setBookings] = useState(LS.get("bookings", DEFAULT_DATA.bookings));

  // current sessions
  const [currentHost, setCurrentHost] = useState(LS.get("currentHost", null));
  const [currentUser, setCurrentUser] = useState(LS.get("currentUser", null));

  // UI state
  const [viewListing, setViewListing] = useState(null); // listing object for gallery/detail modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingTarget, setBookingTarget] = useState(null);

  // persist data
  useEffect(() => LS.set("hosts", hosts), [hosts]);
  useEffect(() => LS.set("users", users), [users]);
  useEffect(() => LS.set("listings", listings), [listings]);
  useEffect(() => LS.set("bookings", bookings), [bookings]);
  useEffect(() => LS.set("currentHost", currentHost), [currentHost]);
  useEffect(() => LS.set("currentUser", currentUser), [currentUser]);
  useEffect(() => LS.set("app_mode", mode), [mode]);

  /* ---------------- Landing ---------------- */
  function Landing() {
    return (
      <div className="landing container">
        <div className="topbar">
          <div className="brand">HomestayConnect</div>
          <div className="row">
            {currentHost ? <div className="small">Host: <strong>{currentHost.username}</strong></div> : null}
            {currentUser ? <div className="small">User: <strong>{currentUser.username}</strong></div> : null}
          </div>
        </div>

        <h1 style={{marginTop:18}}>Welcome to HomestayConnect</h1>
        <p className="small">Choose how you want to continue</p>

        <div className="options mt">
          <div className="option-card card" onClick={() => setMode("host-login")}>
            <h3>🏡 Host</h3>
            <p className="small">Add & manage your homestays</p>
          </div>
          <div className="option-card card" onClick={() => setMode("user-login")}>
            <h3>✨ User</h3>
            <p className="small">Browse and book stays</p>
          </div>
        </div>

        <div style={{marginTop:24}} className="small">You can sign up as Host or User — credentials are saved in your browser.</div>

        <section style={{marginTop:30}}>
          <h3>Explore sample listings</h3>
          <div className="grid cols-3">
            {listings.map(l => (
              <div key={l.id} className="listing card listing-card" onClick={() => { setViewListing(l); }}>
                <img className="listing-img" src={l.images[0] || placeholderImage(l.title)} alt={l.title} />
                <div className="listing-meta">
                  <div className="listing-title">{l.title}</div>
                  <div className="listing-sub small">{l.city} • ₹{l.price}/night</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  /* ---------------- Helpers ---------------- */
  function placeholderImage(text = "stay") {
    // nice simple placeholder using picsum with text hashed
    const hash = encodeURIComponent(text.slice(0, 8));
    return `https://picsum.photos/seed/${hash}/800/500`;
  }

  /* ---------------- Signup / Login (Hosts) ---------------- */
  function HostSignup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    function submit(e) {
      e.preventDefault();
      if (!username.trim() || !password.trim()) return alert("Enter username & password");
      // check duplicate
      if (hosts.find(h => h.username === username.trim())) return alert("Host username taken");
      const newHost = { username: username.trim(), password: password.trim(), id: uid("h-") };
      setHosts([newHost, ...hosts]);
      setCurrentHost(newHost);
      alert("Host account created ✅");
      setMode("host");
    }

    return (
      <div className="container page">
        <h2>Host Sign Up</h2>
        <form onSubmit={submit} style={{maxWidth:480}}>
          <input className="input" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <div style={{display:"flex",gap:8}}>
            <button className="btn primary" type="submit">Create Host</button>
            <button className="btn ghost" type="button" onClick={()=>setMode("landing")}>Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  function HostLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    function submit(e) {
      e.preventDefault();
      const found = hosts.find(h => h.username === username && h.password === password);
      if (!found) return alert("Invalid host username or password");
      setCurrentHost(found);
      setMode("host");
    }

    return (
      <div className="container page">
        <h2>Host Login</h2>
        <form onSubmit={submit} style={{maxWidth:480}}>
          <input className="input" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <div style={{display:"flex",gap:8}}>
            <button className="btn primary" type="submit">Sign in</button>
            <button className="btn ghost" type="button" onClick={()=>setMode("host-signup")}>Create account</button>
            <button className="btn ghost" type="button" onClick={()=>setMode("landing")}>Back</button>
          </div>
        </form>
      </div>
    );
  }

  /* ---------------- Host Portal ---------------- */
  function HostPortal() {
    const [title, setTitle] = useState("");
    const [city, setCity] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [imageFiles, setImageFiles] = useState([]); // base64 strings

    // file input handler: convert to base64
    function onFiles(e) {
      const files = Array.from(e.target.files || []);
      const readers = files.map(f => {
        return new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(f);
        });
      });
      Promise.all(readers).then(results => setImageFiles(prev => [...prev, ...results])).catch(()=>alert("Image read error"));
    }

    function addListing(e) {
      e.preventDefault();
      if (!title.trim() || !city.trim() || !price) return alert("Title, city and price required");
      const newListing = {
        id: uid("lst-"),
        title: title.trim(),
        city: city.trim(),
        price: Number(price),
        description: description.trim(),
        images: imageFiles,
        hostId: currentHost.id,
        createdAt: new Date().toISOString()
      };
      setListings([newListing, ...listings]);
      // reset
      setTitle(""); setCity(""); setPrice(""); setDescription(""); setImageFiles([]);
    }

    function removeListing(id) {
      if (!confirm("Delete listing?")) return;
      setListings(listings.filter(l => l.id !== id));
    }

    // host's own listings
    const my = listings.filter(l => l.hostId === currentHost.id);

    return (
      <div>
        <div className="topbar container">
          <div className="brand">Host dashboard</div>
          <div className="row">
            <div className="small">Signed in: <strong>{currentHost.username}</strong></div>
            <button className="btn ghost" onClick={() => { setCurrentHost(null); setMode("landing"); }}>Logout</button>
          </div>
        </div>

        <div className="container page">
          <div className="card">
            <h3>Add new listing</h3>
            <form onSubmit={addListing}>
              <input className="input" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
              <input className="input" placeholder="City" value={city} onChange={(e)=>setCity(e.target.value)} />
              <input className="input" placeholder="Price per night" value={price} onChange={(e)=>setPrice(e.target.value)} />
              <textarea className="input" placeholder="Short description" value={description} onChange={(e)=>setDescription(e.target.value)} rows={3} />
              <input type="file" accept="image/*" multiple onChange={onFiles} />
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button className="btn primary" type="submit">Add listing</button>
              </div>
              <div className="mt">
                {imageFiles.length>0 && <div className="small">Preview:</div>}
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
                  {imageFiles.map((s,i)=>(<img key={i} src={s} alt="" style={{width:120,height:80,objectFit:"cover",borderRadius:8}}/>))}
                </div>
              </div>
            </form>
          </div>

          <h3 className="mt">Your listings</h3>
          <div className="grid cols-3">
            {my.length===0 && <div className="card small">You have not added any listings yet.</div>}
            {my.map(l => (
              <div className="card listing-card" key={l.id}>
                <img className="listing-img" src={l.images[0] || placeholderImage(l.title)} alt={l.title} />
                <div className="listing-meta">
                  <div className="listing-title">{l.title}</div>
                  <div className="listing-sub small">{l.city} • ₹{l.price}/night</div>
                  <div style={{marginTop:8}} className="row">
                    <button className="btn ghost" onClick={()=>setViewListing(l)}>View</button>
                    <button className="btn danger" onClick={()=>removeListing(l.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Signup / Login (Users) ---------------- */
  function UserSignup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    function submit(e) {
      e.preventDefault();
      if (!username.trim() || !password.trim()) return alert("Enter username & password");
      if (users.find(u => u.username === username.trim())) return alert("User username taken");
      const newUser = { username: username.trim(), password: password.trim(), id: uid("u-") };
      setUsers([newUser, ...users]);
      setCurrentUser(newUser);
      alert("User account created ✅");
      setMode("user");
    }

    return (
      <div className="container page">
        <h2>User Sign Up</h2>
        <form onSubmit={submit} style={{maxWidth:480}}>
          <input className="input" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <div style={{display:"flex",gap:8}}>
            <button className="btn primary" type="submit">Create User</button>
            <button className="btn ghost" type="button" onClick={()=>setMode("landing")}>Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  function UserLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    function submit(e) {
      e.preventDefault();
      const found = users.find(u => u.username === username && u.password === password);
      if (!found) return alert("Invalid user username or password");
      setCurrentUser(found);
      setMode("user");
    }

    return (
      <div className="container page">
        <h2>User Login</h2>
        <form onSubmit={submit} style={{maxWidth:480}}>
          <input className="input" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <div style={{display:"flex",gap:8}}>
            <button className="btn primary" type="submit">Sign in</button>
            <button className="btn ghost" type="button" onClick={()=>setMode("user-signup")}>Create account</button>
            <button className="btn ghost" type="button" onClick={()=>setMode("landing")}>Back</button>
          </div>
        </form>
      </div>
    );
  }

  /* ---------------- User Portal ---------------- */
  function UserPortal() {
    function startBooking(listing) {
      if (!currentUser) { alert("Please sign in as a user first"); setMode("user-login"); return; }
      setBookingTarget(listing);
      setShowBookingModal(true);
    }

    return (
      <div>
        <div className="topbar container">
          <div className="brand">User portal</div>
          <div className="row">
            <div className="small">Signed in: <strong>{currentUser?.username}</strong></div>
            <button className="btn ghost" onClick={() => { setCurrentUser(null); setMode("landing"); }}>Logout</button>
          </div>
        </div>

        <div className="container page">
          <h3>Listings</h3>
          <div className="grid cols-3">
            {listings.map(l => (
              <div className="card listing-card" key={l.id}>
                <img className="listing-img" src={l.images[0] || placeholderImage(l.title)} alt={l.title} />
                <div className="listing-meta">
                  <div className="listing-title">{l.title}</div>
                  <div className="listing-sub small">{l.city} • ₹{l.price}/night</div>
                  <div style={{marginTop:8}} className="row">
                    <button className="btn ghost" onClick={()=>setViewListing(l)}>View</button>
                    <button className="btn primary" onClick={()=>startBooking(l)}>Book</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="mt">Your Bookings</h3>
          <div className="grid cols-2">
            {bookings.filter(b => b.userId === currentUser?.id).length === 0 && <div className="card small">No bookings yet</div>}
            {bookings.filter(b => b.userId === currentUser?.id).map(b => (
              <div className="card" key={b.id}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:700}}>{b.listingTitle}</div>
                    <div className="small">{b.guestName} • ID: {b.guestIdNo}</div>
                    <div className="small">{b.start} → {b.end}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Listing / Gallery Modal ---------------- */
  function ListingModal({ listing, onClose }) {
    const [idx, setIdx] = useState(0);
    if (!listing) return null;
    const imgs = listing.images && listing.images.length ? listing.images : [placeholderImage(listing.title)];

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(e)=>e.stopPropagation()}>
          <div style={{display:"flex",gap:12}}>
            <div style={{flex:1}}>
              <img src={imgs[idx]} alt="" style={{width:"100%",height:360,objectFit:"cover",borderRadius:10}} />
              <div style={{display:"flex",gap:8,marginTop:8,overflowX:"auto"}}>
                {imgs.map((s,i)=>(
                  <img key={i} src={s} onClick={()=>setIdx(i)} alt="" style={{width:80,height:56,objectFit:"cover",borderRadius:8,cursor:"pointer",outline: i===idx ? "3px solid var(--lavender)" : "none"}} />
                ))}
              </div>
            </div>
            <div style={{width:320}}>
              <h3>{listing.title}</h3>
              <div className="small">{listing.city} • ₹{listing.price}/night</div>
              <p style={{marginTop:12}}>{listing.description}</p>
              <div style={{marginTop:18}} className="row">
                <button className="btn primary" onClick={()=>{ setBookingTarget(listing); setShowBookingModal(true); }}>Book</button>
                <button className="btn ghost" onClick={onClose}>Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Booking Modal (requires ID + image upload) ---------------- */
  function BookingModal({ listing, onClose }) {
    const [guestName, setGuestName] = useState(currentUser?.username || "");
    const [guestIdNo, setGuestIdNo] = useState("");
    const [idProofImage, setIdProofImage] = useState(null);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");

    const fileInputRef = useRef(null);

    // convert file to base64
    function onFile(e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => setIdProofImage(reader.result);
      reader.onerror = () => alert("Failed to read file");
      reader.readAsDataURL(f);
    }

    function submit(e) {
      e.preventDefault();
      if (!guestName.trim() || !guestIdNo.trim()) return alert("Enter name and ID number");
      if (!idProofImage) return alert("Please upload an image of your ID proof");
      if (!start || !end || new Date(start) > new Date(end)) return alert("Pick valid start and end dates");

      // if user is signed in, require match
      if (currentUser && guestName !== currentUser.username) return alert("Name must match the signed-in user");
      // save booking
      const b = {
        id: uid("bk-"),
        listingId: listing.id,
        listingTitle: listing.title,
        guestName,
        guestIdNo,
        idProofImage,
        start, end,
        userId: currentUser ? currentUser.id : null,
        createdAt: new Date().toISOString()
      };
      setBookings([b, ...bookings]);
      alert("Booking saved ✅");
      onClose();
    }

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(e)=>e.stopPropagation()}>
          <h3>Book: {listing.title}</h3>
          <form onSubmit={submit}>
            <label className="small">Full name</label>
            <input className="input" value={guestName} onChange={(e)=>setGuestName(e.target.value)} />

            <label className="small">ID proof number</label>
            <input className="input" value={guestIdNo} onChange={(e)=>setGuestIdNo(e.target.value)} />

            <label className="small">Upload ID proof image (photo)</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onFile} />

            {idProofImage && <div style={{marginTop:8}}><img src={idProofImage} alt="id" style={{width:160,height:110,objectFit:"cover",borderRadius:8}}/></div>}

            <div className="row mt">
              <div style={{flex:1}}>
                <label className="small">Start</label>
                <input className="input" type="date" value={start} onChange={(e)=>setStart(e.target.value)} />
              </div>
              <div style={{flex:1}}>
                <label className="small">End</label>
                <input className="input" type="date" value={end} onChange={(e)=>setEnd(e.target.value)} />
              </div>
            </div>

            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button className="btn primary" type="submit">Confirm booking</button>
              <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ---------------- Render top-level modes ---------------- */
  // choose which view to show
  if (mode === "landing") return <Landing />;
  if (mode === "host-signup") return <HostSignup />;
  if (mode === "host-login") return <HostLogin />;
  if (mode === "host") {
    if (!currentHost) { setMode("host-login"); return null; }
    return <HostPortal />;
  }
  if (mode === "user-signup") return <UserSignup />;
  if (mode === "user-login") return <UserLogin />;
  if (mode === "user") {
    if (!currentUser) { setMode("user-login"); return null; }
    return <UserPortal />;
  }

  // global modals: listing viewer and booking modal
  return (
    <div>
      {/* fallback to landing */}
      <Landing />
      {viewListing && <ListingModal listing={viewListing} onClose={()=>setViewListing(null)} />}
      {showBookingModal && bookingTarget && <BookingModal listing={bookingTarget} onClose={() => { setShowBookingModal(false); setBookingTarget(null); }} />}
    </div>
  );
}
