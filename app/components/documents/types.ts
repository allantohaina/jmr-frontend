export type DocumentKind = "quote" | "purchase_order" | "delivery_note" | "invoice";

export type DocumentLineItem = {
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  taxRate?: number;
  reference?: string;
};

export type DocumentParty = {
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  taxId?: string;
};

export type DocumentSignature = {
  name: string;
  signedAt: string | Date;
};

export type TextileDocumentProps = {
  kind: DocumentKind;
  number: string;
  issuedAt: string | Date;
  client: DocumentParty;
  lines: DocumentLineItem[];
  currency?: string;
  status?: string;
  validUntil?: string | Date;
  orderReference?: string;
  deliveryAddress?: string;
  notes?: string;
  paymentTerms?: string;
  signature?: DocumentSignature;
  company?: Partial<DocumentParty>;
};
