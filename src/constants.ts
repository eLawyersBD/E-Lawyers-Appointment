/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service } from './types';

export const SERVICES: Service[] = [
  {
    id: 'tax-1',
    title: 'Tax Consultation & Return',
    description: 'Expert advice on individual and corporate tax filings, including annual returns.',
    duration: '45 mins',
    category: 'Tax',
  },
  {
    id: 'vat-1',
    title: 'VAT Services',
    description: 'Comprehensive VAT registration, planning, and compliance for businesses.',
    duration: '45 mins',
    category: 'VAT',
  },
  {
    id: 'rjsc-1',
    title: 'RJSC / Company Matters',
    description: 'Assistance with company incorporation, name clearance, and annual filings.',
    duration: '60 mins',
    category: 'RJSC',
  },
  {
    id: 'license-1',
    title: 'Trade License & Renewals',
    description: 'End-to-end support for obtaining and renewing trade licenses and permissions.',
    duration: '30 mins',
    category: 'Licensing',
  },
  {
    id: 'audit-1',
    title: 'Audit & Accounting',
    description: 'External and internal audit services, bookkeeping, and financial reporting.',
    duration: '60 mins',
    category: 'Audit',
  },
  {
    id: 'legal-1',
    title: 'Legal Drafting',
    description: 'Professional drafting of contracts, deeds, agreements, and legal notices.',
    duration: 'Survey based',
    category: 'Legal',
  },
  {
    id: 'compliance-1',
    title: 'Corporate Compliance',
    description: 'Ensuring your business meets all local regulatory and legal requirements.',
    duration: 'Ongoing',
    category: 'Corporate',
  },
  {
    id: 'case-1',
    title: 'Case Consultation',
    description: 'Initial consultation regarding civil or criminal legal matters.',
    duration: '30 mins',
    category: 'Legal',
  },
  {
    id: 'doc-review-1',
    title: 'Document Review',
    description: 'Thorough review of legal documents to identify risks and ensure accuracy.',
    duration: 'Time based',
    category: 'Legal',
  },
];

export const CITIES = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Other',
];

export const CATEGORIES = [...new Set(SERVICES.map((s) => s.category))];

export const FAQS = [
  {
    question: 'How to book an appointment?',
    answer: 'Simply select a service from our services section or fill out the booking form below. Our team will contact you to confirm the time slot.',
  },
  {
    question: 'What documents are required?',
    answer: 'Required documents vary by service. For tax, you might need income statements. For RJSC, you need IDs and signatures. Specific details are provided after booking.',
  },
  {
    question: 'Is online consultation available?',
    answer: 'Yes, we offer consultations via Video Call (Zoom/Meet) and Phone Call for your convenience.',
  },
  {
    question: 'What are the payment methods?',
    answer: 'We accept bank transfers, mobile financial services (bKash/Nagad), and cash for in-person visits.',
  },
  {
    question: 'Can I reschedule my booking?',
    answer: 'Yes, you can reschedule at least 24 hours in advance by contacting our support team via phone or email.',
  },
];

export const STAFF_MEMBERS = [
  'Adv. MD. Tanvir',
  'Adv. S. Rahman',
  'Adv. K. Islam',
  'Adv. M. Ahmed',
  'Admin Support',
];
