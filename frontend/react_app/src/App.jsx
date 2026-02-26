import { useEffect, useMemo, useState } from 'react';

import { api } from './api';

const EMPTY_REVIEW = {
  review: '',
  purchase_date: '',
  car_make: '',
  car_model: '',
  car_year: '',
};

const EMPTY_CONTACT = {
  name: '',
  email: '',
  message: '',
};

function AuthCard({ mode, form, onModeChange, onChange, onSubmit, onLogout, user, busy }) {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <h5 className="card-title mb-3">Account</h5>

        {user ? (
          <>
            <p className="mb-3">
              Signed in as <strong>{user.username}</strong>
            </p>
            <button className="btn btn-outline-danger w-100" onClick={onLogout} disabled={busy}>
              Logout
            </button>
          </>
        ) : (
          <>
            <div className="btn-group w-100 mb-3" role="group">
              <button
                className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => onModeChange('login')}
              >
                Login
              </button>
              <button
                className={`btn btn-sm ${mode === 'register' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => onModeChange('register')}
              >
                Register
              </button>
            </div>

            <form onSubmit={onSubmit}>
              <input
                className="form-control form-control-sm mb-2"
                placeholder="Username"
                value={form.username}
                onChange={(e) => onChange('username', e.target.value)}
                required
              />
              <input
                type="password"
                className="form-control form-control-sm mb-2"
                placeholder="Password"
                value={form.password}
                onChange={(e) => onChange('password', e.target.value)}
                required
              />
              {mode === 'register' ? (
                <input
                  type="email"
                  className="form-control form-control-sm mb-3"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => onChange('email', e.target.value)}
                />
              ) : null}
              <button className="btn btn-primary w-100" type="submit" disabled={busy}>
                {mode === 'login' ? 'Login' : 'Create account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function DealersSection({
  busy,
  user,
  authMode,
  authForm,
  onModeChange,
  onAuthChange,
  onAuthSubmit,
  onLogout,
  selectedState,
  states,
  onStateChange,
  dealers,
  selectedDealer,
  openDealer,
  reviews,
  reviewForm,
  onReviewChange,
  onReviewSubmit,
}) {
  return (
    <div className="row g-4">
      <div className="col-lg-3">
        <AuthCard
          mode={authMode}
          form={authForm}
          busy={busy}
          user={user}
          onModeChange={onModeChange}
          onSubmit={onAuthSubmit}
          onLogout={onLogout}
          onChange={onAuthChange}
        />
      </div>

      <div className="col-lg-4">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Dealers</h5>
              <select
                className="form-select form-select-sm w-auto"
                value={selectedState}
                onChange={(e) => onStateChange(e.target.value)}
              >
                <option value="">All states</option>
                {states.map((state) => (
                  <option value={state} key={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="dealer-list">
              {dealers.map((dealer) => (
                <button
                  className={`dealer-card ${selectedDealer?.dealer_id === dealer.dealer_id ? 'active' : ''}`}
                  key={dealer.dealer_id}
                  onClick={() => openDealer(dealer.dealer_id)}
                >
                  <span className="fw-semibold">{dealer.name}</span>
                  <span className="small text-secondary">
                    {dealer.city}, {dealer.state}
                  </span>
                </button>
              ))}
              {dealers.length === 0 ? <p className="text-secondary mb-0">No dealers found.</p> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-5">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body">
            <h5 className="card-title mb-3">Dealer Details and Reviews</h5>

            {selectedDealer ? (
              <>
                <div className="dealer-meta mb-3">
                  <p className="mb-1">
                    <strong>{selectedDealer.name}</strong>
                  </p>
                  <p className="mb-1">{selectedDealer.address}</p>
                  <p className="mb-0">
                    {selectedDealer.city}, {selectedDealer.state} | {selectedDealer.phone}
                  </p>
                </div>

                <div className="review-list mb-3">
                  {reviews.map((item, index) => (
                    <div className="review-card" key={item._id || `${item.name}-${index}`}>
                      <div className="d-flex justify-content-between">
                        <strong>{item.name}</strong>
                        <span
                          className={`badge text-bg-${
                            item.sentiment === 'positive'
                              ? 'success'
                              : item.sentiment === 'negative'
                                ? 'danger'
                                : 'secondary'
                          }`}
                        >
                          {item.sentiment}
                        </span>
                      </div>
                      <p className="mb-1 mt-2">{item.review}</p>
                      <p className="small text-secondary mb-0">
                        {item.purchase_date ? `Purchase: ${item.purchase_date}` : 'No purchase date'}
                        {item.car_make || item.car_model || item.car_year
                          ? ` | ${item.car_year || ''} ${item.car_make || ''} ${item.car_model || ''}`
                          : ''}
                      </p>
                    </div>
                  ))}
                  {reviews.length === 0 ? <p className="text-secondary mb-0">No reviews yet.</p> : null}
                </div>

                {user ? (
                  <form onSubmit={onReviewSubmit}>
                    <textarea
                      className="form-control mb-2"
                      rows="3"
                      placeholder="Write your review"
                      value={reviewForm.review}
                      onChange={(e) => onReviewChange('review', e.target.value)}
                      required
                    />
                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <input
                          type="date"
                          className="form-control"
                          value={reviewForm.purchase_date}
                          onChange={(e) => onReviewChange('purchase_date', e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <input
                          className="form-control"
                          placeholder="Car year"
                          value={reviewForm.car_year}
                          onChange={(e) => onReviewChange('car_year', e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <input
                          className="form-control"
                          placeholder="Car make"
                          value={reviewForm.car_make}
                          onChange={(e) => onReviewChange('car_make', e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <input
                          className="form-control"
                          placeholder="Car model"
                          value={reviewForm.car_model}
                          onChange={(e) => onReviewChange('car_model', e.target.value)}
                        />
                      </div>
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={busy}>
                      Post Review
                    </button>
                  </form>
                ) : (
                  <p className="mb-0 text-secondary">Log in to submit a review.</p>
                )}
              </>
            ) : (
              <p className="text-secondary mb-0">Select a dealer to view details and reviews.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CarsSection({ selectedMake, makes, onMakeChange, cars }) {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 className="card-title mb-0">Cars Inventory</h5>
          <select
            className="form-select form-select-sm w-auto"
            value={selectedMake}
            onChange={(e) => onMakeChange(e.target.value)}
          >
            <option value="">All makes</option>
            {makes.map((make) => (
              <option value={make} key={make}>
                {make}
              </option>
            ))}
          </select>
        </div>

        <div className="row g-3">
          {cars.map((car) => (
            <div className="col-md-6 col-xl-4" key={car.car_id}>
              <div className="car-card h-100">
                <p className="car-title mb-1">
                  {car.year} {car.make} {car.model}
                </p>
                <p className="car-price mb-2">{formatPrice(car.price_usd)}</p>
                <p className="small mb-1 text-secondary">Type: {car.body_type}</p>
                <p className="small mb-1 text-secondary">Mileage: {car.mileage.toLocaleString()} mi</p>
                <p className="small mb-1 text-secondary">Color: {car.color}</p>
                <p className="small mb-1 text-secondary">Fuel: {car.fuel_type}</p>
                <p className="small mb-0 text-secondary">Dealer ID: {car.dealer_id}</p>
              </div>
            </div>
          ))}
          {cars.length === 0 ? <p className="text-secondary mb-0">No cars found.</p> : null}
        </div>
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h5 className="card-title mb-3">About Us</h5>
        <p>
          Cars Dealership is a national U.S. automotive retailer focused on trustworthy pricing,
          transparent customer reviews, and a modern digital buying experience.
        </p>
        <p>
          Our platform helps customers discover dealers by state, compare inventory, and share
          purchase experiences that help future buyers make confident decisions.
        </p>
        <p className="mb-0">
          We combine full-stack cloud architecture with sentiment analysis to surface meaningful
          feedback and continuously improve service quality.
        </p>
      </div>
    </div>
  );
}

function ContactSection({ form, onChange, onSubmit }) {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h5 className="card-title mb-3">Contact Us</h5>
        <p className="text-secondary">
          Need help with a dealership visit, review moderation, or platform support? Reach us below.
        </p>

        <div className="mb-3">
          <p className="mb-1">
            <strong>Email:</strong> support@carsdealership.com
          </p>
          <p className="mb-1">
            <strong>Phone:</strong> +1 (800) 555-0199
          </p>
          <p className="mb-0">
            <strong>Address:</strong> 1200 Market Street, Chicago, IL 60601
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <input
            className="form-control mb-2"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            required
          />
          <input
            type="email"
            className="form-control mb-2"
            placeholder="Your email"
            value={form.email}
            onChange={(e) => onChange('email', e.target.value)}
            required
          />
          <textarea
            className="form-control mb-3"
            rows="4"
            placeholder="How can we help?"
            value={form.message}
            onChange={(e) => onChange('message', e.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit">
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [activeSection, setActiveSection] = useState('dealers');

  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' });

  const [dealers, setDealers] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState(EMPTY_REVIEW);

  const [cars, setCars] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');

  const [contactForm, setContactForm] = useState(EMPTY_CONTACT);

  const states = useMemo(() => {
    const unique = new Set(dealers.map((dealer) => dealer.state));
    return Array.from(unique).sort();
  }, [dealers]);

  const makes = useMemo(() => {
    const unique = new Set(cars.map((car) => car.make));
    return Array.from(unique).sort();
  }, [cars]);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    setBusy(true);
    try {
      await Promise.all([refreshUser(), refreshDealers(''), refreshCars('')]);
      setNotice('');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function refreshUser() {
    const payload = await api.me();
    setUser(payload.authenticated ? payload : null);
  }

  async function refreshDealers(state) {
    const payload = await api.dealers(state);
    setDealers(payload.dealers || []);
  }

  async function refreshCars(make) {
    const payload = await api.cars({ make: make || undefined });
    setCars(payload.cars || []);
  }

  async function openDealer(dealerId) {
    setBusy(true);
    try {
      const [dealerResponse, reviewResponse] = await Promise.all([
        api.dealer(dealerId),
        api.reviewsByDealer(dealerId),
      ]);
      setSelectedDealer(dealerResponse.dealer || null);
      setReviews(reviewResponse.reviews || []);
      setNotice('');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleStateChange(value) {
    setSelectedState(value);
    setSelectedDealer(null);
    setReviews([]);
    setBusy(true);
    try {
      await refreshDealers(value);
      setNotice('');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleMakeChange(value) {
    setSelectedMake(value);
    setBusy(true);
    try {
      await refreshCars(value);
      setNotice('');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setBusy(true);

    try {
      if (authMode === 'login') {
        await api.login({ username: authForm.username, password: authForm.password });
      } else {
        await api.register({
          username: authForm.username,
          password: authForm.password,
          email: authForm.email,
        });
      }
      await refreshUser();
      setNotice('Authenticated successfully.');
      setAuthForm({ username: '', password: '', email: '' });
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    try {
      await api.logout();
      setUser(null);
      setNotice('Logged out.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();
    if (!selectedDealer) {
      setNotice('Select a dealer before submitting a review.');
      return;
    }

    setBusy(true);
    try {
      await api.createReview({
        dealer_id: selectedDealer.dealer_id,
        review: reviewForm.review,
        purchase_date: reviewForm.purchase_date,
        car_make: reviewForm.car_make,
        car_model: reviewForm.car_model,
        car_year: reviewForm.car_year,
      });

      setReviewForm(EMPTY_REVIEW);
      await openDealer(selectedDealer.dealer_id);
      setNotice('Review submitted.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  function handleContactSubmit(event) {
    event.preventDefault();
    setContactForm(EMPTY_CONTACT);
    setNotice('Thanks for contacting us. Our team will respond shortly.');
  }

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg shadow-sm">
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 h1">Cars Dealership</span>
          <span className="small text-white-50">National Retailer Portal</span>
        </div>
      </nav>

      <main className="container-fluid px-4 py-4">
        {notice ? <div className="alert alert-info py-2">{notice}</div> : null}

        <div className="section-nav mb-4">
          {[
            { id: 'dealers', label: 'Dealers' },
            { id: 'cars', label: 'Cars' },
            { id: 'about', label: 'About Us' },
            { id: 'contact', label: 'Contact Us' },
          ].map((section) => (
            <button
              key={section.id}
              className={`btn btn-sm ${activeSection === section.id ? 'btn-light' : 'btn-outline-light'}`}
              onClick={() => setActiveSection(section.id)}
              disabled={busy}
            >
              {section.label}
            </button>
          ))}
        </div>

        {activeSection === 'dealers' ? (
          <DealersSection
            busy={busy}
            user={user}
            authMode={authMode}
            authForm={authForm}
            onModeChange={setAuthMode}
            onAuthChange={(field, value) => setAuthForm((prev) => ({ ...prev, [field]: value }))}
            onAuthSubmit={handleAuthSubmit}
            onLogout={handleLogout}
            selectedState={selectedState}
            states={states}
            onStateChange={handleStateChange}
            dealers={dealers}
            selectedDealer={selectedDealer}
            openDealer={openDealer}
            reviews={reviews}
            reviewForm={reviewForm}
            onReviewChange={(field, value) => setReviewForm((prev) => ({ ...prev, [field]: value }))}
            onReviewSubmit={handleReviewSubmit}
          />
        ) : null}

        {activeSection === 'cars' ? (
          <CarsSection
            selectedMake={selectedMake}
            makes={makes}
            onMakeChange={handleMakeChange}
            cars={cars}
          />
        ) : null}

        {activeSection === 'about' ? <AboutSection /> : null}

        {activeSection === 'contact' ? (
          <ContactSection
            form={contactForm}
            onChange={(field, value) => setContactForm((prev) => ({ ...prev, [field]: value }))}
            onSubmit={handleContactSubmit}
          />
        ) : null}
      </main>
    </div>
  );
}

export default App;
