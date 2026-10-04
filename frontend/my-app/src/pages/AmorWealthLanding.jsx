import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../amorwealth.css';

export default function AmorWealthLanding() {
  const navigate = useNavigate();

  // Mobile menu state
  const [isNavActive, setIsNavActive] = useState(false);
  
  // Login dropdown state
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // SIP Calculator State
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [investmentPeriod, setInvestmentPeriod] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'premium', 'sip', 'support'
  const [selectedPlan, setSelectedPlan] = useState('');

  // Calculate SIP Returns
  const calculateSIP = () => {
    const P = Number(monthlyInvestment);
    const n = Number(investmentPeriod) * 12;
    const i = Number(expectedReturn) / 12 / 100;
    
    const totalInvested = P * n;
    const futureValue = Math.round(P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i));
    const estimatedReturns = futureValue - totalInvested;

    return {
      invested: totalInvested.toLocaleString('en-IN'),
      returns: estimatedReturns.toLocaleString('en-IN'),
      total: futureValue.toLocaleString('en-IN')
    };
  };

  const sip = calculateSIP();

  return (
    <div className="amorwealth-body">
      
      {/* WhatsApp Sticky Button */}
      <a href="https://wa.me/918369465742" className="whatsapp-float" aria-label="Chat on WhatsApp" target="_blank" rel="noopener noreferrer">
        <i className="fab fa-whatsapp"></i>
      </a>

      {/* Header/Navigation */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <div className="logo-container" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
              <img src="https://amorwealth.in/logo2.png" alt="AMOR WEALTH Logo" className="logo" />
              <span className="logo-text">AMOR WEALTH</span>
            </div>

            <nav>
              <ul className={`nav-list ${isNavActive ? 'active' : ''}`}>
                <li><a href="#home" className="nav-link" onClick={() => setIsNavActive(false)}>Home</a></li>
                <li><a href="#services" className="nav-link" onClick={() => setIsNavActive(false)}>Services</a></li>
                <li><a href="#process" className="nav-link" onClick={() => setIsNavActive(false)}>How We Work</a></li>
                <li><a href="#calculator" className="nav-link" onClick={() => setIsNavActive(false)}>SIP Calculator</a></li>
                <li><a href="#contact" className="nav-link" onClick={() => setIsNavActive(false)}>Contact</a></li>
                <li><a href="#reviews" className="nav-link" onClick={() => setIsNavActive(false)}>Reviews</a></li>
                
                {/* LOGIN NAV FIELD WITH DROPDOWN */}
                <li className="nav-login-dropdown">
                  <button 
                    className="nav-login-btn"
                    onClick={() => setIsLoginOpen(!isLoginOpen)}
                  >
                    <i className="fas fa-lock"></i>
                    <span>Login</span>
                    <i className={`fas fa-chevron-${isLoginOpen ? 'up' : 'down'}`} style={{ fontSize: '0.75rem' }}></i>
                  </button>

                  {isLoginOpen && (
                    <div className="nav-login-menu" onMouseLeave={() => setIsLoginOpen(false)}>
                      <button 
                        className="nav-login-item"
                        onClick={() => {
                          setIsLoginOpen(false);
                          navigate('/client/login');
                        }}
                      >
                        <i className="fas fa-user-shield" style={{ color: 'var(--emerald-green)' }}></i>
                        <span>Client Vault Login</span>
                      </button>

                      <button 
                        className="nav-login-item"
                        onClick={() => {
                          setIsLoginOpen(false);
                          navigate('/admin/login');
                        }}
                      >
                        <i className="fas fa-user-tie" style={{ color: 'var(--royal-blue)' }}></i>
                        <span>Advisor Login</span>
                      </button>
                    </div>
                  )}
                </li>
              </ul>
            </nav>

            <div className={`hamburger ${isNavActive ? 'active' : ''}`} onClick={() => setIsNavActive(!isNavActive)}>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Secure Your Future with <span className="highlight">AMOR WEALTH</span></h1>
            <p className="hero-subtitle">Expert insurance planning and investment strategies tailored to your goals</p>
            <div className="hero-buttons">
              <a href="#contact" className="btn btn-primary">Get Free Consultation</a>
              <button onClick={() => navigate('/client/login')} className="btn btn-secondary flex items-center gap-2">
                <i className="fas fa-lock"></i> Vault Login
              </button>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://amorwealth.in/fin_adv.png" alt="Financial Security Illustration" width="400" height="320" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our <span className="highlight">Services</span></h2>
            <p className="section-subtitle">Comprehensive solutions for your financial well-being</p>
          </div>

          <div className="services-carousel">
            <div className="carousel-container">
              <div className="service-card">
                <div className="card-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3 className="card-title">Insurance Planning</h3>
                <p className="card-text">Tailored insurance solutions to protect what matters most to you and your family.</p>
                <a href="#contact" className="card-link">Learn More</a>
              </div>
              
              <div className="service-card">
                <div className="card-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h3 className="card-title">SIPs & Investments</h3>
                <p className="card-text">Systematic investment plans to grow your wealth with disciplined approach.</p>
                <a href="#calculator" className="card-link">Learn More</a>
              </div>
              
              <div className="service-card">
                <div className="card-icon">
                  <i className="fas fa-file-invoice-dollar"></i>
                </div>
                <h3 className="card-title">Tax Efficiency</h3>
                <p className="card-text">Strategies to minimize tax liabilities while maximizing your savings.</p>
                <a href="#contact" className="card-link">Learn More</a>
              </div>
              
              <div className="service-card">
                <div className="card-icon">
                  <i className="fas fa-handshake"></i>
                </div>
                <h3 className="card-title">Claims Support</h3>
                <p className="card-text">Expert assistance to ensure smooth and successful insurance claims.</p>
                <a href="#contact" className="card-link">Learn More</a>
              </div>
              
              <div className="service-card">
                <div className="card-icon">
                  <i className="fas fa-bullseye"></i>
                </div>
                <h3 className="card-title">Goal Mapping</h3>
                <p className="card-text">Personalized financial roadmaps to achieve your short and long-term goals.</p>
                <a href="#contact" className="card-link">Learn More</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="process">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How We <span className="highlight">Work</span></h2>
            <p className="section-subtitle">Our simple 3-step process to financial security</p>
          </div>
          
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3 className="step-title">Discovery</h3>
              <p className="step-description">We begin by understanding your financial situation, goals, and risk tolerance.</p>
            </div>
            
            <div className="process-step">
              <div className="step-number">2</div>
              <h3 className="step-title">Strategy</h3>
              <p className="step-description">We create a customized plan tailored to your unique needs and objectives.</p>
            </div>
            
            <div className="process-step">
              <div className="step-number">3</div>
              <h3 className="step-title">Implementation</h3>
              <p className="step-description">We help you execute the plan and provide ongoing monitoring and adjustments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SIP Calculator Section */}
      <section id="calculator" className="calculator">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">SIP <span className="highlight">Calculator</span></h2>
            <p className="section-subtitle">Estimate your potential investment returns</p>
          </div>
          
          <div className="calculator-container">
            <div className="calculator-form">
              <div className="form-group">
                <label htmlFor="monthly-investment">Monthly Investment (₹)</label>
                <input 
                  type="range" 
                  id="monthly-investment" 
                  min="1000" 
                  max="100000" 
                  step="1000" 
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                />
                <div className="range-value">₹<span>{Number(monthlyInvestment).toLocaleString('en-IN')}</span></div>
              </div>
              
              <div className="form-group">
                <label htmlFor="investment-period">Investment Period (Years)</label>
                <input 
                  type="range" 
                  id="investment-period" 
                  min="1" 
                  max="30" 
                  value={investmentPeriod}
                  onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
                />
                <div className="range-value"><span>{investmentPeriod}</span> years</div>
              </div>
              
              <div className="form-group">
                <label htmlFor="expected-return">Expected Return (%)</label>
                <input 
                  type="range" 
                  id="expected-return" 
                  min="5" 
                  max="20" 
                  step="0.5" 
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                />
                <div className="range-value"><span>{expectedReturn}</span>%</div>
              </div>
            </div>
            
            <div className="calculator-result">
              <div className="result-card">
                <h3 className="result-title">Estimated Returns</h3>
                <div className="result-values">
                  <div className="result-item">
                    <span className="result-label">Invested Amount</span>
                    <span className="result-amount">₹{sip.invested}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Estimated Returns</span>
                    <span className="result-amount">₹{sip.returns}</span>
                  </div>
                  <div className="result-item total">
                    <span className="result-label">Total Value</span>
                    <span className="result-amount">₹{sip.total}</span>
                  </div>
                </div>
                
                <div className="invest-now-container">
                  <button className="btn btn-invest-now" onClick={() => setActiveModal('sip')}>
                    <span className="btn-text">🚀 Invest Now</span>
                    <span className="btn-subtext">Start SIP Today!</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Plans Section */}
      <section className="premium">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title"><span className="highlight">Premium</span> Wealth Plans</h2>
            <p className="section-subtitle">Exclusive solutions for high net-worth individuals</p>
          </div>
          
          <div className="premium-cards">
            <div className="premium-card">
              <div className="card-header">
                <h3 className="card-title">Wealth Builder</h3>
                <div className="card-price">Starting at ₹25L</div>
              </div>
              <ul className="card-features">
                <li><i className="fas fa-check"></i> Customized investment portfolio</li>
                <li><i className="fas fa-check"></i> Tax optimization strategies</li>
                <li><i className="fas fa-check"></i> Quarterly portfolio reviews</li>
                <li><i className="fas fa-check"></i> Priority support</li>
              </ul>
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setSelectedPlan('Wealth Builder');
                  setActiveModal('premium');
                }}
              >
                Learn More
              </button>
            </div>
            
            <div className="premium-card featured">
              <div className="card-badge">Most Popular</div>
              <div className="card-header">
                <h3 className="card-title">Legacy Protector</h3>
                <div className="card-price">Starting at ₹50L</div>
              </div>
              <ul className="card-features">
                <li><i className="fas fa-check"></i> Comprehensive estate planning</li>
                <li><i className="fas fa-check"></i> Life insurance solutions</li>
                <li><i className="fas fa-check"></i> Wealth transfer strategies</li>
                <li><i className="fas fa-check"></i> Family office services</li>
              </ul>
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setSelectedPlan('Legacy Protector');
                  setActiveModal('premium');
                }}
              >
                Learn More
              </button>
            </div>
            
            <div className="premium-card">
              <div className="card-header">
                <h3 className="card-title">Global Investor</h3>
                <div className="card-price">Starting at ₹1Cr</div>
              </div>
              <ul className="card-features">
                <li><i className="fas fa-check"></i> International investment options</li>
                <li><i className="fas fa-check"></i> Currency hedging strategies</li>
                <li><i className="fas fa-check"></i> Offshore wealth management</li>
                <li><i className="fas fa-check"></i> Dedicated relationship manager</li>
              </ul>
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setSelectedPlan('Global Investor');
                  setActiveModal('premium');
                }}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Get In <span className="highlight">Touch</span></h2>
            <p className="section-subtitle">We're here to help with all your financial needs</p>
          </div>
          
          <div className="contact-container">
            <div className="contact-info">
              <div className="info-item">
                <div className="info-icon">
                  <i className="fas fa-phone-alt"></i>
                </div>
                <div className="info-content">
                  <h3 className="info-title">Call Us</h3>
                  <p className="info-text">+91 83694 65742</p>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="info-content">
                  <h3 className="info-title">Email Us</h3>
                  <p className="info-text">Hello@amorwealth.in</p>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="info-content">
                  <h3 className="info-title">Visit Us</h3>
                  <p className="info-text">1st Floor, Near Rad Cliff School, Waghbil, Ghodbunder Road,Thane (w) Maharashtra - 400615</p>
                </div>
              </div>
            </div>
            
            <div className="contact-form">
              <form id="support-form" className="form" onSubmit={(e) => { e.preventDefault(); alert('Request submitted successfully!'); }}>
                <h3 className="form-title">Request Support</h3>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" name="name" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="mobile">Mobile Number</label>
                  <input type="tel" id="mobile" name="mobile" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input type="text" id="city" name="city" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="queryType">Query Type</label>
                  <select id="queryType" name="queryType" required>
                    <option value="" disabled>Select Option</option>
                    <option value="Claim Support">Claim Support</option>
                    <option value="MF Investment">MF Investment</option>
                    <option value="Mediclaim">Mediclaim</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="issue">Your Query/Issue</label>
                  <textarea id="issue" name="issue" rows={3} required></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="reviews" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Client <span className="highlight">Reviews</span></h2>
            <p className="section-subtitle">What our customers say about AMOR WEALTH</p>
          </div>

          <div className="review-grid">
            <div className="review-card">
              <div className="stars">
                ★★★★★
                <span className="review-date">15 March 2024</span>
              </div>
              <p className="review-text">
                "Health insurance claim process itna smooth kiya ki tension hi nahi hua! AMOR WEALTH team ne har step pe guide kiya."
              </p>
              <div className="review-author">- Ramesh K., Thane</div>
            </div>

            <div className="review-card">
              <div className="stars">
                ★★★★★
                <span className="review-date">2 April 2024</span>
              </div>
              <p className="review-text">
                "3 saal se SIP kar raha hoon, returns expected se better. Tax saving ke saath wealth creation - perfect combo!"
              </p>
              <div className="review-author">- Priya S., Thane</div>
            </div>
          </div>

          <div className="google-reviews-cta">
            <a href="https://g.page/your-business/review" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <i className="fab fa-google"></i> Leave a Review
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="logo-container">
                <img src="https://amorwealth.in/logo2.png" alt="AMOR WEALTH Logo" className="logo" />
                <span className="logo-text">AMOR WEALTH</span>
              </div>
              <p className="footer-about">Providing expert insurance and investment advisory services to help you achieve financial security and peace of mind.</p>
              <div className="social-links">
                <a href="https://www.facebook.in/share/1HZj2DcWhW/?mibextid=wwXIfr" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="https://x.in/sushantt27?s=11" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                <a href="https://www.linkedin.in/in/sushant-yadav-28b65930b" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                <a href="https://www.instagram.in/amor.wealth" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
            
            <div className="footer-col">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#process">How We Work</a></li>
                <li><a href="#calculator">SIP Calculator</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h3 className="footer-title">Services</h3>
              <ul className="footer-links">
                <li><a href="#services">Insurance Planning</a></li>
                <li><a href="#services">Investment Advisory</a></li>
                <li><a href="#services">Tax Efficiency</a></li>
                <li><a href="#services">Claims Support</a></li>
                <li><a href="#services">Retirement Planning</a></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h3 className="footer-title">Contact Info</h3>
              <ul className="footer-contact">
                <li><i className="fas fa-map-marker-alt"></i>1st Floor, Near Rad Cliff School, Waghbil, Ghodbunder Road,Thane (w) Maharashtra - 400615</li>
                <li><i className="fas fa-phone-alt"></i> +91 8369465742</li>
                <li><i className="fas fa-envelope"></i> hello@amorwealth.in</li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="copyright">&copy; 2025 AMOR WEALTH. All Rights Reserved.</p>
            <div className="legal-links">
              <a href="#contact">Privacy Policy</a>
              <a href="#contact">Terms of Service</a>
              <a href="#contact">Disclosures</a>
            </div>
          </div>
        </div>
      </footer>

      {/* SIP Enquiry Modal */}
      {activeModal === 'sip' && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <span className="close-modal" onClick={() => setActiveModal(null)}>&times;</span>
            <h2 className="modal-title">Start <span className="highlight">SIP</span></h2>
            <p className="modal-text">Get expert mutual fund guidance</p>
            
            <form className="form" onSubmit={(e) => { e.preventDefault(); alert('SIP Proposal request submitted!'); setActiveModal(null); }}>
              <div className="form-group">
                <input type="text" placeholder="Full Name *" required />
              </div>
              <div className="form-group">
                <input type="tel" placeholder="Mobile Number *" required />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Email Address" />
              </div>
              <div className="form-group">
                <input type="text" placeholder="City *" required />
              </div>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-chart-line"></i> Get SIP Proposal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Premium Plan Modal */}
      {activeModal === 'premium' && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <span className="close-modal" onClick={() => setActiveModal(null)}>&times;</span>
            <h2 className="modal-title">Get <span className="highlight">Premium</span> Plan Details</h2>
            <p className="modal-text">Plan: {selectedPlan}</p>
            
            <form className="form" onSubmit={(e) => { e.preventDefault(); alert('Plan details request submitted!'); setActiveModal(null); }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" required />
              </div>
              <div className="form-group">
                <label>Mobile Number *</label>
                <input type="tel" required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" />
              </div>
              <button type="submit" className="btn btn-primary">Get Plan Details</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
