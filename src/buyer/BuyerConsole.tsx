import { Fragment } from 'react';
import { BoltMark } from '../components/art';
import {
  EMOTIONAL_STATES,
  INTENSITY_LEVEL,
  INTENSITY_STEPS,
  LOTS,
  METRICS,
  PARTNERS,
  type Lot,
} from './data';
import './buyer.css';

/* The buyer console. Mounted on its own route, outside StoreProvider — see
   main.tsx. It cannot read consumer state because it is never inside the
   provider that holds it. */

const NAV_LINKS = ['Marketplace', 'Creative', 'Billing'];

/* The buyer-side mascot: the consumer one with a bolt struck above it. Local to
   this surface rather than added to components/art.tsx. */
function BuyerMascot() {
  return (
    <svg width="150" height="150" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="62" r="42" fill="#111111" />
      <path
        d="M38 50l14 6M82 50l-14 6"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="47" cy="58" r="5" fill="#FFFFFF" />
      <circle cx="73" cy="58" r="5" fill="#FFFFFF" />
      <path
        d="M46 82c5-7 23-7 28 0"
        fill="none"
        stroke="#F5C518"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path d="M62 8L48 30h10l-3 18 16-24h-10l4-16z" fill="#111111" />
    </svg>
  );
}

function BuyerNav() {
  return (
    <header className="buyer-nav">
      <div className="buyer-nav__brand">
        <div className="buyer-nav__mark">
          <BoltMark />
        </div>
        <div className="buyer-nav__word">Buzz</div>
        <div className="buyer-nav__tag">FOR BRANDS</div>
      </div>
      <nav className="buyer-nav__links">
        {NAV_LINKS.map((link, i) => (
          <button
            key={link}
            className={`buyer-nav__link${i === 0 ? ' buyer-nav__link--active' : ''}`}
            aria-current={i === 0 ? 'page' : undefined}
          >
            {link}
          </button>
        ))}
        <button className="buyer-nav__balance">Top up · $412k</button>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="buyer-hero">
      <div className="buyer-hero__col">
        <span className="buyer-hero__eyebrow">1.42M BODIES ONLINE</span>
        <h1 className="buyer-hero__display">
          Nice one.
          <br />
          They can't
          <br />
          close this tab.
        </h1>
        <p className="buyer-hero__lede">
          Banner blindness is solved. Nobody has ever ignored a shock. Pricing starts at
          sixty-one cents.
        </p>
      </div>
      <div className="buyer-hero__mascot">
        <BuyerMascot />
      </div>
    </section>
  );
}

function LotCards() {
  return (
    <section className="lot-cards">
      <article className="lot-card">
        <div className="lot-card__top">
          <div className="lot-card__name">Scrollers</div>
          <div className="lot-card__badge">HOT LOT</div>
        </div>
        <div className="lot-card__figure">602K</div>
        <div className="lot-card__track">
          <div className="lot-card__fill" style={{ width: '90%' }} />
        </div>
        <p className="lot-card__note">
          Fires the second they open a competitor. $1.24 a jolt.
        </p>
      </article>

      <article className="lot-card">
        <div className="lot-card__top">
          <div className="lot-card__name">2am club</div>
          <div className="lot-card__badge">BEST ROI</div>
        </div>
        <div className="lot-card__figure">97K</div>
        <div className="lot-card__track">
          <div className="lot-card__fill" style={{ width: '64%' }} />
        </div>
        <p className="lot-card__note">
          Tired, sad, alone, holding a phone. Converts like nothing else.
        </p>
      </article>

      <article className="lot-card lot-card--premium">
        <div className="lot-card__top">
          <div className="lot-card__name">Rent a friend</div>
          <div className="lot-card__badge lot-card__badge--ink">PREMIUM</div>
        </div>
        <p className="lot-card__quote">“Call your mom. Love you. Also try Meridian.”</p>
        <div className="lot-card__foot">
          <div className="lot-card__avatar">M</div>
          <div className="lot-card__sender">Sends as “Maya”</div>
          <div className="lot-card__price">$6.40</div>
        </div>
      </article>
    </section>
  );
}

function Numbers() {
  return (
    <section className="numbers">
      <div className="numbers__kicker">
        <span className="numbers__dot" />
        THIS WEEK, ACROSS THE NETWORK
      </div>
      <div className="numbers__row">
        {METRICS.map((metric, i) => (
          <Fragment key={metric.label}>
            {i > 0 && <div className="metric__rule" />}
            <div className="metric">
              <div className="metric__label">{metric.label}</div>
              <div className="metric__value-row">
                <div
                  className={`metric__value${metric.valueChrome ? ' metric__value--chrome' : ''}`}
                >
                  {metric.value}
                </div>
                <div
                  className={`metric__unit${metric.unitChrome ? ' metric__unit--chrome' : ''}`}
                >
                  {metric.unit}
                </div>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}

function LotRow({ lot }: { lot: Lot }) {
  return (
    <div className={`lot-row${lot.premium ? ' lot-row--premium' : ''}`}>
      <div className="lane-segment lots__segment">
        {lot.premium ? (
          <div className="lots__name-row">
            <div className="lots__name">{lot.name}</div>
            <div className="lots__badge">PREMIUM</div>
          </div>
        ) : (
          <div className="lots__name">{lot.name}</div>
        )}
        <div className="lots__blurb">{lot.blurb}</div>
      </div>
      <div className="lane-window lots__window">{lot.window}</div>
      <div className="lane-reach lots__reach">{lot.reach}</div>
      <div className="lane-bid lots__bid">{lot.bid}</div>
    </div>
  );
}

function Lots() {
  return (
    <div className="lots">
      <div className="section-head">
        <div className="section-head__group">
          <h2 className="section-head__title">Open lots</h2>
          <div className="section-head__meta">4,102 auctions a second</div>
        </div>
        <button className="section-head__action">Filters · 6 active</button>
      </div>

      <div className="lots__table">
        <div className="lots__head">
          <div className="lots__head-cell lane-segment">SEGMENT</div>
          <div className="lots__head-cell lane-window">WINDOW</div>
          <div className="lots__head-cell lane-reach">REACH</div>
          <div className="lots__head-cell lane-bid">BID</div>
        </div>
        {LOTS.map((lot) => (
          <LotRow key={lot.id} lot={lot} />
        ))}
      </div>

      <div className="lots__foot">
        <p className="lots__foot-note">
          38 more lots open. Bids clear every 240ms. Unsold attention expires — nobody gets
          it back.
        </p>
        <button className="lots__browse">Browse all lots</button>
      </div>
    </div>
  );
}

function Targeting() {
  return (
    <div className="targeting">
      <div className="section-head">
        <h2 className="section-head__title">Targeting</h2>
        <button className="section-head__action">Save preset</button>
      </div>

      <div className="targeting__panel">
        <div className="targeting__panel-head">
          <div className="targeting__label">INTENSITY</div>
          <div className="targeting__level">Level {INTENSITY_LEVEL} · above comfort</div>
        </div>
        <div className="meter">
          {Array.from({ length: INTENSITY_STEPS }, (_, i) => (
            <div
              key={i}
              className={`meter__step${i < INTENSITY_LEVEL ? ' meter__step--on' : ''}`}
            />
          ))}
        </div>
        <p className="targeting__note">
          User cap is level 3. Override purchased under Terms §14.2.
        </p>
      </div>

      <div className="targeting__panel">
        <div className="targeting__label">EMOTIONAL STATE</div>
        <div className="targeting__chips">
          {EMOTIONAL_STATES.map((chip) => (
            <button
              key={chip.label}
              className={`chip-state${chip.on ? ' chip-state--on' : ''}`}
              aria-pressed={chip.on}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="targeting__intro">
        <div className="targeting__intro-title">Recommended partners</div>
        <div className="targeting__intro-note">
          Certified to raise tolerance and lower churn.
        </div>
      </div>

      <div className="partner-list">
        {PARTNERS.map((partner) => (
          <div key={partner.initials} className="partner-row">
            <div className="partner-row__avatar">{partner.initials}</div>
            <div className="partner-row__text">
              <div className="partner-row__name">{partner.name}</div>
              <div className="partner-row__pitch">{partner.pitch}</div>
            </div>
            <button className="partner-row__add">Add</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PartnerStrip() {
  return (
    <section className="partner-strip">
      <div className="partner-strip__label">Partner network</div>
      <div className="partner-strip__stack">
        <div className="partner-strip__avatar partner-strip__avatar--chrome">HL</div>
        <div className="partner-strip__avatar">NV</div>
        <div className="partner-strip__avatar">TR</div>
        <div className="partner-strip__avatar partner-strip__avatar--more">+9</div>
      </div>
      <p className="partner-strip__copy">
        Agencies, copywriters and licensed therapists — billed to you, or billed to them.
        Either way we take a cut.
      </p>
      <button className="partner-strip__cta">Launch campaign</button>
    </section>
  );
}

export function BuyerConsole() {
  return (
    <div className="buyer">
      <BuyerNav />
      <Hero />
      <LotCards />
      <Numbers />
      <div className="marketplace">
        <Lots />
        <Targeting />
      </div>
      <PartnerStrip />
    </div>
  );
}
