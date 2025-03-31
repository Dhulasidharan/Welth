import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Welth",
  description: "One Stop Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          {/*header*/}
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors/>
          {/*footer*/}
          <footer className="bg-gradient-to-r from-blue-950 to-purple-950 py-12 relative overflow-hidden">
            {/* Stars background */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className={`absolute rounded-full bg-white ${
                    i % 5 === 0 ? "twinkle" : ""
                  }`}
                  style={{
                    left: `${(i * 83) % 100}%`,
                    top: `${(i * 47) % 100}%`,
                    width: `${(i % 3) + 1}px`,
                    height: `${(i % 3) + 1}px`,
                    opacity: i % 3 === 0 ? 0.6 : 0.9,
                  }}
                />
              ))}
            </div>

            <div className="container mx-auto px-4 text-center relative z-10">
              <p className="text-white font-medium">
                Made with{" "}
                <span className="inline-block animate-pulse text-red-400 transform hover:scale-125 transition-transform duration-300">
                  💗
                </span>{" "}
                by
                <span className="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-purple-400 font-bold glow">
                  Dhulasidharan
                </span>
              </p>

              <div className="mt-4 flex justify-center space-x-6">
                <a
                  href="https://www.linkedin.com/in/dhulasi-dharan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-green-300 transition-colors duration-300 transform hover:scale-110"
                >
                  LinkedIn
                </a>
                <a
                  href="https://github.com/Dhulasidharan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-green-300 transition-colors duration-300 transform hover:scale-110"
                >
                  GitHub
                </a>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
