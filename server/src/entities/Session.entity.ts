import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('sessions')
export class SessionEntity {
  @PrimaryColumn('text')
  public id!: string;

  @Column('text', { name: 'user_id' })
  public playerId!: string;

  @Column('integer', { default: 10 })
  public credits!: number;

  @Column('boolean', { name: 'is_active', default: true })
  public active!: boolean;
}
