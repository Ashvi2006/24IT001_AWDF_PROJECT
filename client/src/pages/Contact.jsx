import { useState } from 'react';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const maxMessageLength = 250;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > maxMessageLength) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  return (
    <div className="contact-page">
      <section className="contact-card card">
        <div className="contact-header">
          <h2 className="section-title">💬 Contact & Feedback</h2>
          <button
            className="btn btn-help"
            onClick={() => setShowHelp(!showHelp)}
          >
            💬 Need Help?
          </button>
        </div>

        {showHelp && (
          <div className="help-box">
            <p>📧 You can reach out via email at <strong>ashvi@example.com</strong> or fill the form below.</p>
          </div>
        )}

        {submitted ? (
          <div className="success-message">
            <p>✅ Thank you for your message! We'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Your Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Ashvi Antala"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="e.g. ashvi@example.com"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="message">Message</label>
                <span className="char-count">{formData.message.length} / {maxMessageLength} chars</span>
              </div>
              <textarea
                id="message"
                name="message"
                placeholder="Type your message here..."
                value={formData.message}
                onChange={handleChange}
                className="input textarea"
                rows="5"
                required
              />
            </div>

            <button type="submit" className="btn btn-submit">
              💬 Submit Message
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default Contact;
