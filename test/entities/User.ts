import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Address } from './Address';

import { Photo } from './Photo';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  public name!: string;

  @Column({
    type: 'timestamp',
    nullable: false,
  })
  public timestamp!: Date;

  @OneToMany(() => Photo, (photo) => photo.user, {
    cascade: true,
  })
  public photos!: Photo[];

  @OneToOne(() => Address, (address) => address.user, {
    cascade: true,
  })
  @JoinColumn()
  public address!: Address;

  @CreateDateColumn()
  createdAt!: Date;
}
