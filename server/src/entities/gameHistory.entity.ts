import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('game_history')
export class GameHistoryEntity {
  @PrimaryColumn('text')
  public id!: string;

  @Column('text', { name: 'player_id' })
  public playerId!: string;

  @Column('integer', { default: 10 })
  public credits!: number;
}
