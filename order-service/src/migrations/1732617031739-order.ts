import { MigrationInterface, QueryRunner } from "typeorm";

export class Order1732617031739 implements MigrationInterface {
    name = 'Order1732617031739'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "order" ("id" SERIAL NOT NULL, "version" integer NOT NULL DEFAULT '0', "userId" character varying NOT NULL, "orderId" character varying NOT NULL, "products" jsonb NOT NULL, "totalPrice" numeric(10,2) NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "order"`);
    }

}
