import { getCurrentUser, getIsSignedIn } from "@/app/lib/auth-server";
import {
  NotificationsSection,
  AuthAccessSection,
  HeroSection,
  ServicesSection,
  AboutSection,
} from "@/app/components";

export default async function HomePage() {
  const [isSignedIn, user] = await Promise.all([getIsSignedIn(), getCurrentUser()]);
  const isAdmin = user?.role === "admin";

  return (
    <>
      <HeroSection isAdmin={isAdmin} />

      <ServicesSection isAdmin={isAdmin} />

      <AboutSection isAdmin={isAdmin} />

      {/* Client Access Section */}
      <section className="px-6 md:px-12 py-20 max-w-[1440px] mx-auto" data-nav-section="acces-client" id="acces-client">
        <div className="bg-primary rounded-[3rem] overflow-hidden relative p-12 md:p-24 text-center shadow-2xl shadow-primary/40">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#e9c176,_transparent)]"></div>
          </div>
          <div className="relative z-10">
            {isSignedIn ? (
              <NotificationsSection user={user} />
            ) : (
              <AuthAccessSection />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
