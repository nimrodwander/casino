import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryColumn('text')
  id!: string;

  @Column('text', { name: 'user_id' })
  playerId!: string;

  @Column('integer', { default: 10 })
  credits!: number;

  @Column('boolean', { name: 'is_active', default: true })
  active!: boolean;
}
