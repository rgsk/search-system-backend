export class Country {
  static tableName = "countries";
  uuid: number;
  name: string;
  name_alt: string;
  latin: string;
  location: string;
  date: string;
  constructor({
    uuid,
    name,
    name_alt,
    latin,
    location,
    date,
  }: {
    uuid: number;
    name: string;
    name_alt: string;
    latin: string;
    location: string;
    date: string;
  }) {
    this.uuid = uuid;
    this.name = name;
    this.name_alt = name_alt;
    this.latin = latin;
    this.location = location;
    this.date = date;
  }
}
