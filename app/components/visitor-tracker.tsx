"use client";

import { useEffect } from "react";

const ADJECTIVES = ["Curieux", "Créatif", "Rapide", "Sérieux", "Joyeux", "Précis", "Élégant", "Moderne"];
const NOUNS = ["Visiteur", "Explorateur", "Styliste", "Tailleur", "Designer", "Passionné", "Artisan", "Expert"];

function generatePseudonym() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 999);
  return `${adj} ${noun} #${num}`;
}

export function VisitorTracker() {
  useEffect(() => {
    // Check if visitor already has a pseudonym
    let visitorId = localStorage.getItem("jmr_visitor_id");
    
    if (!visitorId) {
      visitorId = generatePseudonym();
      localStorage.setItem("jmr_visitor_id", visitorId);
      console.log(`[VISITOR] Nouveau visiteur identifié : ${visitorId}`);
    } else {
      console.log(`[VISITOR] Bon retour, ${visitorId}`);
    }

    // Ici, on pourrait envoyer un "ping" au serveur pour dire que ce visiteur est en ligne
    // Pour le moment, on simule l'enregistrement
  }, []);

  return null; // Composant invisible
}
