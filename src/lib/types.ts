export interface User {
  id: number;
  email: string;
  username?: string;
  password?: string;
  name?: {
      firstname: string;
      lastname: string;
  };
  address?: {
      city: string;
      street: string;
      number: number;
      zipcode: string;
      geolocation: {
          lat: string;
          long: string;
      };
  };
  phone?: string;
}


export interface Rental {
    id?:string;
    name: string;
    address: string;
    flag?: boolean;
}