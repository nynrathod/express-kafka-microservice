import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("int", { default: 0 })
  version!: number;

  @Column({ type: "varchar", default: () => "uuid_generate_v4()" })
  productId!: string; // This is the UUID field

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column("decimal")
  price!: number;

  @Column("int")
  stock!: number;

  @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
  timestamp!: number; // Stores a timestamp with default value
}
