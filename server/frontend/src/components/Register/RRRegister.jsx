import { useState } from 'react';

function RRRegister({ onRegister }) {
  const [form, setForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (onRegister) {
      onRegister(form);
    }
  }

  return (
    <div className="register-panel">
      <h2>Sign-up</h2>
      <form onSubmit={submit}>
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => update('username', e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => update('firstName', e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => update('lastName', e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RRRegister;
