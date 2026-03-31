import Image from "next/image";
import { signIn } from "@/app/actions";

type AuthAccessSectionProps = {
  nextPath?: string;
  error?: string | null;
};

function resolveAuthErrorMessage(error?: string | null) {
  if (!error) {
    return "";
  }

  return "Connexion impossible. Verifiez vos identifiants ou reessayez.";
}

export function AuthAccessSection({ nextPath = "/mon-profil", error }: AuthAccessSectionProps) {
  const errorMessage = resolveAuthErrorMessage(error);

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-fixed-dim selection:text-on-primary-fixed">
      <main className="min-h-screen pt-12 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <div className="mb-16 text-center">
            <h1 className="font-headline text-5xl md:text-6xl text-primary font-bold tracking-tight mb-4">L&apos;Atelier Numérique</h1>
            <p className="font-body text-secondary max-w-xl mx-auto text-lg uppercase tracking-[0.1em] text-sm">Accédez à votre espace sur-mesure ou rejoignez notre héritage de précision textile.</p>
            {errorMessage ? (
              <div className="mt-8 p-4 bg-error-container text-on-error-container rounded-xl inline-block" role="alert">
                {errorMessage}
              </div>
            ) : null}
          </div>

          {/* Auth Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-outline-variant/20 rounded-xl overflow-hidden shadow-[0_48px_64px_rgba(27,28,25,0.06)]">
            {/* Left: Se connecter */}
            <section className="bg-surface p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <div className="mb-10">
                  <h2 className="font-headline text-4xl text-primary font-bold mb-2">Se connecter</h2>
                  <p className="text-secondary text-xs tracking-[0.2em] uppercase font-bold">Bon retour parmi nous</p>
                </div>
                <form className="space-y-6" action={signIn}>
                  <input name="next" type="hidden" value={nextPath} />
                  <input name="intent" type="hidden" value="login" />
                  
                  <div className="space-y-6">
                    <div className="relative">
                      <label className="font-label text-[10px] uppercase tracking-[0.2em] text-outline/80 mb-2 block font-bold">Username ou e-mail</label>
                      <input 
                        name="email"
                        className="w-full bg-white border border-outline-variant/50 focus:border-primary focus:ring-0 px-4 py-4 transition-colors outline-none font-body text-on-surface text-sm" 
                        placeholder="votre@email.com" 
                        type="email"
                        required
                      />
                    </div>
                    <div className="relative">
                      <label className="font-label text-[10px] uppercase tracking-[0.2em] text-outline/80 mb-2 block font-bold">Mot de passe</label>
                      <input 
                        name="password"
                        className="w-full bg-white border border-outline-variant/50 focus:border-primary focus:ring-0 px-4 py-4 transition-colors outline-none font-body text-on-surface text-sm" 
                        placeholder="••••••••" 
                        type="password"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative w-5 h-5 border border-outline-variant/50 rounded-sm group-hover:border-primary transition-colors flex items-center justify-center bg-white">
                        <input className="absolute opacity-0 w-full h-full cursor-pointer peer" type="checkbox"/>
                        <span className="material-symbols-outlined text-primary text-sm opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                      </div>
                      <span className="text-[11px] font-label text-secondary tracking-wide uppercase">Mémoriser mon mot de passe</span>
                    </label>
                    <button type="button" className="text-[11px] font-label uppercase tracking-widest text-primary hover:opacity-70 transition-opacity font-bold">Oublié?</button>
                  </div>
                  
                  {/* Security Verification Box */}
                  <div className="bg-surface-container-low p-5 rounded-xl flex items-center justify-between border border-outline-variant/20">
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 border-2 border-outline-variant/30 rounded-full"></div>
                      <span className="text-[11px] text-secondary font-label uppercase tracking-widest">Vérification de sécurité</span>
                    </div>
                    <span className="material-symbols-outlined text-outline/60 text-xl">shield</span>
                  </div>
                  
                  <button className="w-full bg-primary text-on-primary py-5 rounded-lg font-label text-xs uppercase tracking-[0.3em] font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200" type="submit">
                    Se connecter
                  </button>
                </form>
                
                <div className="mt-12 relative">
                  <div aria-hidden="true" className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/20"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-bold">
                    <span className="bg-surface px-6 text-outline/40">Expérience exclusive</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Right: S'inscrire */}
            <section className="bg-surface-container-low p-8 md:p-12 lg:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary-fixed-dim/10 rounded-full blur-3xl"></div>
              <div className="max-w-md mx-auto w-full relative z-10">
                <div className="mb-10 text-center">
                  <p className="text-secondary text-[10px] tracking-[0.2em] uppercase font-bold mb-2">Créer un nouveau profil d&apos;artisanat</p>
                  <div className="w-12 h-[1px] bg-outline-variant/30 mx-auto"></div>
                </div>
                <form className="space-y-5" action={signIn}>
                  <input name="next" type="hidden" value={nextPath} />
                  <input name="intent" type="hidden" value="signup" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="font-label text-[10px] uppercase tracking-[0.1em] text-outline/80 mb-1 block font-bold">Nom</label>
                      <input name="first_name" className="w-full bg-white/50 border border-outline-variant/40 focus:border-primary focus:ring-0 px-3 py-3 transition-colors outline-none font-body text-on-surface text-sm rounded" type="text"/>
                    </div>
                    <div className="relative">
                      <label className="font-label text-[10px] uppercase tracking-[0.1em] text-outline/80 mb-1 block font-bold">Username</label>
                      <input name="last_name" className="w-full bg-white/50 border border-outline-variant/40 focus:border-primary focus:ring-0 px-3 py-3 transition-colors outline-none font-body text-on-surface text-sm rounded" type="text"/>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="font-label text-[10px] uppercase tracking-[0.1em] text-outline/80 mb-1 block font-bold">E-mail</label>
                    <input name="email" className="w-full bg-white/50 border border-outline-variant/40 focus:border-primary focus:ring-0 px-3 py-3 transition-colors outline-none font-body text-on-surface text-sm rounded" type="email" required/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="font-label text-[10px] uppercase tracking-[0.1em] text-outline/80 mb-1 block font-bold">Date de naissance</label>
                      <input name="birth_date" className="w-full bg-white/50 border border-outline-variant/40 focus:border-primary focus:ring-0 px-3 py-3 transition-colors outline-none font-body text-on-surface text-sm rounded" type="text" placeholder="mm/dd/yyyy"/>
                    </div>
                    <div className="relative">
                      <label className="font-label text-[10px] uppercase tracking-[0.1em] text-outline/80 mb-1 block font-bold">Numéro de téléphone</label>
                      <input name="phone" className="w-full bg-white/50 border border-outline-variant/40 focus:border-primary focus:ring-0 px-3 py-3 transition-colors outline-none font-body text-on-surface text-sm rounded" type="tel"/>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="font-label text-[10px] uppercase tracking-[0.1em] text-outline/80 mb-1 block font-bold">Adresse</label>
                    <input name="address" className="w-full bg-white/50 border border-outline-variant/40 focus:border-primary focus:ring-0 px-3 py-3 transition-colors outline-none font-body text-on-surface text-sm rounded" type="text"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="font-label text-[10px] uppercase tracking-[0.1em] text-outline/80 mb-1 block font-bold">Mot de passe</label>
                      <input name="password" className="w-full bg-white/50 border border-outline-variant/40 focus:border-primary focus:ring-0 px-3 py-3 transition-colors outline-none font-body text-on-surface text-sm rounded" type="password" required/>
                    </div>
                    <div className="relative">
                      <label className="font-label text-[10px] uppercase tracking-[0.1em] text-outline/80 mb-1 block font-bold">Confirmer</label>
                      <input name="confirm_password" className="w-full bg-white/50 border border-outline-variant/40 focus:border-primary focus:ring-0 px-3 py-3 transition-colors outline-none font-body text-on-surface text-sm rounded" type="password"/>
                    </div>
                  </div>
                  
                  {/* Human Verification Box */}
                  <div className="bg-white/80 p-4 rounded-xl flex items-center justify-between border border-outline-variant/20 mt-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary/40 text-lg">verified_user</span>
                      <span className="text-[10px] text-secondary font-label uppercase tracking-widest font-bold">Vérification humaine requise</span>
                    </div>
                    <button className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors" type="button">Vérifier</button>
                  </div>
                  
                  <button className="w-full border-2 border-primary text-primary py-5 rounded-lg font-label text-xs uppercase tracking-[0.3em] font-bold hover:bg-primary hover:text-on-primary transition-all duration-300 mt-4" type="submit">
                    Créer un compte
                  </button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
