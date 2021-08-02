export class Address {
  unit_complex: string;
  line1: string;
  line2: string;
  province: string;
  country: string;
  postal_code: string;
  latitude: string;
  longitude: string;
  plus_code: string;
  constructor(
    unit_complex: string,
    line1: string,
    line2: string,
    province: string,
    country: string,
    postal_code: string,
    latitude: string,
    longitude: string,
    plus_code: string) {
      this.unit_complex = unit_complex;
      this.line1 = line1;
      this.line2 = line2;
      this.province = province;
      this.country = country;
      this.postal_code = postal_code;
      this.latitude = latitude;
      this.longitude = longitude;
      this.plus_code = plus_code;
    }
}
