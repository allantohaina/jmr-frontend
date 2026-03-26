"use client";

import Image from "next/image";
import { useState } from "react";

type PaymentMethodId = "mobile-money" | "credit-card";

type PaymentMethod = {
  id: PaymentMethodId;
  buttonLabel: string;
  icon: string;
  alt: string;
};

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "mobile-money",
    buttonLabel: "Mobile Money",
    icon: "/mobile_phone.svg",
    alt: "Paiement mobile money",
  },
  {
    id: "credit-card",
    buttonLabel: "Banque",
    icon: "/credit_card_payment.svg",
    alt: "Paiement par banque",
  },
];

export function DepositPaymentSelector() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("mobile-money");

  return (
    <section className="project-payment-page__methods" aria-label="Mode de paiement">
      <p className="project-payment-page__methods-title">Veuillez selectionner le mode de paiement :</p>

      <div className="project-payment-options" role="list" aria-label="Choix du paiement de l'acompte">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = method.id === selectedMethod;

          return (
            <button
              key={method.id}
              className={`project-payment-option${isSelected ? " is-active" : ""}`}
              type="button"
              onClick={() => setSelectedMethod(method.id)}
            >
              <span className="project-payment-option__icon">
                <Image src={method.icon} alt={method.alt} width={90} height={90} />
              </span>
              <span className="project-payment-option__label">{method.buttonLabel}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
