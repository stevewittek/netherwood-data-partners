"use client";

import { InquiryForm } from "./ContactForm";

export function MotionRelayBetaSignup() {
  return (
    <section className="product-beta-signup" id="beta-signup">
      <div className="studio-wrap product-beta-signup-layout">
        <div>
          <p className="eyebrow">Beta testing</p>
          <h2>Help test the Motion Relay phone apps.</h2>
          <p>
            Netherwood is looking for iPhone and Android testers who use a
            compatible Garmin watch and can try the complete watch-to-phone
            experience before the companion apps are publicly released.
          </p>
          <p>
            A free or paid ChatGPT account is acceptable. You must already have
            Voice available in the official ChatGPT mobile app. Voice access
            and limits can vary by plan, region, app version and account
            settings.
          </p>
          <p>
            Do not include passwords, account credentials, health details or
            private workout data in this form. Signing up does not guarantee a
            testing invitation.
          </p>
          <p>
            If your request is approved, you will receive an email confirming
            that you have been added as a tester, along with the installation
            link and next steps for your phone platform.
          </p>
        </div>
        <div className="contact-copy">
          <InquiryForm
            source="Motion Relay beta tester signup"
            submitLabel="Request beta access"
            successMessage="Thank you. Your beta tester request has been received. If approved, you will receive an email confirming that you have been added as a tester, with the installation link and next steps."
          >
            <div className="contact-form-grid">
              <div className="contact-field">
                <label htmlFor="beta-name">Name</label>
                <input
                  autoComplete="name"
                  id="beta-name"
                  maxLength={120}
                  name="name"
                  required
                  type="text"
                />
              </div>

              <div className="contact-field">
                <label htmlFor="beta-email">Email</label>
                <input
                  autoComplete="email"
                  id="beta-email"
                  maxLength={254}
                  name="email"
                  required
                  type="email"
                />
              </div>

              <div className="contact-field">
                <label htmlFor="beta-platform">Phone platform</label>
                <select defaultValue="" id="beta-platform" name="phone_platform" required>
                  <option disabled value="">Choose iPhone or Android</option>
                  <option value="iPhone">iPhone</option>
                  <option value="Android">Android</option>
                </select>
              </div>

              <div className="contact-field">
                <label htmlFor="beta-phone-model">
                  Phone model <span>(optional)</span>
                </label>
                <input
                  id="beta-phone-model"
                  maxLength={120}
                  name="phone_model"
                  type="text"
                />
              </div>

              <div className="contact-field contact-field-wide">
                <label htmlFor="beta-garmin-model">Garmin watch model</label>
                <input
                  id="beta-garmin-model"
                  maxLength={120}
                  name="garmin_watch_model"
                  required
                  type="text"
                />
              </div>
            </div>

            <label className="beta-confirmation" htmlFor="beta-chatgpt-voice">
              <input
                id="beta-chatgpt-voice"
                name="chatgpt_voice_available"
                required
                type="checkbox"
                value="confirmed"
              />
              <span>
                I have a ChatGPT account and Voice is available in my official
                ChatGPT mobile app.
              </span>
            </label>

            <label className="beta-confirmation" htmlFor="beta-testing-terms">
              <input
                id="beta-testing-terms"
                name="beta_testing_acknowledged"
                required
                type="checkbox"
                value="confirmed"
              />
              <span>
                I understand this is pre-release testing and I may be invited
                to install a TestFlight or Google Play testing build and report
                problems.
              </span>
            </label>
          </InquiryForm>
        </div>
      </div>
    </section>
  );
}
