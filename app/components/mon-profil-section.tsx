"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { UserProfile } from "@/app/lib";
import {
  type ProfileOrder,
  type ProfileOrderStatus,
  TEXTILE_PROBLEM_THREADS,
  PROFILE_ORDERS,
  PROFILE_ACTIVITY,
  PROFILE_DOCUMENTS,
} from "@/app/lib";
import { ProblemHierarchyPanel } from "./problem-hierarchy-panel";

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
    detail: "4 problemes principaux, details et sous-problemes sur demande.",
    icon: "notifications_active",
  },
];

function OrderDetailsModal({ order, onClose }: { order: ProfileOrder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#e5ad46]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#25303a] rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 md:p-12 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-3 py-1 bg-[#e5ad46]/5 text-[#e5ad46] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#e5ad46]/5 mb-3 inline-block">
                Référence {order.code}
              </span>
              <h3 className="font-headline text-3xl text-[#e5ad46]">{order.title}</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#e5ad46]/5 rounded-full transition-colors">
              <span className="material-symbols-outlined text-[#e5ad46]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-2">Statut Actuel</p>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    order.status === 'production' ? 'bg-orange-500 animate-pulse' : 
                    order.status === 'attente_devis' ? 'bg-[#e5ad46]/40' : 'bg-[#e5ad46]'
                  }`}></div>
                  <span className="text-sm font-bold text-[#e5ad46] uppercase tracking-widest">{getOrderStatusLabel(order.status)}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-2">Résumé de la requête</p>
                <p className="text-sm text-[#eccc90]/70 leading-relaxed italic">&quot;{order.summary}&quot;</p>
              </div>
            </div>
            <div className="bg-[#1e2a38] p-6 rounded-2xl border border-[#e5ad46]/10 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">Prochaine Étape</p>
              <p className="text-xs font-bold text-[#eccc90] leading-relaxed">{order.nextStep}</p>
              <div className="pt-4 border-t border-[#e5ad46]/10 flex justify-between items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">Montant Total</span>
                <span className="text-xl font-headline font-bold text-[#e5ad46]">{order.amount}</span>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row gap-4">
            {order.status === 'devis' ? (
                <Link
                  href={`/mon-profil/devis/paiement?id=${order.code}`}
                className="flex-1 py-4 bg-[#e5ad46] text-[#1e2a38] text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg hover:bg-[#eccc90] transition-all"
              >
                Accepter & Payer l&apos;Acompte
              </Link>
            ) : order.status === 'attente_devis' ? (
              <button className="flex-1 py-4 bg-[#e5ad46]/10 text-[#e5ad46]/40 text-[10px] font-bold uppercase tracking-widest rounded-xl cursor-not-allowed">
                En attente du devis
              </button>
            ) : (
              <button className="flex-1 py-4 bg-[#e5ad46] text-[#1e2a38] text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg hover:bg-[#eccc90] transition-all">
                Contacter l&apos;Atelier
              </button>
            )}
            {order.status !== 'attente_devis' && (
              <Link 
                href={`/mon-profil/devis/paiement?id=${order.code}`}
                className="flex-1 py-4 bg-[#1e2a38] border border-[#e5ad46]/20 text-[#e5ad46] text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#e5ad46]/10 transition-all text-center"
              >
                Voir le Devis PDF
              </Link>
            )}
          </div>

          {order.status === 'devis' && (
            <div className="p-4 bg-[#e5ad46]/10 border border-[#e5ad46]/20 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-[#e5ad46]">info</span>
              <p className="text-[10px] font-bold text-[#eccc90] uppercase tracking-widest">
                Besoin d&apos;une modification ou d&apos;un ajout ? <Link href={`/demande-devis?modify=${order.code}`} className="underline hover:text-[#e5ad46] transition-colors">Cliquez ici pour modifier ou ajouter</Link>
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
      <section className="min-h-screen bg-[#25303a] pb-24">
        {/* Clean, refined header */}
        <div className="bg-[#25303a] border-b border-[#e5ad46]/5 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-[#e5ad46] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Espace Personnel</p>
                <h1 className="font-headline text-5xl text-[#e5ad46] font-bold tracking-tight leading-none mb-3">Tableau de bord</h1>
                <p className="text-[#e5ad46]/50 text-sm font-medium">Bienvenue, <span className="text-[#e5ad46] font-bold">{user?.first_name} {user?.last_name}</span></p>
              </div>
              <div className="bg-[#e5ad46]/5 px-6 py-3 rounded-full border border-[#e5ad46]/10">
                <p className="text-[#e5ad46] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e5ad46]"></span>
                  Statut : {user?.role === 'admin' ? 'Administrateur' : user?.role === 'worker' ? 'Artisan Atelier' : 'Client Privilégié'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
          {/* Hero Card */}
          <div className="relative bg-[#1e2a38] rounded-[2.5rem] p-10 md:p-16 text-[#e5ad46] overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6 leading-tight">
                L&apos;excellence textile, <br/>étape par étape.
              </h2>
              <p className="text-[#eccc90]/70 text-lg leading-relaxed mb-8 font-light">
                Consultez vos devis, suivez la fabrication de vos pièces en temps réel et accédez à vos archives techniques. Votre vision prend vie ici.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/suivi-projet" className="px-8 py-4 bg-[#e5ad46] text-[#1e2a38] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#eccc90] transition-all shadow-lg shadow-[#e5ad46]/20">
                  Suivre mes commandes
                </Link>
                <Link href="/demande-devis" className="px-8 py-4 bg-[#25303a]/40 backdrop-blur-md text-[#e5ad46] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#25303a]/60 transition-all border border-[#e5ad46]/20">
                  Nouveau Devis
                </Link>
                <button className="px-8 py-4 bg-[#25303a]/40 backdrop-blur-md text-[#e5ad46] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#25303a]/60 transition-all border border-[#e5ad46]/20">
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
              <div className="bg-[#25303a] p-8 rounded-[2rem] border border-[#e5ad46]/5 shadow-sm hover:shadow-md transition-all group" key={idx}>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-[#e5ad46]/5 rounded-2xl flex items-center justify-center text-[#e5ad46] group-hover:bg-[#e5ad46] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">{metric.icon}</span>
                  </div>
                  <span className="text-4xl font-headline font-bold text-[#e5ad46]">{metric.value}</span>
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e5ad46] mb-2">{metric.label}</h3>
                <p className="text-[#e5ad46]/50 text-xs leading-relaxed">{metric.detail}</p>
              </div>
            ))}
          </div>

          {/* Main Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left & Center: Orders & Notifications */}
            <div className="lg:col-span-2 space-y-10">
              {/* Orders Section */}
              <div className="bg-[#25303a] rounded-[2.5rem] border border-[#e5ad46]/5 shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b border-[#e5ad46]/5 flex justify-between items-center">
                  <h2 className="font-headline text-2xl text-[#e5ad46] font-bold">Commandes récentes</h2>
                  <Link href="/suivi-projet" className="text-[10px] font-bold uppercase tracking-widest text-[#e5ad46] hover:underline">
                    Voir tout le catalogue
                  </Link>
                </div>
                <div className="divide-y divide-[#e5ad46]/5">
                  {PROFILE_ORDERS.map((order) => (
                    <div 
                      key={order.code}
                      onClick={() => setSelectedOrder(order)}
                      className="group p-10 hover:bg-[#25303a] transition-all cursor-pointer flex flex-col md:flex-row justify-between gap-8"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#e5ad46] bg-[#e5ad46]/10 px-3 py-1 rounded-full">
                            {order.code}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                            order.status === 'production' ? 'bg-[#e5ad46] text-white' : 'bg-[#e5ad46]/5 text-[#e5ad46]'
                          }`}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-[#e5ad46] group-hover:text-[#e5ad46] transition-colors">{order.title}</h3>
                        <p className="text-sm text-[#e5ad46]/60 leading-relaxed max-w-md">{order.summary}</p>
                      </div>
                      <div className="flex flex-col justify-between items-end gap-6 text-right">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#e5ad46]/30">Prochaine étape</p>
                          <p className="text-sm font-bold text-[#e5ad46]">{order.nextStep}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-headline font-bold text-[#e5ad46]">{order.amount}</span>
                          <div className="w-10 h-10 bg-[#e5ad46]/5 rounded-full flex items-center justify-center text-[#e5ad46] group-hover:bg-[#e5ad46] group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications Section */}
              <div className="bg-[#25303a] rounded-[2.5rem] border border-[#e5ad46]/5 shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b border-[#e5ad46]/5">
                  <h2 className="font-headline text-2xl text-[#e5ad46] font-bold">Dernières alertes</h2>
                </div>
                <div className="p-4">
                  <ProblemHierarchyPanel
                    className="space-y-4"
                    mode="client"
                    problems={TEXTILE_PROBLEM_THREADS}
                    theme="dark"
                  />
                </div>
              </div>
            </div>

            {/* Right: Activity & Documents */}
            <div className="space-y-10">
              {/* Activity Card */}
              <div className="bg-[#25303a] rounded-[2.5rem] border border-[#e5ad46]/5 shadow-sm p-10">
                <h2 className="font-headline text-2xl text-[#e5ad46] font-bold mb-8">Activité</h2>
                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#e5ad46]/10">
                  {PROFILE_ACTIVITY.map((activity, idx) => (
                    <div className="relative pl-10" key={idx}>
                      <div className="absolute left-0 top-1.5 w-[23px] h-[23px] bg-[#25303a] border-2 border-[#e5ad46] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#e5ad46] rounded-full"></div>
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#e5ad46]/30 mb-1">{activity.date}</p>
                      <h4 className="text-sm font-bold text-[#e5ad46] mb-1">{activity.label}</h4>
                      <p className="text-xs text-[#e5ad46]/60 leading-relaxed">{activity.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents Card */}
              <div className="bg-[#1e2a38] rounded-[2.5rem] p-10 text-[#e5ad46] shadow-xl border border-[#e5ad46]/10">
                <h2 className="font-headline text-2xl font-bold mb-8">Documents</h2>
                <div className="space-y-4">
                  {PROFILE_DOCUMENTS.map((doc, idx) => (
                    <div key={idx} className="group p-5 bg-[#25303a]/20 rounded-2xl border border-[#e5ad46]/10 hover:bg-[#25303a]/40 transition-all flex items-center gap-4 cursor-pointer">
                      <div className="w-12 h-12 bg-[#e5ad46]/10 rounded-xl flex items-center justify-center text-[#e5ad46]">
                        <span className="material-symbols-outlined text-2xl">description</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate">{doc.title}</h4>
                        <p className="text-[10px] text-[#eccc90]/40 uppercase tracking-widest mt-1">Fichier stocké localement</p>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center border border-[#e5ad46]/20 group-hover:bg-[#e5ad46] group-hover:text-[#1e2a38] transition-all">
                        <span className="material-symbols-outlined text-sm">download</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-4 bg-[#25303a]/20 text-[#e5ad46] text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl border border-[#e5ad46]/10 hover:bg-[#25303a]/40 transition-all">
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
