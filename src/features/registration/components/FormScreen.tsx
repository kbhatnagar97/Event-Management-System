import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistrationStore } from '@/stores/registrationStore';
import { useRegistration } from '@/hooks/useRegistration';
import { Button } from '@/shared/Button';
import { Input } from '@/shared/Input';
import { Counter } from '@/shared/Counter';

export function FormScreen() {
  const store = useRegistrationStore();
  const { submit } = useRegistration();
  const navigate = useNavigate();
  const [consent, setConsent] = useState(store.isUpdate);

  const totalAttendees = store.adults + store.kids + store.seniors;

  const canSubmit =
    store.firstName.trim() &&
    store.lastName.trim() &&
    consent &&
    !submit.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    submit.mutate({
      email: store.email,
      firstName: store.firstName,
      lastName: store.lastName,
      adults: store.adults,
      kids: store.kids,
      seniors: store.seniors,
    });
  };

  return (
    <div className="reg-card reg-card--form">
      {/* Brand */}
      <div className="brand brand--sm">
        <img src={`${import.meta.env.BASE_URL}hashedin-logo.svg`} alt="HashedIn by Deloitte" className="brand__logo" />
        <span className="brand__divider" />
        <img src={`${import.meta.env.BASE_URL}hi-engage-logo.svg`} alt="Hi Engage" className="brand__logo brand__logo--hi" />
      </div>

      {/* Header: Back + email chip */}
      <div className="form-header">
        <button className="back-btn" onClick={() => navigate('/registration')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="user-chip">
          <span className="user-chip__avatar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <span>{store.email}</span>
        </div>
      </div>

      {/* Welcome */}
      <div className="welcome">
        <h2>{store.isUpdate ? 'Welcome Back!' : 'Welcome!'}</h2>
        <p>{store.isUpdate ? 'Update your registration details below' : 'Complete your registration in seconds'}</p>
      </div>

      {/* Name fields */}
      <div className="name-row">
        <Input
          label="First Name"
          floating
          id="firstName"
          value={store.firstName}
          onChange={(e) => store.setFirstName(e.target.value)}
        />
        <Input
          label="Last Name"
          floating
          id="lastName"
          value={store.lastName}
          onChange={(e) => store.setLastName(e.target.value)}
        />
      </div>

      {/* Counter section */}
      <div className="counter-section">
        <h3 className="counter-section__title">Family Members Joining You</h3>
        <div className="counter-section__grid">
          <Counter
            label="Adults"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
            value={store.adults}
            onChange={store.setAdults}
            min={0}
            max={5}
          />
          <Counter
            label="Kids"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="4" r="2" />
                <path d="M12 6v6" />
                <path d="M9 18l3-6 3 6" />
              </svg>
            }
            value={store.kids}
            onChange={store.setKids}
            min={0}
            max={5}
          />
          <Counter
            label="Senior Citizens"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                <path d="M16 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M5 17l2-6" />
                <path d="M7 11v6" />
                <path d="M4 21h6" />
              </svg>
            }
            value={store.seniors}
            onChange={store.setSeniors}
            min={0}
            max={5}
          />
        </div>
        <div className="counter-section__total">
          Total attendees: <strong>{totalAttendees}</strong>
        </div>
      </div>

      {/* Consent */}
      <div className="consent">
        <label className="consent__label">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span className="consent__box">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span className="consent__text">
            I agree to the <a href="#" tabIndex={-1}>terms &amp; conditions</a> and confirm all details are accurate.
          </span>
        </label>
      </div>

      {/* Submit */}
      <Button
        variant="primary"
        onClick={handleSubmit}
        loading={submit.isPending}
        disabled={!canSubmit}
        style={{ width: '100%' }}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        }
      >
        {store.isUpdate ? 'Update Registration' : 'Complete Registration'}
      </Button>
    </div>
  );
}
