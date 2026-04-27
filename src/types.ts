/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ConsultationType = 'In-person' | 'Video Call' | 'Phone Call' | 'Document Review';
export type PriorityType = 'Normal' | 'Urgent' | 'Very Urgent';
export type BookingStatus = 'Pending' | 'Approved' | 'In-Progress' | 'Completed' | 'Cancelled' | 'Closed';

export interface Service {
  id: string;
  title: string;
  description: string;
  duration: string;
  price?: string;
  category: string;
}

export interface Booking {
  id?: string;
  name: string;
  phone: string;
  email: string;
  companyName?: string;
  city: string;
  serviceCategory: string;
  subService: string;
  consultationType: ConsultationType;
  priority: PriorityType;
  date: string;
  time: string;
  description: string;
  conditionalData: Record<string, any>;
  fileURLs: string[];
  status: BookingStatus;
  createdAt: number;
  assignedStaff?: string;
}
