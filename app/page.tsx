'use client';

import { useEffect, useState, MouseEvent, ChangeEvent, FormEvent, useRef } from "react";

export default function Home() {
  const [navVisible, setNavVisible] = useState(true);
  const [attendance, setAttendance] = useState("");
  const plusOneRef = useRef<HTMLLabelElement>(null);
  const [snapDisabled, setSnapDisabled] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [lastResponse, setLastResponse] = useState<"accept" | "decline" | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setFormStatus("submitting");
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("form-name", form.getAttribute("name") ?? "rsvp");
    const payload: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === "string") {
        payload[key] = value;
      }
    });

    fetch("/.netlify/functions/send-rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const submittedAttendance = formData.get("attendance");
          if (typeof submittedAttendance === "string" && (submittedAttendance === "accept" || submittedAttendance === "decline")) {
            setLastResponse(submittedAttendance);
          } else {
            setLastResponse(null);
          }
          setFormStatus("success");
          form.reset();
          setAttendance("");
          setSnapDisabled(false);
        })
        .catch(() => {
          setFormStatus("error");
        });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const elements = Array.from(
        document.querySelectorAll<HTMLElement>("[data-parallax]")
    );

    if (!elements.length) {
      return;
    }

    let ticking = false;

    const updateParallax = () => {
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const speed = parseFloat(element.dataset.speed ?? "0.25");
        const offset =
            (window.innerHeight / 2 - (rect.top + rect.height / 2)) * speed * -0.35;
        element.style.setProperty("--parallax-offset", `${offset.toFixed(2)}px`);
      });
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    const enableParallax = () => {
      ticking = false;
      updateParallax();
      window.addEventListener("scroll", handleScroll, { passive: true });
    };

    const disableParallax = () => {
      ticking = false;
      window.removeEventListener("scroll", handleScroll);
      elements.forEach((element) => {
        element.style.removeProperty("--parallax-offset");
      });
    };

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      if (event.matches) {
        disableParallax();
      } else {
        enableParallax();
      }
    };

    if (!prefersReducedMotion.matches) {
      enableParallax();
    }

    if (typeof prefersReducedMotion.addEventListener === "function") {
      prefersReducedMotion.addEventListener("change", handleMotionPreference);
    } else {
      prefersReducedMotion.addListener(handleMotionPreference);
    }

    return () => {
      disableParallax();
      if (typeof prefersReducedMotion.removeEventListener === "function") {
        prefersReducedMotion.removeEventListener("change", handleMotionPreference);
      } else {
        prefersReducedMotion.removeListener(handleMotionPreference);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hero = document.getElementById("HERO");
    const scroller = document.querySelector("main");
    if (!hero || !(scroller instanceof HTMLElement)) return;

    const observer = new IntersectionObserver(
        ([entry]) => {
          setNavVisible(entry.isIntersecting);
        },
        {
          threshold: 0.6,
          root: scroller
        }
    );

    observer.observe(hero);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    event.preventDefault();
    const href = event.currentTarget.getAttribute("href");
    const dataTarget = event.currentTarget.getAttribute("data-target");
    const targetId = (dataTarget ?? href)?.replace("#", "");
    if (!targetId) return;
    const section = document.getElementById(targetId);
    const scroller = document.querySelector("main");
    if (!section || !(scroller instanceof HTMLElement)) return;

    scroller.scrollTo({
      top: section.offsetTop,
      behavior: "smooth"
    });
  };
  const handleAttendanceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setAttendance(value);
    setSnapDisabled(value === "accept");

    if (value === "accept") {
      requestAnimationFrame(() => {
        plusOneRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    }
  };

  useEffect(() => {
    if (formStatus === "success" || formStatus === "error") {
      const timeout = window.setTimeout(() => {
        setFormStatus("idle");
      }, 6000);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [formStatus]);

  const messageClasses = ["rsvp-message"];
  if (formStatus === "success") {
    messageClasses.push("rsvp-message--visible");
  }
  if (formStatus === "error") {
    messageClasses.push("rsvp-message--visible", "rsvp-message--error");
  }

  return (
      <>
        <nav className={`nav${navVisible ? "" : " nav--hidden"}`} aria-label="Quick navigation">
          <a href="#EVENT" onClick={handleNavClick}>
            Event
          </a>
          <a href="#MAP" onClick={handleNavClick}>
            Map
          </a>
          <a href="#CAPTURE" onClick={handleNavClick}>
            Capture
          </a>
          <a href="#RSVP" onClick={handleNavClick}>
            RSVP
          </a>
        </nav>

        <main className={snapDisabled ? "snap-disabled" : undefined}>
          <section id="HERO" className="hero" aria-labelledby="hero-heading">
            <div data-parallax data-speed="0.18">
              <h1 id="hero-heading">
                Nadia<span className="hero-amp" aria-hidden="true">&amp; </span> Dean
              </h1>
              <p aria-label='Join us as we say "I do" and celebrate a lifetime together.'>
                Join us as we say &ldquo;I do&rdquo; and celebrate a lifetime together.
              </p>
              <a className="cta" href="#EVENT" onClick={handleNavClick}>
                Save the Date
              </a>
            </div>
          </section>

          <section id="EVENT" className="event" aria-labelledby="event-heading">
            <div className="event-content" data-parallax data-speed="0.12">
              <h2 id="event-heading">The Main Event</h2>
              <time dateTime="2026-09-12">Saturday · September 12 · 2026</time>
              <p className="details">
                Ceremony at Langtons Kilkenny, followed by dinner & dancing.
              </p>
              <h3>The After Party</h3>
              <p className="details">Join us the following day for music and drinks at Langtons Bar.</p>
            </div>
          </section>

          <section id="MAP" className="map" aria-labelledby="map-heading">
            <h2 id="map-heading" className="visually-hidden">
              Wedding Venue Map
            </h2>
            <div className="map-label" aria-hidden="true" data-parallax data-speed="0.14">
              <span>Find Your Way</span>
            </div>
            <iframe
                title="Wedding Venue Map"
                loading="lazy"
                allowFullScreen
                src="https://maps.google.com/maps?q=Langtons%20Hotel%20Kilkenny%2C%20Ireland&z=16&output=embed"
            />
          </section>

          <section id="CAPTURE" className="capture" aria-labelledby="capture-heading">
            <div className="capture-fireflies capture-fireflies--near" aria-hidden="true" data-parallax data-speed="0.16" />
            <div className="capture-fireflies capture-fireflies--far" aria-hidden="true" data-parallax data-speed="0.08" />
            <div className="capture-content">
              <h2 id="capture-heading">Capture</h2>
              <p>Share your favorite moments with #N&DSayIDo. We&apos;ll keep the memories rolling.</p>
              <div className="capture-gallery">
                <figure>
                  <img src="/1.jpeg" />
                </figure>
                <figure>
                  <img src="/2.webp" />
                </figure>
                <figure>
                  <img src="/3.jpg" />
                </figure>
                <figure>
                  <img src="/4.jpg" />
                </figure>
              </div>
            </div>
          </section>

          <section id="RSVP" className="rsvp" aria-labelledby="rsvp-heading">
            <div>
              <h2 id="rsvp-heading">RSVP</h2>
              <p>Let us know you&rsquo;re joining the celebration. Kindly respond by May 10.</p>
              <form
                  name="rsvp"
                  method="POST"
                  autoComplete="on"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit(event);
                  }}
              >
                <input type="hidden" name="form-name" value="rsvp" />
                <label>
                  Name
                  <input type="text" name="name" required placeholder="Your full name" />
                </label>
                <label>
                  Email
                  <input type="email" name="email" required placeholder="you@example.com" />
                </label>
                <label>
                  Attendance
                  <select
                      name="attendance"
                      required
                      value={attendance}
                      onChange={handleAttendanceChange}
                  >
                    <option value="">Select one</option>
                    <option value="accept">Joyfully accepts</option>
                    <option value="decline">Regretfully declines</option>
                  </select>
                </label>
                {attendance === "accept" && (
                    <>
                      <label ref={plusOneRef}>
                        +1 Name
                        <input type="text" name="plusOne" placeholder="Their full name" />
                      </label>
                      <label>
                        Dietary Notes
                        <textarea name="dietary" placeholder="Allergies or dietary requests" />
                      </label>
                    </>
                )}
                <button type="submit" disabled={formStatus === "submitting"}>
                  {formStatus === "submitting" ? "Sending..." : "Send RSVP"}
                </button>
              </form>
              <div className={messageClasses.join(" ")} role="status" aria-live="polite">
                {formStatus === "success" && lastResponse !== "decline" && (
                    <span>Thank you for your reply. We can’t wait to raise a glass with you beneath Kilkenny’s lights.</span>
                )}
                {formStatus === "success" && lastResponse === "decline" && (
                    <span>We’re sorry you won’t be with us in Kilkenny, but we’ll be thinking of you on the day.</span>
                )}
                {formStatus === "error" && (
                    <span>Something went awry in the post. Please try once more or reach out directly.</span>
                )}
              </div>
              <div className="rsvp-footer">
                <button className="back-top" type="button" onClick={handleNavClick} data-target="#HERO" aria-label="Back to top">
                  <span>Back to Top</span>
                </button>
                <p className="footer-note" aria-label="Made with love by Nadia and Dean">
                  Made with &hearts; by Nadia and Dean
                </p>
              </div>
            </div>
          </section>
        </main>
      </>
  );
}

