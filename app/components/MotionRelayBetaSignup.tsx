"use client";

import { InquiryForm } from "./ContactForm";
import { motionRelayRoutes } from "../content/motion-relay";

export function MotionRelayBetaSignup() {
  return (
    <section className="product-beta-signup" id="beta-signup">
      <div className="studio-wrap product-beta-signup-layout">
        <div>
          <p className="eyebrow">Testing invitations</p>
          <h2>Help test the Motion Relay phone apps.</h2>
          <p>Use a Garmin watch and want to help test Motion Relay? Tell me your watch and phone models.</p>
          <p>You need a compatible Garmin watch and an iPhone with iOS 17 or later, or an Android phone with Android 8 or later. Check the <a className="studio-text-link" href={motionRelayRoutes.compatibility}>watch and phone requirements</a> before requesting an invitation; your installation channel may have additional requirements.</p>
          <p>Start with live Garmin readings on your phone. ChatGPT is optional; assistant testing needs a separately supported connection. Your invitation will confirm the setup available to you.</p>
          <p>The preview is for United States residents age 18 or older. Leave out passwords, health details and workout data. Invitations are not guaranteed. Approved testers receive installation instructions by email.</p>
        </div>
        <div className="contact-copy">
          <InquiryForm
            source="Motion Relay beta tester signup"
            submitLabel="Request an invitation"
            successMessage="Your request has been received. If approved, you will receive an email with the installation link and next steps."
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
                type="checkbox"
                value="confirmed"
              />
              <span>
                Optional: I can also test ChatGPT Voice in the official mobile app.
                My invitation will confirm assistant compatibility.
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
                I am a United States resident age 18 or older. I understand this is
                pre-release testing and I may be invited
                to install a TestFlight or Google Play testing build and report
                problems.
              </span>
            </label>
          </InquiryForm>
          <p>Prefer email? <a href="mailto:contact@netherwooddatapartners.com?subject=Motion%20Relay%20testing">Contact Netherwood</a> with your watch and phone models.</p>
        </div>
      </div>
    </section>
  );
}
