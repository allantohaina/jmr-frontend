"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/actions";
import type { UserProfile } from "@/app/lib";
import {
  type ProfileOrder,
  type ProfileOrderStatus,
  type ProfileNotification,
  type ProfileNotificationTone,
  type ProfileActivity,
  type ProfileDocument,
  PROFILE_NOTIFICATIONS,
  PROFILE_ORDERS,
  PROFILE_ACTIVITY,
  PROFILE_DOCUMENTS,
} from "@/app/lib";

type ProfileCard = {
  title: string;
  description: string;
};

type ProfileMetric = {
  label: string;
  value: string;
  detail: string;
  icon: string;
};

type MonProfilSectionProps = {
  variant?: "preview" | "dashboard";
  user?: UserProfile | null;
};

const PROFILE_ITEMS: ProfileCard[] = [
  {
    title: "Gardez vos coordonnees pretes pour chaque demande",
    description: "Retrouvez vos contacts, adresses et informations de facturation sans tout ressaisir.",
  },
  {
    title: "Retrouvez toutes vos commandes en un coup d'oeil",
    description: "Visualisez vos devis, commandes en cours et prochaines etapes depuis le meme espace.",
  },
  {
    title: "Recevez les alertes utiles au bon moment",
    description: "Soyez prevenu des qu'un devis arrive, qu'un document est depose ou qu'une etape change.",
  },
];

const PROFILE_METRICS: ProfileMetric[] = [
  {
    label: "Commandes actives",
    value: "03",
    detail: "2 en production et 1 en validation finale.",
    icon: "conveyor_belt",
  },
  {
    label: "Devis en attente",
    value: "01",
    detail: "Une demande de devis recue le 8 mars 2026.",
    icon: "request_quote",
  },
  {
    label: "Notifications",
    value: "04",
    detail: "Nouveaux messages, documents et etapes valides.",
    icon: "notifications_active",
  },
];

function OrderDetailsModal({ order, onClose }: { order: ProfileOrder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#163526]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 md:p-12 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-3 py-1 bg-[#163526]/5 text-[#163526] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#163526]/5 mb-3 inline-block">
                Référence {order.code}
              </span>
              <h3 className="font-headline text-3xl text-[#163526]">{order.title}</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#163526]/5 rounded-full transition-colors">
              <span className="material-symbols-outlined text-[#163526]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40 mb-2">Statut Actuel</p>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    order.status === 'production' ? 'bg-orange-500 animate-pulse' : 
                    order.status === 'attente_devis' ? 'bg-[#ce812f]/40' : 'bg-[#163526]'
                  }`}></div>
                  <span className="text-sm font-bold text-[#163526] uppercase tracking-widest">{getOrderStatusLabel(order.status)}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40 mb-2">Résumé de la requête</p>
                <p className="text-sm text-[#163526]/70 leading-relaxed italic">"{order.summary}"</p>
              </div>
            </div>
            <div className="bg-[#faf9f4] p-6 rounded-2xl border border-[#163526]/5 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Prochaine Étape</p>
              <p className="text-xs font-bold text-[#163526] leading-relaxed">{order.nextStep}</p>
              <div className="pt-4 border-t border-[#163526]/10 flex justify-between items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Montant Total</span>
                <span className="text-xl font-headline font-bold text-[#163526]">{order.amount}</span>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row gap-4">
            {order.status === 'devis' ? (
              <button 
                onClick={() => alert("Redirection vers le paiement de l'acompte (50%).")}
                className="flex-1 py-4 bg-[#ce812f] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Accepter & Payer l'Acompte
              </button>
            ) : order.status === 'attente_devis' ? (
              <button className="flex-1 py-4 bg-[#163526]/10 text-[#163526]/40 text-[10px] font-bold uppercase tracking-widest rounded-xl cursor-not-allowed">
                En attente du devis
              </button>
            ) : (
              <button className="flex-1 py-4 bg-[#163526] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl transition-all">
                Contacter l'Atelier
              </button>
            )}
            {order.status !== 'attente_devis' && (
              <Link 
                href={`/mon-profil/devis/${order.code}`}
                className="flex-1 py-4 bg-white border border-[#163526]/10 text-[#163526] text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#163526]/5 transition-all text-center"
              >
                Voir le Devis PDF
              </Link>
            )}
          </div>

          {order.status === 'devis' && (
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-orange-500">info</span>
              <p className="text-[10px] font-bold text-orange-800 uppercase tracking-widest">
                Besoin d'une modification ? <Link href={`/demande-devis?modify=${order.code}`} className="underline hover:text-orange-900 transition-colors">Cliquez ici pour modifier</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getOrderStatusLabel(status: ProfileOrderStatus) {
  if (status === "attente_devis") {
    return "Etude en cours";
  }

  if (status === "devis") {
    return "Devis pret";
  }

  if (status === "production") {
    return "En production";
  }

  return "Livraison";
}

export function MonProfilSection({ variant = "preview", user }: MonProfilSectionProps) {
  const [selectedOrder, setSelectedOrder] = useState<ProfileOrder | null>(null);

  if (variant === "dashboard") {
    return (
      <section className="min-h-screen bg-[#faf9f4] pb-24">
        {/* Clean, refined header */}
        <div className="bg-white border-b border-[#163526]/5 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-[#ce812f] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Espace Personnel</p>
                <h1 className="font-headline text-5xl text-[#163526] font-bold tracking-tight leading-none mb-3">Tableau de bord</h1>
                <p className="text-[#163526]/50 text-sm font-medium">Bienvenue, <span className="text-[#163526] font-bold">{user?.first_name} {user?.last_name}</span></p>
              </div>
              <div className="bg-[#163526]/5 px-6 py-3 rounded-full border border-[#163526]/10">
                <p className="text-[#163526] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ce812f]"></span>
                  Statut : {user?.role === 'admin' ? 'Administrateur' : user?.role === 'worker' ? 'Artisan Atelier' : 'Client Privilégié'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
          {/* Hero Card */}
          <div className="relative bg-[#163526] rounded-[2.5rem] p-10 md:p-16 text-white overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6 leading-tight">
                L'excellence textile, <br/>étape par étape.
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-8 font-light">
                Consultez vos devis, suivez la fabrication de vos pièces en temps réel et accédez à vos archives techniques. Votre vision prend vie ici.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/suivi-projet" className="px-8 py-4 bg-[#ce812f] text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#b87028] transition-all shadow-lg shadow-[#ce812f]/20">
                  Suivre mes commandes
                </Link>
                <Link href="/demande-devis" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-white/20 transition-all border border-white/10">
                  Nouveau Devis
                </Link>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-white/20 transition-all border border-white/10">
                  Contacter un expert
                </button>
              </div>
            </div>
            {/* Elegant Background Logo */}
            <div className="absolute right-[-10%] bottom-[-30%] opacity-[0.03] pointer-events-none select-none">
              <Image src="/navbar/logo.svg" alt="" width={600} height={600} className="invert" />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROFILE_METRICS.map((metric, idx) => (
              <div className="bg-white p-8 rounded-[2rem] border border-[#163526]/5 shadow-sm hover:shadow-md transition-all group" key={idx}>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-[#163526]/5 rounded-2xl flex items-center justify-center text-[#163526] group-hover:bg-[#ce812f] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">{metric.icon}</span>
                  </div>
                  <span className="text-4xl font-headline font-bold text-[#163526]">{metric.value}</span>
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#163526] mb-2">{metric.label}</h3>
                <p className="text-[#163526]/50 text-xs leading-relaxed">{metric.detail}</p>
              </div>
            ))}
          </div>

          {/* Main Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left & Center: Orders & Notifications */}
            <div className="lg:col-span-2 space-y-10">
              {/* Orders Section */}
              <div className="bg-white rounded-[2.5rem] border border-[#163526]/5 shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b border-[#163526]/5 flex justify-between items-center">
                  <h2 className="font-headline text-2xl text-[#163526] font-bold">Commandes récentes</h2>
                  <Link href="/suivi-projet" className="text-[10px] font-bold uppercase tracking-widest text-[#ce812f] hover:underline">
                    Voir tout le catalogue
                  </Link>
                </div>
                <div className="divide-y divide-[#163526]/5">
                  {PROFILE_ORDERS.map((order) => (
                    <div 
                      key={order.code}
                      onClick={() => setSelectedOrder(order)}
                      className="group p-10 hover:bg-[#faf9f4] transition-all cursor-pointer flex flex-col md:flex-row justify-between gap-8"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#ce812f] bg-[#ce812f]/10 px-3 py-1 rounded-full">
                            {order.code}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                            order.status === 'production' ? 'bg-[#163526] text-white' : 'bg-[#163526]/5 text-[#163526]'
                          }`}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-[#163526] group-hover:text-[#ce812f] transition-colors">{order.title}</h3>
                        <p className="text-sm text-[#163526]/60 leading-relaxed max-w-md">{order.summary}</p>
                      </div>
                      <div className="flex flex-col justify-between items-end gap-6 text-right">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#163526]/30">Prochaine étape</p>
                          <p className="text-sm font-bold text-[#163526]">{order.nextStep}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-headline font-bold text-[#163526]">{order.amount}</span>
                          <div className="w-10 h-10 bg-[#163526]/5 rounded-full flex items-center justify-center text-[#163526] group-hover:bg-[#163526] group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications Section */}
              <div className="bg-white rounded-[2.5rem] border border-[#163526]/5 shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b border-[#163526]/5">
                  <h2 className="font-headline text-2xl text-[#163526] font-bold">Dernières alertes</h2>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PROFILE_NOTIFICATIONS.map((notif, idx) => (
                    <div 
                      key={idx}
                      className={`p-8 rounded-3xl border ${
                        notif.tone === 'highlight' 
                        ? 'bg-[#163526] text-white border-[#163526]' 
                        : 'bg-[#faf9f4] text-[#163526] border-[#163526]/5'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${notif.tone === 'highlight' ? 'text-white/40' : 'text-[#163526]/30'}`}>
                          {notif.date}
                        </span>
                        <span className="material-symbols-outlined opacity-30 text-xl">
                          {notif.tone === 'highlight' ? 'priority_high' : 'info'}
                        </span>
                      </div>
                      <h3 className="font-bold mb-3 leading-tight">{notif.title}</h3>
                      <p className={`text-xs leading-relaxed ${notif.tone === 'highlight' ? 'text-white/70' : 'text-[#163526]/60'}`}>
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Activity & Documents */}
            <div className="space-y-10">
              {/* Activity Card */}
              <div className="bg-white rounded-[2.5rem] border border-[#163526]/5 shadow-sm p-10">
                <h2 className="font-headline text-2xl text-[#163526] font-bold mb-8">Activité</h2>
                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#163526]/10">
                  {PROFILE_ACTIVITY.map((activity, idx) => (
                    <div className="relative pl-10" key={idx}>
                      <div className="absolute left-0 top-1.5 w-[23px] h-[23px] bg-white border-2 border-[#163526] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#ce812f] rounded-full"></div>
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#163526]/30 mb-1">{activity.date}</p>
                      <h4 className="text-sm font-bold text-[#163526] mb-1">{activity.label}</h4>
                      <p className="text-xs text-[#163526]/60 leading-relaxed">{activity.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents Card */}
              <div className="bg-[#163526] rounded-[2.5rem] p-10 text-white shadow-xl">
                <h2 className="font-headline text-2xl font-bold mb-8">Documents</h2>
                <div className="space-y-4">
                  {PROFILE_DOCUMENTS.map((doc, idx) => (
                    <div key={idx} className="group p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all flex items-center gap-4 cursor-pointer">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-2xl">description</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate">{doc.title}</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Fichier stocké localement</p>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:text-[#163526] transition-all">
                        <span className="material-symbols-outlined text-sm">download</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-4 bg-white/10 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl border border-white/10 hover:bg-white/20 transition-all">
                  Accéder aux archives
                </button>
              </div>
            </div>
          </div>
        </div>

        {selectedOrder && (
          <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </section>
    );
  }

  return (
    <section className="profile-page ui-section-shell" aria-labelledby="profile-preview-title">
      <header className="profile-page__header ui-section-header">
        <h1 className="ui-section-title" id="profile-preview-title">
          Mon espace client
        </h1>
        <span className="profile-page__underline ui-section-underline" aria-hidden="true" />
        <p className="profile-page__lead">
          Un acces unique pour centraliser vos echanges, documents techniques et le suivi de vos
          productions textile.
        </p>
      </header>

      <div className="profile-page__panel ui-panel-shell">
        <div className="profile-page__cards">
          {PROFILE_ITEMS.map((item, idx) => (
            <article
              className="profile-page__card ui-soft-card"
              key={idx}
              data-reveal
              style={{ transitionDelay: `${idx * 80 + 100}ms` }}
            >
              <div className="profile-page__card-icon" aria-hidden="true">
                <Image src="/bulle_de_compte.svg" alt="" width={100} height={100} />
              </div>
              <h2 className="profile-page__card-title">{item.title}</h2>
              <p className="profile-page__card-description">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="profile-page__cta" data-reveal style={{ transitionDelay: "350ms" }}>
          <Link className="profile-page__action" href="/mon-profil">
            Acceder a mon espace
          </Link>
        </div>
      </div>
    </section>
  );
}
