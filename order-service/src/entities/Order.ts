import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column("int", { default: 1 })
  version!: number;

  @Column()
  userId!: string;

  @Column()
  orderId!: string;

  @Column("jsonb")
  products!: {
    productId: string;
    quantity: number;
  };

  @Column("decimal", { precision: 10, scale: 2 })
  totalPrice!: number;

  @Column({ default: "pending" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
