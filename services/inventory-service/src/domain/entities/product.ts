export class Product {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public stock: number,
    public description?: string,
    public photoUrl?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  static restore(params: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    photoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    return new Product(
      params.id,
      params.name,
      params.price,
      params.stock,
      params.description,
      params.photoUrl,
      params.createdAt,
      params.updatedAt,
    );
  }

  static create(
    id: string,
    name: string,
    price: number,
    stock: number,
    description?: string,
    photoUrl?: string,
  ): Product {
    return new Product(
      id,
      name,
      price,
      stock,
      description,
      photoUrl,
      new Date(),
      new Date(),
    );
  }

  static update(params: {
    id: string;
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    photoUrl?: string;
  }): Product {
    return new Product(
      params.id,
      params.name ?? "",
      params.price ?? 0,
      params.stock ?? 0,
      params.description ?? "",
      params.photoUrl,
      new Date(),
      new Date(),
    );
  }

  static insertNewStock(params: { id: string; stockToAdd: number }): Product {
    return new Product(
      params.id,
      "",
      0,
      params.stockToAdd,
      "",
      undefined,
      new Date(),
      new Date(),
    );
  }

  static reduceStock(params: { id: string; stockToReduce: number }): Product {
    return new Product(
      params.id,
      "",
      0,
      -params.stockToReduce,
      "",
      undefined,
      new Date(),
      new Date(),
    );
  }
}
