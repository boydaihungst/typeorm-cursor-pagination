import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';

import { User } from './User';

@Entity({ name: 'address' })
export class Address {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  public country!: string;

  @OneToOne(() => User, (user) => user.address)
  public user!: User;
}
