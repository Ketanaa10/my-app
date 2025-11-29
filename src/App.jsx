import React, { useState, useEffect } from "react";

/* ---------------------- Helpers ---------------------- */
const uid = (p = "") => p + Date.now() + Math.floor(Math.random() * 9999);

const LS = {
  get: (k, f) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? f; }
    catch { return f; }
  },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

/* ---------------------- App ---------------------- */
export default function App() {
  const [mode, setMode] = useState(LS.get("mode", "landing"));

  const [hosts, setHosts] = useState(LS.get("hosts", []));
  const [users, setUsers] = useState(LS.get("users", []));
  const [listings, setListings] = useState(LS.get("listings", []));
  const [bookings, setBookings] = useState(LS.get("bookings", []));

  const [currentHost, setCurrentHost] = useState(LS.get("currentHost", null));
  const [currentUser, setCurrentUser] = useState(LS.get("currentUser", null));

  const [viewListing, setViewListing] = useState(null);
  const [bookingTarget, setBookingTarget] = useState(null);

  /* persist to LS */
  useEffect(() => LS.set("mode", mode), [mode]);
  useEffect(() => LS.set("hosts", hosts), [hosts]);
  useEffect(() => LS.set("users", users), [users]);
  useEffect(() => LS.set("listings", listings), [listings]);
  useEffect(() => LS.set("bookings", bookings), [bookings]);
  useEffect(() => LS.set("currentHost", currentHost), [currentHost]);
  useEffect(() => LS.set("currentUser", currentUser), [currentUser]);

  /* ---------------- HELPERS ---------------- */
  function placeholderImage(title = "stay") {
    return `https://picsum.photos/seed/${encodeURIComponent(title.slice(0, 8))}/800/500`;
  }

  /* ---------------- LANDING ---------------- */
  function Landing() {
    return (
      <div className="landing container">
        <div className="topbar">
          <div className="brand">HomestayConnect</div>
          <div className="row">
            {currentHost && <div className="small">Host: {currentHost.username}</div>}
            {currentUser && <div className="small">User: {currentUser.username}</div>}
          </div>
        </div>

        <h1>Welcome</h1>
        <p className="small">Choose how you want to continue</p>

        <div className="options row mt">
          <div
            className="card"
            style={{ cursor: "pointer", width: 250 }}
            onClick={() => setMode("host-login")}
          >
            <h3>🏡 Host</h3>
            <p className="small">Add and manage homestays</p>
          </div>

          <div
            className="card"
            style={{ cursor: "pointer", width: 250 }}
            onClick={() => setMode("user-login")}
          >
            <h3>✨ User</h3>
            <p className="small">Browse & book stays</p>
          </div>
        </div>

        <h3 className="mt">Featured Listings</h3>
        <div className="grid cols-3">
          {listings.map((l) => (
            <div key={l.id} className="listing-card card" onClick={() => setViewListing(l)}>
              <img
                className="listing-img"
                src={l.images?.[0] || placeholderImage(l.title)}
                alt={l.title}
              />
              <div className="listing-meta">
                <strong>{l.title}</strong>
                <div className="small">{l.city} • ₹{l.price}/night</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------------- SIGNUP / LOGIN ---------------- */
  function Signup({ kind }) {
    const [u, setU] = useState("");
    const [p, setP] = useState("");

    function create() {
      if (!u || !p) return alert("Fill all fields");
      const arr = kind === "Host" ? hosts : users;
      if (arr.find((x) => x.username === u)) return alert("Username taken");

      const obj = { username: u, password: p, id: uid(kind[0] + "-") };

      if (kind === "Host") {
        setHosts([obj, ...hosts]);
        setCurrentHost(obj);
        setMode("host");
      } else {
        setUsers([obj, ...users]);
        setCurrentUser(obj);
        setMode("user");
      }
    }

    return (
      <div className="container">
        <div className="card" style={{ maxWidth: 400, margin: "0 auto" }}>
          <h2>{kind} Sign Up</h2>
          <input className="input" placeholder="Username" value={u} onChange={(e) => setU(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={p} onChange={(e) => setP(e.target.value)} />
          <button className="btn primary" onClick={create}>
            Create {kind}
          </button>
          <button className="btn ghost mt" onClick={() => setMode("landing")}>
            Back
          </button>
        </div>
      </div>
    );
  }

  function Login({ kind }) {
    const [u, setU] = useState("");
    const [p, setP] = useState("");

    function go() {
      const arr = kind === "Host" ? hosts : users;
      const found = arr.find((x) => x.username === u && x.password === p);
      if (!found) return alert("Wrong username or password");

      if (kind === "Host") {
        setCurrentHost(found);
        setMode("host");
      } else {
        setCurrentUser(found);
        setMode("user");
      }
    }

    return (
      <div className="container">
        <div className="card" style={{ maxWidth: 400, margin: "0 auto" }}>
          <h2>{kind} Login</h2>
          <input className="input" placeholder="Username" value={u} onChange={(e) => setU(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={p} onChange={(e) => setP(e.target.value)} />
          <div className="row mt">
            <button className="btn primary" onClick={go}>Login</button>
            <button className="btn ghost" onClick={() => setMode(kind === "Host" ? "host-signup" : "user-signup")}>Create</button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- HOST PAGE ---------------- */
  function HostPage() {
    const [title, setTitle] = useState("");
    const [city, setCity] = useState("");
    const [price, setPrice] = useState("");
    const [desc, setDesc] = useState("");
    const [imgs, setImgs] = useState([]);

    function onFiles(e) {
      const files = Array.from(e.target.files || []);
      Promise.all(
        files.map(
          (f) =>
            new Promise((res) => {
              const r = new FileReader();
              r.onload = () => res(r.result);
              r.readAsDataURL(f);
            })
        )
      ).then((arr) => setImgs((prev) => [...prev, ...arr]));
    }

    function add() {
      if (!title || !city || !price) return alert("Fill details");

      const obj = {
        id: uid("l-"),
        title,
        city,
        price: Number(price),
        description: desc,
        images: imgs,
        hostId: currentHost.id,
      };
      setListings([obj, ...listings]);
      setTitle("");
      setCity("");
      setPrice("");
      setDesc("");
      setImgs([]);
    }

    function remove(id) {
      if (!confirm("Delete listing?")) return;
      setListings(listings.filter((l) => l.id !== id));
    }

    const mine = listings.filter((l) => l.hostId === currentHost.id);

    return (
      <div>
        <div className="topbar container">
          <div className="brand">Host Dashboard</div>
          <div className="row">
            <div className="small">{currentHost.username}</div>
            <button className="btn ghost" onClick={() => { setCurrentHost(null); setMode("landing"); }}>
              Logout
            </button>
          </div>
        </div>

        <div className="container">
          <div className="card">
            <h3>Add Listing</h3>
            <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="input" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <input className="input" placeholder="Price per night" value={price} onChange={(e) => setPrice(e.target.value)} />
            <textarea className="input" rows="3" placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <input type="file" multiple accept="image/*" onChange={onFiles} />

            {imgs.length > 0 && (
              <div className="row mt" style={{ flexWrap: "wrap" }}>
                {imgs.map((s, i) => (
                  <img key={i} src={s} style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8 }} alt="" />
                ))}
              </div>
            )}

            <button className="btn primary mt" onClick={add}>Add</button>
          </div>

          <h3 className="mt">Your Listings</h3>
          <div className="grid cols-3">
            {mine.map((l) => (
              <div key={l.id} className="listing-card card">
                <img className="listing-img" src={l.images?.[0] || placeholderImage(l.title)} alt={l.title} />
                <div className="listing-meta">
                  <strong>{l.title}</strong>
                  <div className="small">{l.city} • ₹{l.price}/night</div>
                  <div className="row mt">
                    <button className="btn ghost" onClick={() => setViewListing(l)}>View</button>
                    <button className="btn danger" onClick={() => remove(l.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- USER PAGE (with search + delete booking) ---------------- */
  function UserPage() {
    const [q, setQ] = useState("");

    function handleBook(l) {
      setBookingTarget(l);
    }

    function deleteBooking(id) {
      if (!confirm("Delete this booking?")) return;
      setBookings((prev) => prev.filter((b) => b.id !== id));
    }

    // filter listings by search query (title or city)
    const filtered = listings.filter((l) => {
      if (!q || q.trim() === "") return true;
      const s = q.trim().toLowerCase();
      return (l.title || "").toLowerCase().includes(s) || (l.city || "").toLowerCase().includes(s);
    });

    return (
      <div>
        <div className="topbar container">
          <div className="brand">User Portal</div>
          <div className="row">
            <div className="small">{currentUser.username}</div>
            <button className="btn ghost" onClick={() => { setCurrentUser(null); setMode("landing"); }}>
              Logout
            </button>
          </div>
        </div>

        <div className="container">
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <input className="input" placeholder="Search by city or title..." value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn ghost" onClick={() => setQ("")}>Clear</button>
          </div>

          <h3>Listings</h3>
          <div className="grid cols-3">
            {filtered.map((l) => (
              <div key={l.id} className="listing-card card">
                <img className="listing-img" src={l.images?.[0] || placeholderImage(l.title)} alt={l.title} />
                <div className="listing-meta">
                  <strong>{l.title}</strong>
                  <div className="small">{l.city} • ₹{l.price}</div>
                  <div className="row mt">
                    <button className="btn ghost" onClick={() => setViewListing(l)}>View</button>
                    <button className="btn primary" onClick={() => handleBook(l)}>Book</button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="card">No results for «{q}»</div>}
          </div>

          <h3 className="mt">Your Bookings</h3>
          <div className="grid cols-2">
            {bookings.filter((b) => b.userId === currentUser.id).length === 0 && <div className="card small">No bookings yet</div>}
            {bookings.filter((b) => b.userId === currentUser.id).map((b) => (
              <div key={b.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{b.listingTitle}</div>
                    <div className="small">{b.guestName} • ID: {b.guestIdNo}</div>
                    <div className="small">{b.start} → {b.end}</div>
                  </div>
                  <div>
                    <button className="btn danger" onClick={() => deleteBooking(b.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- LISTING MODAL ---------------- */
  function ListingModal({ l }) {
    const [idx, setIdx] = useState(0);

    const imgs = l.images?.length ? l.images : [placeholderImage(l.title)];

    return (
      <div className="modal-backdrop" onClick={() => setViewListing(null)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h3>{l.title}</h3>
          <img src={imgs[idx]} style={{ width: "100%", height: 350, objectFit: "cover", borderRadius: 10 }} alt="" />
          <div className="row mt" style={{ overflowX: "auto" }}>
            {imgs.map((s, i) => (
              <img
                key={i}
                src={s}
                style={{
                  width: 80,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 8,
                  cursor: "pointer",
                  outline: i === idx ? "3px solid var(--lavender)" : "none",
                }}
                onClick={() => setIdx(i)}
                alt={`thumb-${i}`}
              />
            ))}
          </div>

          <p className="mt">{l.description}</p>

          <div className="row mt">
            <button className="btn primary" onClick={() => setBookingTarget(l)}>Book</button>
            <button className="btn ghost" onClick={() => setViewListing(null)}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- BOOKING MODAL ---------------- */
  /* ---------------- BOOKING MODAL (with payment) ---------------- */
function BookingModal({ l }) {
  const [guest, setGuest] = useState(currentUser.username || "");
  const [idNum, setIdNum] = useState("");
  const [idImg, setIdImg] = useState(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  // payment
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' | 'upi' | 'cash'
  // card fields
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState(""); // YYYY-MM or MM/YY
  const [cardCvv, setCardCvv] = useState("");
  // upi field
  const [upi, setUpi] = useState("");

  function onIdFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setIdImg(r.result);
    r.readAsDataURL(f);
  }

  function onCardFile(e) {
    // noop placeholder if you later want to allow card image receipts; not used now
  }

  // basic luhn check for card numbers (numbers only)
  function luhnCheck(num) {
    const digits = num.replace(/\D/g, "");
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits.charAt(i), 10);
      if (shouldDouble) {
        d = d * 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  function maskUPI(vpa) {
    // mask middle of vpa like j***@bank or show as entered if short
    if (!vpa || vpa.length < 3) return vpa;
    const parts = vpa.split("@");
    if (parts.length !== 2) return vpa;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) return name + "@" + domain;
    return name[0] + "*".repeat(Math.max(1, name.length - 2)) + name[name.length - 1] + "@" + domain;
  }

  function save() {
    // basic booking validation
    if (!guest.trim() || !idNum.trim()) return alert("Enter full name and ID number");
    if (!idImg) return alert("Please upload an image of your ID proof");
    if (!start || !end || new Date(start) > new Date(end)) return alert("Pick valid start and end dates");

    // payment validation & prepare payment details
    let payment = { method: paymentMethod, details: null };

    if (paymentMethod === "card") {
      const digits = (cardNumber || "").replace(/\s+/g, "");
      if (!cardName.trim()) return alert("Enter name on card");
      if (!/^\d{12,19}$/.test(digits)) return alert("Enter a valid card number (digits only)");
      if (!luhnCheck(digits)) return alert("Card number looks invalid");
      // expiry: try accept MM/YY or YYYY-MM
      if (!cardExpiry.trim()) return alert("Enter card expiry");
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry) && !/^\d{4}-\d{2}$/.test(cardExpiry) && !/^\d{2}-\d{2}$/.test(cardExpiry)) {
        // we won't be strict — just warn if weird
        // continue, but could alert
      }
      // DO NOT STORE CVV — we will not save it
      const last4 = digits.slice(-4);
      payment.details = {
        cardName: cardName.trim(),
        last4,
        expiry: cardExpiry.trim()
      };
    } else if (paymentMethod === "upi") {
      const vpa = upi.trim();
      if (!vpa) return alert("Enter UPI VPA (example: name@bank)");
      if (!/^.+@.+$/.test(vpa)) return alert("UPI VPA looks invalid (must include @)");
      payment.details = { vpa: maskUPI(vpa) }; // store masked VPA for demo
    } else {
      // cash on arrival
      payment.details = null;
    }

    // Create booking object (DO NOT store CVV or full card number)
    const booking = {
      id: uid("b-"),
      userId: currentUser.id,
      listingId: l.id,
      listingTitle: l.title,
      guestName: guest.trim(),
      guestIdNo: idNum.trim(),
      idProofImage: idImg,
      start,
      end,
      payment, // method + safe details
      createdAt: new Date().toISOString()
    };

    // save booking
    setBookings([booking, ...bookings]);
    setBookingTarget(null);
    alert("Booking saved ✅ Payment method: " + payment.method.toUpperCase());
  }

  return (
    <div className="modal-backdrop" onClick={() => setBookingTarget(null)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Book: {l.title}</h3>

        <label className="small">Full Name</label>
        <input className="input" value={guest} onChange={(e) => setGuest(e.target.value)} />

        <label className="small">ID proof number</label>
        <input className="input" value={idNum} onChange={(e) => setIdNum(e.target.value)} />

        <label className="small">Upload ID proof image (photo)</label>
        <input type="file" accept="image/*" onChange={onIdFile} />
        {idImg && <div style={{ marginTop: 8 }}><img src={idImg} alt="id" style={{ width: 160, height: 110, objectFit: "cover", borderRadius: 8 }} /></div>}

        <div className="mt"><strong>Payment</strong></div>

        <div className="row mt">
          <label style={{display:"flex",alignItems:"center",gap:8}}>
            <input type="radio" name="pm" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} /> Card
          </label>
          <label style={{display:"flex",alignItems:"center",gap:8}}>
            <input type="radio" name="pm" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} /> UPI
          </label>
          <label style={{display:"flex",alignItems:"center",gap:8}}>
            <input type="radio" name="pm" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} /> Cash on arrival
          </label>
        </div>

        {paymentMethod === "card" && (
          <div style={{ marginTop: 10 }}>
            <input className="input" placeholder="Name on card" value={cardName} onChange={(e) => setCardName(e.target.value)} />
            <input className="input" placeholder="Card number (digits only or with spaces)" value={cardNumber} onChange={(e) => {
              // auto-space every 4 digits for nicer UX
              const v = e.target.value.replace(/\D/g,'').slice(0,19);
              const spaced = v.replace(/(.{4})/g,'$1 ').trim();
              setCardNumber(spaced);
            }} />
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" placeholder="MM/YY or YYYY-MM" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
              <input className="input" placeholder="CVV (not stored)" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
            </div>
            <div className="small">Note: CVV is not stored. This is demo-only; do not enter real card details for production use.</div>
          </div>
        )}

        {paymentMethod === "upi" && (
          <div style={{ marginTop: 10 }}>
            <input className="input" placeholder="UPI VPA (example: name@bank)" value={upi} onChange={(e) => setUpi(e.target.value)} />
            <div className="small">We'll store a masked version of your VPA for demo purposes.</div>
          </div>
        )}

        <div className="row mt">
          <div style={{ flex: 1 }}>
            <label className="small">Start</label>
            <input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="small">End</label>
            <input className="input" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn primary" onClick={save}>Confirm booking</button>
          <button className="btn ghost" onClick={() => setBookingTarget(null)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}


  /* ---------------- ROUTING ---------------- */
  if (mode === "landing")
    return (
      <>
        <Landing />
        {viewListing && <ListingModal l={viewListing} />}
        {bookingTarget && <BookingModal l={bookingTarget} />}
      </>
    );

  if (mode === "host-signup") return <Signup kind="Host" />;
  if (mode === "host-login") return <Login kind="Host" />;
  if (mode === "user-signup") return <Signup kind="User" />;
  if (mode === "user-login") return <Login kind="User" />;

  if (mode === "host" && currentHost)
    return (
      <>
        <HostPage />
        {viewListing && <ListingModal l={viewListing} />}
      </>
    );

  if (mode === "user" && currentUser)
    return (
      <>
        <UserPage />
        {viewListing && <ListingModal l={viewListing} />}
        {bookingTarget && <BookingModal l={bookingTarget} />}
      </>
    );

  return <div className="container">Invalid mode</div>;
}
