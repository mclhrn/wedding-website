import "./globals.css";
import { Cormorant_Garamond, Great_Vibes } from "next/font/google";
import type { ReactNode } from "react";

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

const greatVibes = Great_Vibes({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-great-vibes"
});

export const metadata = {
    title: "N&D Wedding",
    description: "Celebrate with us — wedding details, RSVP, and memories on a single page."
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className={`${cormorant.className} ${greatVibes.variable}`}>
        <div hidden aria-hidden="true">
            <form name="rsvp" method="POST" action="/?no-cache=1" data-netlify="true" netlify data-netlify-honeypot="bot-field">
                <input type="hidden" name="form-name" value="rsvp" />
                <p>
                    <label>
                        Name <input name="name" />
                    </label>
                </p>
                <p>
                    <label>
                        Email <input name="email" type="email" />
                    </label>
                </p>
                <p hidden>
                    <label>
                        Don’t fill this out: <input name="bot-field" />
                    </label>
                </p>
                <p>
                    <label>
                        Attendance
                        <select name="attendance">
                            <option value="accept">Joyfully accepts</option>
                            <option value="decline">Regretfully declines</option>
                        </select>
                    </label>
                </p>
                <p>
                    <label>
                        +1 Name <input name="plusOne" />
                    </label>
                </p>
                <p>
                    <label>
                        Dietary Notes <textarea name="dietary" />
                    </label>
                </p>
            </form>
        </div>
        {children}
        </body>
        </html>
    );
}

