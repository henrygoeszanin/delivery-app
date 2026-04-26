export type CustomerProps = {
  id: string;
  name: string;
  telephone: string;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class Customer {
  constructor(
    public id: string,
    public name: string,
    public telephone: string,
    public address: string | null,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  static restore(props: CustomerProps): Customer {
    return new Customer(
      props.id,
      props.name,
      props.telephone,
      props.address ?? null,
      props.createdAt,
      props.updatedAt,
    );
  }

  static create(name: string, telephone: string): Customer {
    const id = crypto.randomUUID();
    const now = new Date();

    return new Customer(id, name, telephone, null, now, now);
  }

  setAddress(address: string) {
    this.address = address;
    this.updatedAt = new Date();
  }
}
