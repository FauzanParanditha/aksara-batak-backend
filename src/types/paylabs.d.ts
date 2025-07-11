export interface ResponsePaylabsLink {
  success: boolean;
  paymentLink: string;
}

export interface PaylabsPayload {
  items: ItemDetails[];
  totalAmount: string;
  phoneNumber: string;
  paymentMethod: string;
  storeId: string;
}

export interface ItemDetails {
  id: string;
  name: string;
  quantity: number;
  price: string;
  type: string;
}
