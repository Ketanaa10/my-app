import React, { useEffect, useState } from "react";
import "./index.css";
const uid = (p = "") => `${p}${Date.now()}${Math.floor(Math.random() * 10000)}`;

const LS = {
  get(k, fallback) {
    try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
  },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  remove(k) { localStorage.removeItem(k); }
};
const DEFAULT_HOSTS = [{ username: "host1", password: "1234", id: uid("h-") }];
const DEFAULT_USERS = [{ username: "user1", password: "1111", id: uid("u-") }];
const DEFAULT_ADMINS = [{ username: "admin", id: uid("a-") }];
const DEFAULT_LISTINGS = [
  {
    id: uid("l-"),
    title: "Cozy Riverside Home",
    city: "Alleppey",
    price: 1800,
    description: "Lovely backwater stay — quiet & cozy.",
    images: [],
    hostId: DEFAULT_HOSTS[0].id,
    createdAt: new Date().toISOString()
  },
  {
    id: uid("l-"),
    title: "Hillside Cottage",
    city: "Ooty",
    price: 2500,
    description: "Green views and calm mornings.",
    images: [],
    hostId: DEFAULT_HOSTS[0].id,
    createdAt: new Date().toISOString()
  }
];
export default function App() {
  // routing mode: landing | host-signup | host-login | host | user-signup | user-login | user | booking-portal | admin
  const [mode, setMode] = useState(LS.get("mode", "landing"));

  // data
  const [hosts, setHosts] = useState(LS.get("hosts", DEFAULT_HOSTS));
  const [users, setUsers] = useState(LS.get("users", DEFAULT_USERS));
  const [admins, setAdmins] = useState(LS.get("admins", DEFAULT_ADMINS));
  const [listings, setListings] = useState(LS.get("listings", DEFAULT_LISTINGS));
  const [bookings, setBookings] = useState(LS.get("bookings", []));
  const [favorites, setFavorites] = useState(LS.get("favorites", {})); // per-user favorites
  const [reviews, setReviews] = useState(LS.get("reviews", {})); // { listingId: [review,...], ... }
  const [currentHost, setCurrentHost] = useState(LS.get("currentHost", null));
  const [currentUser, setCurrentUser] = useState(LS.get("currentUser", null));
  const [viewListing, setViewListing] = useState(null);
  const [bookingTarget, setBookingTarget] = useState(null);
  useEffect(() => LS.set("mode", mode), [mode]);
  useEffect(() => LS.set("hosts", hosts), [hosts]);
  useEffect(() => LS.set("users", users), [users]);
  useEffect(() => LS.set("admins", admins), [admins]);
  useEffect(() => LS.set("listings", listings), [listings]);
  useEffect(() => LS.set("bookings", bookings), [bookings]);
  useEffect(() => LS.set("favorites", favorites), [favorites]);
  useEffect(() => LS.set("reviews", reviews), [reviews]);
  useEffect(() => LS.set("currentHost", currentHost), [currentHost]);
  useEffect(() => LS.set("currentUser", currentUser), [currentUser]);
  function placeholderImage(text = "stay") {
    const seed = encodeURIComponent(text.slice(0, 8));
    return `https://picsum.photos/seed/${seed}/800/500`;
  }

  function todayISO() {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, "0");
    const dd = String(t.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function averageRatingForListing(listingId) {
    const r = reviews[listingId] || [];
    if (r.length === 0) return { avg: 0, count: 0 };
    const sum = r.reduce((s, x) => s + Number(x.rating || 0), 0);
    return { avg: +(sum / r.length).toFixed(2), count: r.length };
  }

  function Stars({ value = 0, size = 14 }) {
    const full = Math.round(value);
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: size, fontWeight: 800, color: 'var(--accent)' }}>
          { '★'.repeat(full) }{ full < 5 ? '☆'.repeat(5 - full) : '' }
        </span>
        {value ? <span className="small" style={{ marginLeft: 6, color: 'var(--muted)' }}>{value}</span> : null}
      </span>
    );
  }
  function Landing() {
    return (
      <div className="container">
        <div className="topbar">
          <div className="brand">HomestayConnect</div>
          <div className="row">
            {currentHost && <div className="small">Host: <strong>{currentHost.username}</strong></div>}
            {currentUser && <div className="small">User: <strong>{currentUser.username}</strong></div>}
          </div>
        </div>

        <h1>Welcome to HomestayConnect</h1>
        <p className="small">Pick Host or User to continue</p>

        <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
          <div className="card" style={{ cursor: "pointer", width: 260 }} onClick={() => setMode("host-login")}>
            <h3>🏡 Host</h3>
            <p className="small">Add & manage listings</p>
          </div>
          <div className="card" style={{ cursor: "pointer", width: 260 }} onClick={() => setMode("user-login")}>
            <h3>✨ User</h3>
            <p className="small">Browse & book homestays</p>
          </div>
          <div className="card" style={{ cursor: "pointer", width: 260 }} onClick={() => setMode("admin")}>
            <h3>🔧 Admin</h3>
            <p className="small">Open admin portal (stats)</p>
          </div>
        </div>

        <h3 className="mt">Featured</h3>
        <div className="grid cols-3">
          {listings.map(l => (
            <div key={l.id} className="listing-card card" onClick={() => setViewListing(l)}>
              <img className="listing-img" src={l.images?.[0] || placeholderImage(l.title)} alt={l.title} />
              <div className="listing-meta">
                <div className="listing-title">{l.title}</div>
                <div className="listing-sub small">{l.city} • ₹{l.price}/night</div>
                <div style={{ marginTop: 8 }}>
                  <Stars value={averageRatingForListing(l.id).avg} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <footer>Made with ❤️ — HomestayConnect demo</footer>
      </div>
    );
  }
  function Signup({ kind }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    function submit() {
      if (!username.trim() || !password.trim()) return alert("Enter username and password");
      if (kind === "Host") {
        if (hosts.find(h => h.username === username.trim())) return alert("Host username taken");
        const h = { username: username.trim(), password: password.trim(), id: uid("h-") };
        setHosts([h, ...hosts]);
        setCurrentHost(h);
        setMode("host");
      } else {
        if (users.find(u => u.username === username.trim())) return alert("User username taken");
        const u = { username: username.trim(), password: password.trim(), id: uid("u-") };
        setUsers([u, ...users]);
        setCurrentUser(u);
        setMode("user");
      }
    }

    return (
      <div className="container">
        <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
          <h2>{kind} Sign Up</h2>
          <input className="input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn primary" onClick={submit}>Create {kind}</button>
            <button className="btn ghost" onClick={() => setMode("landing")}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  function Login({ kind }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    function submit() {
      if (kind === "Host") {
        const found = hosts.find(h => h.username === username && h.password === password);
        if (!found) return alert("Invalid host credentials");
        setCurrentHost(found);
        setMode("host");
      } else {
        const found = users.find(u => u.username === username && u.password === password);
        if (!found) return alert("Invalid user credentials");
        setCurrentUser(found);
        setMode("user");
      }
    }

    return (
      <div className="container">
        <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
          <h2>{kind} Login</h2>
          <input className="input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn primary" onClick={submit}>Sign in</button>
            <button className="btn ghost" onClick={() => setMode(kind === "Host" ? "host-signup" : "user-signup")}>Create account</button>
            <button className="btn ghost" onClick={() => setMode("landing")}>Back</button>
          </div>
        </div>
      </div>
    );
  }
  function AdminPage() {
    return (
      <div>
        <div className="topbar container">
          <div className="brand">Admin Portal</div>
          <div className="row">
            <div className="small">Signed in: <strong>Admin</strong></div>
            <button className="btn ghost" onClick={() => { setMode("landing"); }}>Back</button>
          </div>
        </div>

        <div className="container">
          <div className="card">
            <h3>Website statistics</h3>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="stat">
                <div className="stat-number" style={{ fontSize: 28, fontWeight: 700 }}>{admins.length}</div>
                <div className="small">Admins</div>
              </div>
              <div className="stat">
                <div className="stat-number" style={{ fontSize: 28, fontWeight: 700 }}>{users.length}</div>
                <div className="small">Users</div>
              </div>
              <div className="stat">
                <div className="stat-number" style={{ fontSize: 28, fontWeight: 700 }}>{hosts.length}</div>
                <div className="small">Hosts</div>
              </div>
              <div className="stat">
                <div className="stat-number" style={{ fontSize: 28, fontWeight: 700 }}>{listings.length}</div>
                <div className="small">Listings</div>
              </div>
            </div>
          </div>

          <h3 className="mt">Properties & Ratings</h3>
          <div className="grid cols-3">
            {listings.map(l => {
              const { avg, count } = averageRatingForListing(l.id);
              return (
                <div key={l.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <img src={l.images?.[0] || placeholderImage(l.title)} alt="" style={{ width: 86, height: 64, objectFit: 'cover', borderRadius: 10 }} />
                      <div>
                        <div style={{ fontWeight: 800 }}>{l.title}</div>
                        <div className="small text-muted">{l.city} • ₹{l.price}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                        <Stars value={avg} />
                      </div>
                      <div className="small" style={{ marginTop: 6 }}>{count} review{count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>

                  {(reviews[l.id] || []).length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div className="kicker">Recent reviews</div>
                      <div className="list-rows" style={{ marginTop: 8 }}>
                        {(reviews[l.id] || []).slice().reverse().slice(0, 3).map(r => (
                          <div key={r.id} className="list-row">
                            <div className="meta">
                              <div className="avatar-placeholder">{(r.userName || 'U').slice(0, 1).toUpperCase()}</div>
                              <div>
                                <div style={{ fontWeight: 800 }}>{r.userName}</div>
                                <div className="small text-muted">{new Date(r.createdAt).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div><Stars value={r.rating} /></div>
                              {r.text ? <div className="small" style={{ marginTop: 6, color: 'var(--muted)' }}>{r.text}</div> : <div className="small text-muted">—</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <h3 className="mt">Admins</h3>
          <div className="grid cols-2">
            {admins.map(a => (
              <div key={a.id} className="card">
                <div style={{ fontWeight: 700 }}>{a.username}</div>
                <div className="small">ID: {a.id}</div>
              </div>
            ))}
          </div>

          <h3 className="mt">Users</h3>
          <div className="grid cols-3">
            {users.map(u => (
              <div key={u.id} className="card">
                <div style={{ fontWeight: 700 }}>{u.username}</div>
                <div className="small">ID: {u.id}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  function HostPage() {
    const [title, setTitle] = useState("");
    const [city, setCity] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [imageFiles, setImageFiles] = useState([]);

    function onFiles(e) {
      const files = Array.from(e.target.files || []);
      Promise.all(files.map(f => new Promise((res, reject) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = reject;
        r.readAsDataURL(f);
      }))).then(results => setImageFiles(prev => [...prev, ...results])).catch(() => alert("image read error"));
    }

    function addListing() {
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
      setTitle(""); setCity(""); setPrice(""); setDescription(""); setImageFiles([]);
    }

    function removeListing(id) {
      if (!confirm("Delete listing?")) return;
      setListings(listings.filter(l => l.id !== id));
    }

    const myListings = listings.filter(l => l.hostId === currentHost.id);
    const hostBookings = bookings.filter(b => myListings.some(l => l.id === b.listingId));
    const paymentsReceived = hostBookings.filter(b => b.status === "confirmed" && b.payment);
    const totalReceived = paymentsReceived.reduce((s, b) => s + (Number(b.totalAmount || 0)), 0);

    return (
      <div>
        <div className="topbar container">
          <div className="brand">Host Dashboard</div>
          <div className="row">
            <div className="small">Signed in: <strong>{currentHost.username}</strong></div>
            <button className="btn ghost" onClick={() => { setCurrentHost(null); setMode("landing"); }}>Logout</button>
          </div>
        </div>

        <div className="container">
          <div className="card">
            <h3>Add new listing</h3>
            <input className="input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <input className="input" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
            <input className="input" placeholder="Price per night" value={price} onChange={e => setPrice(e.target.value)} />
            <textarea className="input" placeholder="Short description" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            <input type="file" accept="image/*" multiple onChange={onFiles} />
            {imageFiles.length > 0 && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>{imageFiles.map((s, i) => (<img key={i} src={s} alt="" style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8 }} />))}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button className="btn primary" onClick={addListing}>Add listing</button>
            </div>
          </div>

          <h3 className="mt">Your listings</h3>
          <div className="grid cols-3">
            {myListings.length === 0 && <div className="card small">You have no listings yet.</div>}
            {myListings.map(l => (
              <div key={l.id} className="card listing-card">
                <img className="listing-img" src={l.images?.[0] || placeholderImage(l.title)} alt={l.title} />
                <div className="listing-meta">
                  <div className="listing-title">{l.title}</div>
                  <div className="listing-sub small">{l.city} • ₹{l.price}/night</div>
                  <div style={{ marginTop: 8 }} className="row">
                    <button className="btn ghost" onClick={() => setViewListing(l)}>View</button>
                    <button className="btn danger" onClick={() => removeListing(l.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="mt">Payments received</h3>
          <div className="card">
            <div className="small">Total received: <strong>₹{totalReceived}</strong></div>
          </div>

          <div className="grid cols-2 mt">
            {paymentsReceived.length === 0 && <div className="card small">No payments received yet</div>}
            {paymentsReceived.map(b => (
              <div key={b.id} className="card">
                <div style={{ fontWeight: 700 }}>{b.listingTitle}</div>
                <div className="small">Guest: {b.guestName}</div>
                <div className="small">Dates: {b.start} → {b.end}</div>
                <div className="small">Amount: ₹{b.totalAmount ?? 0}</div>
                <div className="small">Payment: {b.payment?.method ?? "—"}</div>
                {b.payment?.method === "card" && <div className="small">Card: ****{b.payment.details?.last4}</div>}
                {b.payment?.method === "upi" && <div className="small">UPI: {b.payment.details?.vpa}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  function UserPage() {
    const [q, setQ] = useState("");
    const [reviewTarget, setReviewTarget] = useState(null);

    const myFavs = favorites[currentUser?.id] || {};

    const filtered = listings.filter(l => {
      if (!q || !q.trim()) return true;
      const s = q.trim().toLowerCase();
      return (l.title || "").toLowerCase().includes(s) || (l.city || "").toLowerCase().includes(s);
    });

    function toggleFav(listingId) {
      if (!currentUser) return alert("Sign in to save listings");
      setFavorites(prev => {
        const next = { ...(prev || {}) };
        const user = { ...(next[currentUser.id] || {}) };
        if (user[listingId]) {
          delete user[listingId];
        } else {
          user[listingId] = true;
        }
        next[currentUser.id] = user;
        return next;
      });
    }

    const savedCount = Object.keys(myFavs || {}).length;

    return (
      <div>
        <div className="topbar container">
          <div className="brand">User Portal</div>
          <div className="row">
            <div className="small">Signed in: <strong>{currentUser.username}</strong></div>
            <div className="small">Saved: <strong>{savedCount}</strong></div>
            <button className="btn ghost" onClick={() => { setCurrentUser(null); setMode("landing"); }}>Logout</button>
            <button className="btn ghost" onClick={() => setMode("booking-portal")}>My Bookings</button>
          </div>
        </div>

        <div className="container">
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <input className="input" placeholder="Search by city or title..." value={q} onChange={e => setQ(e.target.value)} />
            <button className="btn ghost" onClick={() => setQ("")}>Clear</button>
            <button className="btn secondary" onClick={() => {
              if (Object.keys(myFavs || {}).length === 0) return alert("No saved listings");
              setQ("__saved__");
            }}>Show saved</button>
          </div>

          <h3>Listings</h3>
          <div className="grid cols-3">
            {filtered
              .filter(l => {
                if (q === "__saved__") return !!myFavs[l.id];
                return true;
              })
              .map(l => {
                const saved = !!myFavs[l.id];
                const { avg, count } = averageRatingForListing(l.id);
                return (
                  <div key={l.id} className="card listing-card">
                    <div style={{ position: 'relative' }}>
                      <img className="listing-img" src={l.images?.[0] || placeholderImage(l.title)} alt={l.title} />
                      <div className="ribbon">{l.city}</div>
                      <div style={{ position: 'absolute', left: 12, bottom: 12 }}>
                        <button
                          className="favorite-btn"
                          onClick={() => toggleFav(l.id)}
                          aria-pressed={saved}
                          title={saved ? "Remove from saved" : "Save listing"}
                        >
                          <span className="heart-ico" style={{ opacity: saved ? 1 : 0.8, transform: saved ? 'scale(1.06)' : 'scale(1)' }} />
                          {saved ? "Saved" : "Save"}
                        </button>
                      </div>
                    </div>

                    <div className="listing-meta">
                      <div className="listing-title">{l.title}</div>
                      <div className="listing-sub small">₹{l.price} • <span className="text-muted">{l.city}</span></div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                        <Stars value={avg} />
                        <div className="small">{count > 0 ? `(${count} review${count !== 1 ? 's' : ''})` : "No reviews yet"}</div>
                      </div>

                      <div className="listing-cta">
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn ghost" onClick={() => setViewListing(l)}>View</button>
                          <button className="btn primary" onClick={() => setBookingTarget(l)}>Book</button>
                          <button className="btn secondary" onClick={() => setReviewTarget(l)}>Review</button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="pill">{l.city}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            }
            {filtered.length === 0 && <div className="card">No results for «{q}»</div>}
          </div>
        </div>

        {reviewTarget && <ReviewModal listing={reviewTarget} onClose={() => setReviewTarget(null)} />}
      </div>
    );
  }
  function BookingPortal() {
    const today = todayISO();
    const mine = bookings.filter(b => b.userId === currentUser.id);

    const currentBookings = mine.filter(b => !b.end || b.end >= today).sort((a, b) => (a.start < b.start ? 1 : -1));
    const pastBookings = mine.filter(b => b.end && b.end < today).sort((a, b) => (a.end < b.end ? 1 : -1));

    function deleteBooking(id) {
      if (!confirm("Delete this booking?")) return;
      setBookings(prev => prev.filter(x => x.id !== id));
    }

    function paymentLabel(b) {
      const p = b.payment;
      if (!p) return "—";
      if (p.method === "card") return `Card ****${p.details?.last4}`;
      if (p.method === "upi") return `UPI ${p.details?.vpa}`;
      return "Cash on arrival";
    }

    return (
      <div>
        <div className="topbar container">
          <div className="brand">My Bookings</div>
          <div className="row">
            <div className="small">{currentUser.username}</div>
            <button className="btn ghost" onClick={() => setMode("user")}>Back to portal</button>
            <button className="btn ghost" onClick={() => { setCurrentUser(null); setMode("landing"); }}>Logout</button>
          </div>
        </div>

        <div className="container">
          <h3>Current / Upcoming</h3>
          <div className="grid cols-2">
            {currentBookings.length === 0 && <div className="card small">No upcoming bookings</div>}
            {currentBookings.map(b => (
              <div key={b.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{b.listingTitle}</div>
                    <div className="small">{b.guestName} • ID: {b.guestIdNo}</div>
                    <div className="small">{b.start} → {b.end}</div>
                    <div className="small">Paid: ₹{b.totalAmount ?? 0} • {paymentLabel(b)}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button className="btn danger" onClick={() => deleteBooking(b.id)}>Delete</button>
                    <button className="btn ghost" onClick={() => {
                      const w = window.open();
                      w.document.title = "ID proof";
                      w.document.body.style.margin = "0";
                      const img = w.document.createElement("img");
                      img.src = b.idProofImage;
                      img.style.maxWidth = "100%";
                      w.document.body.appendChild(img);
                    }}>View ID</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="mt">Past Bookings</h3>
          <div className="grid cols-2">
            {pastBookings.length === 0 && <div className="card small">No past bookings</div>}
            {pastBookings.map(b => (
              <div key={b.id} className="card">
                <div style={{ fontWeight: 700 }}>{b.listingTitle}</div>
                <div className="small">{b.guestName} • ID: {b.guestIdNo}</div>
                <div className="small">{b.start} → {b.end}</div>
                <div className="small">Paid: ₹{b.totalAmount ?? 0} • {paymentLabel(b)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  function ListingModal({ listing }) {
    const [idx, setIdx] = useState(0);
    if (!listing) return null;
    const imgs = listing.images && listing.images.length ? listing.images : [placeholderImage(listing.title)];
    const { avg, count } = averageRatingForListing(listing.id);
    return (
      <div className="modal-backdrop" onClick={() => setViewListing(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <img src={imgs[idx]} alt="" style={{ width: "100%", height: 360, objectFit: "cover", borderRadius: 10 }} />
              <div style={{ display: "flex", gap: 8, marginTop: 8, overflowX: "auto" }}>
                {imgs.map((s, i) => (
                  <img key={i} src={s} onClick={() => setIdx(i)} alt="" style={{ width: 80, height: 56, objectFit: "cover", borderRadius: 8, cursor: "pointer", outline: i === idx ? "3px solid var(--accent)" : "none" }} />
                ))}
              </div>
            </div>
            <div style={{ width: 320 }}>
              <h3>{listing.title}</h3>
              <div className="small">{listing.city} • ₹{listing.price}/night</div>
              <div style={{ marginTop: 8 }}><Stars value={avg} /> <span className="small">({count})</span></div>
              <p style={{ marginTop: 12 }}>{listing.description}</p>
              <div style={{ marginTop: 18 }} className="row">
                <button className="btn primary" onClick={() => { setBookingTarget(listing); setViewListing(null); }}>Book</button>
                <button className="btn ghost" onClick={() => setViewListing(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  function BookingModal({ listing }) {
    const [step, setStep] = useState(1);
    const [guestName, setGuestName] = useState(currentUser?.username || "");
    const [guestIdNo, setGuestIdNo] = useState("");
    const [idProofImage, setIdProofImage] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [paymentMethod, setPaymentMethod] = useState("card");
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [upi, setUpi] = useState("");

    const [processing, setProcessing] = useState(false);
    const [recentBooking, setRecentBooking] = useState(null);

    function onIdFile(e) {
      const f = e.target.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => setIdProofImage(r.result);
      r.readAsDataURL(f);
    }

    function nightsCount(s, e) {
      if (!s || !e) return 0;
      const sd = new Date(s);
      const ed = new Date(e);
      const diff = (ed - sd) / (1000 * 60 * 60 * 24);
      return Math.max(0, Math.floor(diff));
    }

    function luhnCheck(num) {
      const digits = num.replace(/\D/g, "");
      let sum = 0, dbl = false;
      for (let i = digits.length - 1; i >= 0; i--) {
        let d = parseInt(digits[i], 10);
        if (dbl) { d = d * 2; if (d > 9) d -= 9; }
        sum += d; dbl = !dbl;
      }
      return sum % 10 === 0;
    }

    function maskUPI(vpa) {
      if (!vpa || vpa.length < 3) return vpa;
      const parts = vpa.split("@"); if (parts.length !== 2) return vpa;
      const name = parts[0]; const domain = parts[1];
      if (name.length <= 2) return name + "@" + domain;
      return name[0] + "*".repeat(Math.max(1, name.length - 2)) + name[name.length - 1] + "@" + domain;
    }

    function goToPayment() {
      if (!guestName.trim()) return alert("Enter full name");
      if (!guestIdNo.trim()) return alert("Enter ID number");
      if (!idProofImage) return alert("Upload ID proof image");
      if (!startDate || !endDate) return alert("Select start and end dates");
      const nights = nightsCount(startDate, endDate);
      if (nights <= 0) return alert("End date must be after start date (nights > 0)");
      if (currentUser && guestName !== currentUser.username) return alert("Name must match signed-in user");
      setStep(2);
    }

    function payAndBook() {
      const nights = nightsCount(startDate, endDate);
      if (nights <= 0) return alert("Invalid dates");
      const amountPerNight = Number(listing.price) || 0;
      const totalAmount = amountPerNight * nights;

      let payment = { method: paymentMethod, details: null };

      if (paymentMethod === "card") {
        const digits = (cardNumber || "").replace(/\s+/g, "");
        if (!cardName.trim()) return alert("Enter name on card");
        if (!/^\d{12,19}$/.test(digits)) return alert("Enter a valid card number (12-19 digits)");
        if (!luhnCheck(digits)) return alert("Card number looks invalid");
        payment.details = { last4: digits.slice(-4), expiry: cardExpiry.trim(), cardName: cardName.trim() };
      } else if (paymentMethod === "upi") {
        if (!upi.trim() || !/^.+@.+$/.test(upi.trim())) return alert("Enter a valid UPI VPA (example: name@bank)");
        payment.details = { vpa: maskUPI(upi.trim()) };
      } else {
        payment.details = null;
      }

      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);

        const booking = {
          id: uid("b-"),
          userId: currentUser?.id ?? null,
          listingId: listing.id,
          listingTitle: listing.title,
          guestName: guestName.trim(),
          guestIdNo: guestIdNo.trim(),
          idProofImage,
          start: startDate,
          end: endDate,
          nights,
          amountPerNight,
          totalAmount,
          payment,
          status: "confirmed",
          createdAt: new Date().toISOString()
        };

        setBookings(prev => [booking, ...prev]);
        setRecentBooking(booking);
        setStep(3);
      }, 900);
    }

    function closeModal() {
      setBookingTarget(null);
      setStep(1);
      setGuestIdNo("");
      setIdProofImage(null);
      setStartDate("");
      setEndDate("");
      setPaymentMethod("card");
      setCardName(""); setCardNumber(""); setCardExpiry(""); setCardCvv(""); setUpi("");
      setRecentBooking(null);
    }

    const nights = nightsCount(startDate, endDate);
    const total = nights * (Number(listing.price) || 0);

    const shownBooking = recentBooking || bookings.find(b => b.listingId === listing.id && b.userId === currentUser?.id) || null;
    const today = todayISO();

    return (
      <div className="modal-backdrop" onClick={() => { if (!processing) setBookingTarget(null); }}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          {step === 1 && (
            <>
              <h3>Step 1 — Guest details</h3>
              <label className="small">Full name</label>
              <input className="input" value={guestName} onChange={e => setGuestName(e.target.value)} />

              <label className="small">ID proof number</label>
              <input className="input" value={guestIdNo} onChange={e => setGuestIdNo(e.target.value)} />

              <label className="small">Upload ID proof image (photo)</label>
              <input type="file" accept="image/*" onChange={onIdFile} />
              {idProofImage && <div style={{ marginTop: 8 }}><img src={idProofImage} alt="id" style={{ width: 160, height: 110, objectFit: "cover", borderRadius: 8 }} /></div>}

              <div className="row mt">
                <div style={{ flex: 1 }}>
                  <label className="small">Start</label>
                  <input className="input" type="date" min={today} value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="small">End</label>
                  <input className="input" type="date" min={startDate || today} value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>

              <div style={{ marginTop: 10 }} className="small">Note: nights calculated as end - start</div>

              <div className="row mt">
                <button className="btn ghost" onClick={() => setBookingTarget(null)}>Cancel</button>
                <button className="btn primary" onClick={goToPayment}>Next — Payment</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3>Step 2 — Payment</h3>
              <div style={{ marginBottom: 12 }}>
                <div className="small">Listing: <strong>{listing.title}</strong></div>
                <div className="small">Price per night: ₹{listing.price}</div>
                <div className="small">Nights: {nights}</div>
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700 }}>Total payable: ₹{total}</div>
              </div>

              <div className="row" style={{ gap: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="radio" name="pm" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} /> Card</label>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="radio" name="pm" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} /> UPI</label>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="radio" name="pm" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} /> Cash on arrival</label>
              </div>

              {paymentMethod === "card" && (
                <div style={{ marginTop: 10 }}>
                  <input className="input" placeholder="Name on card" value={cardName} onChange={e => setCardName(e.target.value)} />
                  <input className="input" placeholder="Card number" value={cardNumber} onChange={e => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 19);
                    const spaced = v.replace(/(.{4})/g, '$1 ').trim();
                    setCardNumber(spaced);
                  }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="input" placeholder="MM/YY or YYYY-MM" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} />
                    <input className="input" placeholder="CVV (not stored)" value={cardCvv} onChange={e => setCardCvv(e.target.value)} />
                  </div>
                  <div className="small">Note: CVV will not be stored. Demo only.</div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div style={{ marginTop: 10 }}>
                  <input className="input" placeholder="UPI VPA (example: name@bank)" value={upi} onChange={e => setUpi(e.target.value)} />
                  <div className="small">We'll store a masked version of your VPA for demo purposes.</div>
                </div>
              )}

              <div className="row mt">
                <button className="btn ghost" onClick={() => setStep(1)} disabled={processing}>Back</button>
                <button className="btn primary" onClick={payAndBook} disabled={processing}>{processing ? "Processing..." : `Pay ₹${total} & Book`}</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3>✅ Booking completely successful</h3>

              <div className="card mt">
                <div style={{ fontWeight: 700 }}>{listing.title}</div>
                <div className="small">Guest: {guestName}</div>
                <div className="small">ID: {guestIdNo}</div>
                <div className="small">Dates: {startDate} → {endDate} ({nights} nights)</div>
                <div className="small">Amount paid: ₹{total}</div>
                <div className="small">Payment method: {shownBooking?.payment?.method ?? "—"}</div>
                {shownBooking?.payment?.method === "card" && <div className="small">Card: ****{shownBooking.payment.details?.last4}</div>}
                {shownBooking?.payment?.method === "upi" && <div className="small">UPI: {shownBooking.payment.details?.vpa}</div>}
                {shownBooking?.payment?.method === "cash" && <div className="small">Cash on arrival</div>}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn ghost" onClick={closeModal}>Close</button>
                <button className="btn primary" onClick={() => { setBookingTarget(null); setMode("booking-portal"); }}>Go to My Bookings</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  function ReviewModal({ listing, onClose }) {
    const [rating, setRating] = useState(5);
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!listing) return null;

    function submitReview() {
      if (!currentUser) return alert("Sign in to submit a review");
      if (rating < 1 || rating > 5) return alert("Please provide a rating 1–5");
      setSubmitting(true);
      const review = {
        id: uid("rv-"),
        listingId: listing.id,
        userId: currentUser.id,
        userName: currentUser.username,
        rating,
        text: text.trim(),
        createdAt: new Date().toISOString()
      };
      setTimeout(() => {
        setReviews(prev => {
          const next = { ...(prev || {}) };
          next[listing.id] = [...(next[listing.id] || []), review];
          return next;
        });
        setSubmitting(false);
        onClose && onClose();
        alert("Thanks for your review 💖");
      }, 500);
    }

    return (
      <div className="modal-backdrop" onClick={() => { if (!submitting) onClose && onClose(); }}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <h3>Review — {listing.title}</h3>
          <div className="small">Leave a rating (1-5) and an optional text review.</div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setRating(n)} className="btn ghost" style={{ padding: 8, borderRadius: 8, background: n <= rating ? 'linear-gradient(90deg,var(--accent),var(--accent-2))' : 'transparent', color: n <= rating ? 'white' : 'var(--muted)' }}>
                {n} ★
              </button>
            ))}
          </div>

          <textarea className="input" placeholder="Write a short review (optional)" rows={4} value={text} onChange={e => setText(e.target.value)} style={{ marginTop: 12 }} />

          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button className="btn ghost" onClick={() => onClose && onClose()} disabled={submitting}>Cancel</button>
            <button className="btn primary" onClick={submitReview} disabled={submitting}>{submitting ? "Saving..." : "Submit Review"}</button>
          </div>
        </div>
      </div>
    );
  }
  if (mode === "landing") return (
    <>
      <Landing />
      {viewListing && <ListingModal listing={viewListing} />}
      {bookingTarget && <BookingModal listing={bookingTarget} />}
    </>
  );

  if (mode === "host-signup") return <Signup kind="Host" />;
  if (mode === "host-login") return <Login kind="Host" />;
  if (mode === "host") {
    if (!currentHost) { setMode("host-login"); return null; }
    return <HostPage />;
  }

  if (mode === "user-signup") return <Signup kind="User" />;
  if (mode === "user-login") return <Login kind="User" />;
  if (mode === "user") {
    if (!currentUser) { setMode("user-login"); return null; }
    return (
      <>
        <UserPage />
        {viewListing && <ListingModal listing={viewListing} />}
        {bookingTarget && <BookingModal listing={bookingTarget} />}
      </>
    );
  }

  if (mode === "booking-portal") {
    if (!currentUser) { setMode("user-login"); return null; }
    return <BookingPortal />;
  }

  if (mode === "admin") {
    return <AdminPage />;
  }

  return <div className="container">Invalid mode</div>;
}
